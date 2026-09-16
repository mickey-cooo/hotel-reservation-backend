import { HotelBookingStatus } from '../enum/hotel.booking.status';

export const ACTIVE_BOOKING_STATUSES = [
  HotelBookingStatus.BOOKED,
  HotelBookingStatus.AWAITING_PAYMENT,
  HotelBookingStatus.AWAITING_CONFIRMATION,
  HotelBookingStatus.CONFIRMED,
];

export function roomOverlapsBookingCondition(roomAlias: string): string {
  return `NOT EXISTS (
    SELECT 1 FROM booking b
    WHERE b.hotel_room_id = ${roomAlias}.id
      AND b.status IN (:...activeStatuses)
      AND b."checkInDate" < :checkOutDate
      AND b."checkOutDate" > :checkInDate
  )`;
}

export function parseAmenitiesFilter(amenities: string): string[] {
  return amenities.split(',').map((a) => a.trim());
}
