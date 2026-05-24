import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let jwtService: { signAsync: jest.Mock };
  let compareMock: jest.Mock;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    compareMock = bcrypt.compare as jest.Mock;
    compareMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return access_token when credentials are valid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@email.com',
      password: 'hashed-password',
    });
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(service.signIn('admin@email.com', '123456')).resolves.toEqual({
      access_token: 'jwt-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'admin@email.com',
    });
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.signIn('missing@email.com', '123456')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(compareMock).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@email.com',
      password: 'hashed-password',
    });
    compareMock.mockResolvedValue(false);

    await expect(service.signIn('admin@email.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
