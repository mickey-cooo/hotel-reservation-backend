import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { BookingEntity } from '../database/booking.entity';

export const ACTIVE_BOOKING_STATUSES = [
  HotelBookingStatus.BOOKED,
  HotelBookingStatus.AWAITING_PAYMENT,
  HotelBookingStatus.AWAITING_CONFIRMATION,
  HotelBookingStatus.CONFIRMED,
];

export function excludeRoomsWithOverlappingBooking<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  roomAlias: string,
  range: { checkInDate: string; checkOutDate: string },
): SelectQueryBuilder<T> {
  return qb.andWhere(
    (sub) => {
      const subQuery = sub
        .subQuery()
        .select('1')
        .from(BookingEntity, 'b')
        .where(`b.hotelRoom = ${roomAlias}.id`)
        .andWhere('b.status IN (:...activeStatuses)')
        .andWhere('b.checkInDate < :checkOutDate')
        .andWhere('b.checkOutDate > :checkInDate')
        .getQuery();
      return `NOT EXISTS ${subQuery}`;
    },
    {
      activeStatuses: ACTIVE_BOOKING_STATUSES,
      checkInDate: range.checkInDate,
      checkOutDate: range.checkOutDate,
    },
  );
}

export function parseAmenitiesFilter(amenities: string): string[] {
  return amenities.split(',').map((a) => a.trim());
}
