import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('createUser: returns success message and data', async () => {
    const result = await controller.createUser({} as any);
    expect(result.message).toBe('User created successfully');
    expect(result.data).toEqual({ raw: { affected: 1 } });
  });

  it('createUser: throws when service throws', async () => {
    jest
      .spyOn(userService, 'createUser')
      .mockRejectedValueOnce(new Error('Test error'));
    await expect(controller.createUser({} as any)).rejects.toThrow(Error);
  });
});
