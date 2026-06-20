import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateBodyUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  const createUserBody: CreateBodyUserDto = {
    firstName: { th: 'จอห์น', en: 'John' },
    lastName: { th: 'โด', en: 'Doe' },
    phoneNumber: '1234567890',
    addressDetail: {
      country: 'United States',
      province: 'California',
      district: 'Los Angeles',
      subDistrict: 'West Los Angeles',
      postalCode: '90001',
      detail: '123 Main St',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('createUser: returns success message and data', async () => {
    const result = await controller.createUser(createUserBody);
    expect(result.message).toBe('User created successfully');
    expect(result.data).toEqual({ raw: { affected: 1 } });
  });

  it('createUser: throws when service throws', async () => {
    jest
      .spyOn(userService, 'createUser')
      .mockRejectedValueOnce(new Error('Test error'));
    await expect(controller.createUser(createUserBody)).rejects.toThrow(Error);
  });
});
