import { RoleModule } from 'src/role/role.module';
import { UserModule } from '../user/user.module';
import { HotelModule } from '../hotel/hotel.module';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { AddressModule } from '../address/address.module';

export const modules = [
  UserModule,
  RoleModule,
  HotelModule,
  HotelRoomModule,
  AddressModule,
];
