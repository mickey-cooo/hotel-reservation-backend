# Handoff: Hotel/Hotel-Room Search Filters (guests, price, amenities, date-range)

**Generated**: 2026-09-16
**Branch**: main
**Status**: In Progress (uncommitted, not built/tested this session)

## Goal

Extend hotel and hotel-room list endpoints with richer search filters: guest count/type, room count, price ceiling, amenities, name search, and check-in/check-out date-range availability. No prior conversation in this session describes intent beyond what the working-tree diff shows — this handoff is reconstructed from `git diff` since work predates this session's chat history.

## Completed

- [x] `HotelRoomQueryParamsDto` (`src/hotel-room/dto/hotel-room-query.dto.ts`): added `price?: number`, `amenities?: string` (comma-separated list), `@Type(() => Number)` on numeric query params (needed because query strings arrive as strings).
- [x] `HotelRoomBodyParamsDto.ids` made optional (`src/hotel-room/dto/hotel-room-params.dto.ts`) — list endpoint can be called with no body.
- [x] `HotelRoomController` (`src/hotel-room/hotel-room.controller.ts`): moved `@UseGuards(AuthGuard)` off the class and onto `create`/`update`/`delete` only — `/hotel-room/list` and presumably `/hotel-room/:id` (unchanged) are now public. `findAllHotelRooms` body param typed `| undefined`.
- [x] `HotelRoomService.findAllHotelRooms` (`src/hotel-room/hotel-room.service.ts`) rewritten from three sequential exists-checks (guestNumber query, roomCount query, then a final id-based query) into one `QueryBuilder` chain with `andWhere` clauses added conditionally for: `ids`, `hotel_id`, `guestNumber` (capacity), `price` (`<=`), `amenities` (Postgres array-contains via `hr.amenities::text[] @> :amenities::text[]`), and a `NOT EXISTS` subquery against `booking` for date-range overlap excluding `CANCELLED` bookings.
- [x] New enum `src/enum/guest.type.ts`: `GuestType { ADULT = 'adult', CHILD = 'child' }`.
- [x] `GuestDto` and `QueryHotelDto` extended (`src/hotel/dto/hotel-params.dto.ts`): added `ids`, `name`, `checkInDate`, `checkOutDate`, `guests?: GuestDto[]` (nested, validated), `rooms?: number`.
- [x] `.env.example`: blanked out default `DB_USERNAME`/`DB_PASSWORD` (was `postgres`/`postgres`).
- [x] `.gitignore`: added `.agents/`.

## Not Yet Done

- [ ] `HotelService.findAllHotels` query building (`src/hotel/hotel.service.ts`) does not use the new `guests`/`rooms` DTO fields at all — added to DTO but never read in the service.
- [ ] Roomcount filter (`query.roomCount`) is declared on `HotelRoomQueryParamsDto` but the rewritten `findAllHotelRooms` query builder never applies it (old code applied `hr.rooms >= :rooms`; new chain dropped that clause — check if intentional or dropped by mistake during the rewrite).
- [ ] No test run yet — `yarn test` / `yarn build` not executed against these changes this session.
- [ ] Nothing staged/committed.

## Key Decisions

| Decision | Rationale (inferred from diff, not confirmed with user) |
|----------|----------|
| Single QueryBuilder chain instead of 3 sequential queries | Old code ran up to 3 separate DB round-trips just to build an id list, then a 4th query for final rows; collapsing to one query with conditional `andWhere` is fewer round-trips and composes filters (AND instead of overwriting `param.ids`) |
| `/hotel-room/list` made guard-free | `HotelRoomBodyParamsDto.ids` also made optional — suggests list is meant to be a public search endpoint (matches project convention: hotel/hotel-room/address listed as public in CLAUDE.md), guard kept only on create/update/delete |
| Date-range overlap via `NOT EXISTS` subquery excluding `CANCELLED` | Standard interval-overlap check (`start < otherEnd AND end > otherStart`); only `CANCELLED` bookings are excluded from blocking a room — other non-cancelled statuses (e.g. `AWAITING_PAYMENT`, `PENDING`) still block, worth confirming against `HotelBookingStatus` enum values |

## Current State

**Working**: Not verified — no build/test run this session.

**Broken / suspicious** (found while reading the diff, unconfirmed by running code):
1. `src/hotel/hotel.service.ts` new block:
   ```ts
   if (query.name) {
     hotel.andWhere('h.name LIKE :name', {
       name: `%${query.name}`,
     });
   }

   if (query.checkInDate && query.checkOutDate) {
     hotel.andWhere('h.checkInDate < checkOutDate', {
       query,
     });
   }
   ```
   - `name` filter: pattern is `%value` (prefix wildcard missing) — probably meant `` `%${query.name}%` `` for a contains-search.
   - `checkInDate`/`checkOutDate` block: raw SQL `'h.checkInDate < checkOutDate'` has no `:` placeholders and passes `{ query }` as the params object — TypeORM will not substitute anything here, `checkOutDate` will be treated as a bare (nonexistent) SQL identifier, not a bound param. Also `HotelEntity` filtering by hotel-level check-in/out doesn't match the domain (availability is per hotel-room, per `HotelRoomService` above, not per hotel). This looks unfinished/incorrect — needs rewrite or removal before shipping.

**Uncommitted Changes**: all changes listed under Completed are unstaged, nothing committed. Untracked: `src/enum/guest.type.ts`, `skills-lock.json` (skills-lock.json is tooling metadata, unrelated to this feature — do not include in the feature commit).

## Files to Know

| File | Why It Matters |
|------|----------------|
| `src/hotel-room/hotel-room.service.ts` | `findAllHotelRooms` — the rewritten query builder, main logic change |
| `src/hotel-room/dto/hotel-room-query.dto.ts` | New `price`/`amenities` query fields, `@Type(() => Number)` coercion |
| `src/hotel-room/hotel-room.controller.ts` | Guard moved from class-level to individual mutating routes |
| `src/hotel/dto/hotel-params.dto.ts` | `GuestDto`, extended `QueryHotelDto` — fields not yet consumed by service |
| `src/hotel/hotel.service.ts` | Contains the two suspicious `andWhere` clauses above — fix before considering done |
| `src/enum/guest.type.ts` | New enum, currently only referenced by `GuestDto.type` |

## Resume Instructions

1. Read `src/hotel/hotel.service.ts` around the `query.name` / `query.checkInDate` block (search for `h.name LIKE`) and fix the two issues under **Broken / suspicious** above — likely: `name: `%${query.name}%`` and a proper parameterized clause, e.g. joining to `hotel_room`/`booking` similarly to `HotelRoomService`, or removing the block if hotel-level date filtering isn't actually wanted (ask user which).
2. Decide whether `roomCount` filtering should be restored in `HotelRoomService.findAllHotelRooms` (compare against the pre-rewrite version via `git diff` shown above) — add `if (query.roomCount) roomsQuery.andWhere('hr.rooms >= :rooms', { rooms: query.roomCount })` if still wanted.
3. Wire `QueryHotelDto.guests`/`rooms` into `HotelService.findAllHotels` if the hotel-list endpoint is meant to filter by guest capacity/room count too, or confirm these DTO fields are meant only for a different (not-yet-written) endpoint.
4. Run `yarn build` then `yarn test` — expect no TypeScript errors; watch for `class-validator`/`class-transformer` issues on the new `@Type(() => Number)` and nested `GuestDto` validation.
5. Manually hit `GET /api/v1/hotel-room/list?price=1000&amenities=wifi,pool&guestNumber=2` against a running instance (`yarn start:dev`) and confirm it returns filtered rows without auth (guard was removed from this route).
6. Once verified, stage and commit per project convention (`git-cz`, one commit per logical module — likely split into a `hotel-room` commit and a `hotel` commit; leave `skills-lock.json` out unless asked).

## Warnings

- `HotelRoomQueryParamsDto.hotel_id` is typed `string[]` but decorated with `@IsString()` (not `@IsArray()`) — pre-existing, not introduced by this diff, but will reject/mis-validate array input if actually sent as an array. Not this session's bug but visible in the file being edited.
- `/hotel-room/list` losing its class-level `AuthGuard` is a behavior change with security surface — confirm this is intentional (public search) before shipping, per project note that hotel/hotel-room listing is meant to be public but this was previously guarded.
- `.env.example` password/username now blank — anyone re-copying `.env.example` to `.env` needs to know local Postgres creds aren't `postgres`/`postgres` anymore.
