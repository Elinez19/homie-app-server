import { User, UserRole, UserStatus, ServiceProviderStatus } from '../generated/prisma/index';
import { hash, compare } from 'bcrypt';
import { sign, SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config/app.config';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../utils/appError';
import { ProviderEnum } from '../enums/account-provider.enum';
import { prisma } from '../config/database.config';

interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

interface ServiceProviderInput {
  businessName: string;
  businessLicense: string;
  taxId?: string;
  serviceCategories: string[];
  serviceAreas: string[];
  description?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  qualifications?: string[];
}

interface OAuthLoginInput {
  provider: typeof ProviderEnum[keyof typeof ProviderEnum];
  providerId: string;
  email: string;
  displayName: string;
  picture?: string;
}

export const registerUserService = async (data: RegisterUserInput) => {
  const { email, password, firstName, lastName, phoneNumber, role = UserRole.CUSTOMER } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new BadRequestException('Email already exists');
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phoneNumber,
      role,
      status: UserStatus.PENDING
    }
  });

  // Create refresh token
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: generateRefreshToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    },
    refreshToken: refreshToken.token
  };
};

export const registerServiceProviderService = async (userId: string, data: ServiceProviderInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { serviceProvider: true }
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.serviceProvider) {
    throw new BadRequestException('User is already a service provider');
  }

  // Update user role to SERVICE_PROVIDER
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: UserRole.SERVICE_PROVIDER,
      serviceProvider: {
        create: {
          businessName: data.businessName,
          businessLicense: data.businessLicense,
          taxId: data.taxId,
          serviceCategories: data.serviceCategories,
          serviceAreas: data.serviceAreas,
          description: data.description,
          hourlyRate: data.hourlyRate,
          yearsOfExperience: data.yearsOfExperience,
          qualifications: data.qualifications,
          status: ServiceProviderStatus.PENDING_VERIFICATION
        }
      }
    },
    include: {
      serviceProvider: true
    }
  });

  return updatedUser;
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordValid = await compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
    throw new UnauthorizedException('Your account has been suspended or banned');
  }

  // Create refresh token
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: generateRefreshToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  // Create access token
  const accessToken = generateAccessToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    },
    accessToken,
    refreshToken: refreshToken.token
  };
};

export const refreshTokenService = async (token: string) => {
  const refreshTokenRecord = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  const user = refreshTokenRecord.user;

  // Delete old refresh token
  await prisma.refreshToken.delete({
    where: { id: refreshTokenRecord.id }
  });

  // Create new refresh token
  const newRefreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: generateRefreshToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  // Create new access token
  const accessToken = generateAccessToken(user);

  return {
    accessToken,
    refreshToken: newRefreshToken.token
  };
};

export const logoutService = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
};

export const loginOrCreateAccountService = async (data: OAuthLoginInput) => {
  const { provider, providerId, email, displayName, picture } = data;

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Create new user
    const [firstName, ...lastNameParts] = displayName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: '', // OAuth users don't have passwords
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        profilePicture: picture
      }
    });
  }

  // Create refresh token
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: generateRefreshToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    },
    refreshToken: refreshToken.token
  };
};

export const verifyUserService = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new UnauthorizedException('Please login with your OAuth provider');
  }

  const isPasswordValid = await compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
    throw new UnauthorizedException('Your account has been suspended or banned');
  }

  return user;
};

function generateRefreshToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateAccessToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const secret: Secret = config.JWT_SECRET;
  
  return sign(payload, secret, { 
    expiresIn: config.JWT_EXPIRES_IN as "1h" | "2h" | "4h" | "8h" | "12h" | "24h"
  });
}
