# Session Progress Log

**Date:** 2026-09-16
**Branch:** main (all changes uncommitted at time of writing)

## Goal

Started from a gap analysis of missing hotel-reservation services, then focused on fixing an in-progress hotel/hotel-room search-filter feature that was crashing (`findAllHotel` referenced columns that don't exist on `HotelEntity`), and iterated through two rounds of automated code review, fixing everything each pass surfaced.

## 1. Service gap analysis (no code changes)

Compared existing modules (`user`, `hotel`, `hotel-room`, `hotel-booking`, `hotel-review`, `payment`, `payment-log`, `chat`, `stripe`, `cron`, `mail`, `logger`, `address`, `role`) against a typical hotel-reservation domain. Missing:

- Notification module (in-app/push — only email + chat exist)
- Coupon/promotion module
- Wishlist/favorite module
- Media/upload module (no multer config, no S3/Cloudinary — no lib in `package.json`)
- Admin/report/dashboard module (revenue, occupancy)
- Action-level audit log (only generic `LoggerEntity` system log exists)
- Self-serve cancellation with tiered refund policy (cron `refundPayment` only handles the 48h-pending-payment case)
- Health-check (`@nestjs/terminus`, `/health`) — absent
- Rate limiting (`@nestjs/throttler`) — absent
- Amenity as a reference entity instead of a raw enum array column (minor)

Proposed phased roadmap (not implemented, backlog only):
1. Infra hardening — health-check, rate limiting
2. Core commerce — coupon/promo, self-serve cancellation/refund
3. Engagement — notifications, wishlist
4. Media & ops — upload module, admin reports
5. Governance — audit log, amenity reference entity

## 2. Hotel/hotel-room search filter bug fixes

The working tree already had an in-progress feature (from a prior session) adding `price`/`rating`/`amenities`/`name`/`checkInDate`/`checkOutDate`/`guests`/`rooms` filters to `GET/POST hotel` and `hotel-room` list endpoints. It crashed on any of these params. Root cause and fixes:

- `hotel.service.ts::findAllHotel` referenced `h.price`, `h.rating`, `h.amenities`, `h.checkInDate` — none of those columns exist on `HotelEntity` (price/amenities live on `hotel_room`, rating is derived from `hotel_review`, dates live on `booking`). Rewrote each filter to query the correct table/relation.
- `name` filter was missing the trailing `%` wildcard (`LIKE '%value'` instead of `'%value%'`).
- Date-range availability filter needed a `NOT EXISTS` correlated subquery against `booking`, guarding against SQL-injection-shaped raw string interpolation by using bound parameters throughout.

## 3. First code-review pass — findings fixed

- Booking-overlap check excluded only `CANCELLED` bookings, leaving rooms freed by the `EXPIRED`/`REFUNDED` cron jobs stuck as unavailable. Switched to an explicit active-status allowlist (`BOOKED`, `AWAITING_PAYMENT`, `AWAITING_CONFIRMATION`, `CONFIRMED`), matching an existing pattern already used elsewhere in `hotel-room.service.ts`. Fixed in both `hotel.service.ts` and `hotel-room.service.ts`.
- Rating-average subquery counted soft-deleted (`deletedAt`) reviews.
- Deferred (flagged, not fixed in this pass): `guests`/`rooms` filters unused by the service; app-wide missing `ValidationPipe`; pagination row fan-out from the `rooms` join; duplicated SQL fragment across two services.

## 4. "Fix all" pass — the deferred items

- **Wired `guests`/`rooms`**: `guests` sums to a required room capacity; `rooms` requires at least that many available rooms per hotel via a correlated `COUNT` subquery.
- **Global `ValidationPipe`**: added `app.useGlobalPipes(new ValidationPipe({ transform: true }))` in `main.ts`. This is the single highest-blast-radius change in the session — every `class-validator` decorator across ~40 DTOs went from silently inert to actually enforced.
- **Pagination fan-out fix**: `findAllHotel` no longer joins `rooms` with `SELECT`/pagination in the same query (a hotel with N matching rooms was producing N raw rows before `LIMIT`/`OFFSET`, corrupting `totalItems` and page boundaries). Now: a `DISTINCT` id-only query drives pagination, then a second query re-hydrates full relations for just that page's ids.
- **Extracted shared SQL**: `src/helper/room-availability.helper.ts` (`ACTIVE_BOOKING_STATUSES`, `roomOverlapsBookingCondition`, `parseAmenitiesFilter`), reused by both `hotel.service.ts` and `hotel-room.service.ts`.
- Verified via `yarn build`, `yarn lint`, `yarn test` (pre-existing broken DI-wiring test suite, confirmed identical failure count before/after via `git stash` comparison — not a regression), and live `curl` smoke tests against the running dev server.

## 5. Second code-review pass — findings fixed

The `ValidationPipe` rollout was flagged as high-risk with two concretely-verified broken DTOs cited as examples. Rather than patch just those two, audited **all 40 DTO files** in the project for decorator/type mismatches. Found and fixed:

- `create-user.dto.ts` / `update-user.dto.ts`: `firstName`/`lastName` are `{ th, en }` objects but were decorated `@IsString()` — would reject every registration/update. Added a proper `UserNameDto` class (`src/user/dto/user-name.dto.ts`) with `@ValidateNested()` + `@Type(() => UserNameDto)`.
- Same files: `phoneNumber` had `@Max(10)` (a *numeric* validator) on a string field — always fails for any string. Changed to `@MaxLength(10)`.
- `create-payment.dto.ts`: `cardNumber`/`cardCvv` had `@Max`/`@Min` on string fields — same bug, would break every payment creation. Changed to `@Length(15, 15)` / `@Length(3, 3)`.
- `authenticate.dto.ts`: `password`/`confirmPassword` had `@Min(8)` — same bug, would break every registration. Changed to `@MinLength(8)`.
- `create-hotel-booking.dto.ts` / `update-hotel-booking.dto.ts`: `@IsDate()` with no `@Type(() => Date)` — an ISO date string never converts to a `Date` instance without it, so validation always failed. Added `@Type(() => Date)`.
- All 5 fixes verified directly against `class-validator`/`class-transformer` (not just `yarn build`) via a throwaway script exercising `plainToInstance` + `validate` on each DTO with both valid and invalid payloads.

Other findings from the same pass:
- `hotel-room.service.ts`: a leftover unconditional "any active booking blocks this room" post-filter was undermining the new precise date-range `NOT EXISTS` check — a room booked on unrelated dates was still being hidden. Now only runs when no date range was requested.
- `hotel.service.ts`: the pagination-hydration re-fetch wasn't reapplying room-level filters, so a hotel's `rooms` array included every room, not just the ones that matched price/date/capacity. Extracted `applyHotelSearchFilters()` and reused it for both the id-selection query and the hydration query.
- Guard placement on `hotel-room` create/update/delete was flagged as contradicting `CLAUDE.md`'s "hotel-room is fully public" note. Kept the guards (public mutation of inventory would be a real hole) and corrected the doc instead.
- Deduplicated the hardcoded booking-status array and the amenities CSV-parsing one-liner (moved into the shared helper).
- Fixed `QueryHotelDto` TS type/optionality mismatches (`ids`, `name`, `checkInDate`, `checkOutDate` typed as required despite being `@IsOptional()` and used optionally everywhere).

## 6. Verification

- `yarn build` / `yarn lint`: clean after every round.
- `yarn test`: unit suite fails identically before and after all changes (20 suites / 26 tests — pre-existing broken TypeORM DI wiring in test setup, unrelated to this work; confirmed via `git stash` A/B comparison).
- Live smoke tests via `curl` against the running `yarn start:dev` server for every filter combination, pagination edge cases, malformed-date 400s, single-vs-array query param handling, and the room-narrowing fix.
- Direct `class-validator` validation checks (bypassing `AuthGuard`) for the 5 DTOs that had the "wrong validator type" bug.

## Not done / open items

- The Phase 1-5 roadmap in section 1 is backlog only, nothing implemented.
- No e2e test suite run (`yarn test:e2e`) — relied on live manual smoke testing instead.
- The pre-existing broken unit test suite (DI wiring) was not repaired — out of scope for this session, flagged as-is.
- `guests`/`rooms`/date-range filters have no automated test coverage; verified manually only.
