import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { HotelModule } from '../hotel/hotel.module';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { AddressModule } from '../address/address.module';
import { ResetPasswordEntity } from '../database/reset-password.entity';

export const modules = [
  UserModule,
  RoleModule,
  HotelModule,
  HotelRoomModule,
  AddressModule,
  ResetPasswordEntity,
];
