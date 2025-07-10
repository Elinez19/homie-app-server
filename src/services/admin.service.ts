import { UserRole, UserStatus } from '../generated/prisma';
import { prisma } from '../config/database.config';
import bcrypt from 'bcrypt';
import jwtUtils from '../utils/jwtUtils';
import {
  AdminLoginParams,
  AdminRegisterParams,
  AdminUpdateParams,
  AdminResponse,
  UserManagementParams,
  AdminManagementParams
} from '../@types/admin.types';

export const loginAdmin = async ({ email, password }: AdminLoginParams): Promise<AdminResponse> => {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Check if user is an admin
    if (admin.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Check if account is suspended
    if (admin.status === UserStatus.SUSPENDED) {
      throw new Error('Account is suspended. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = jwtUtils.generateTokens(admin);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: admin.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return {
      success: true,
      message: 'Admin login successful',
      tokens,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        status: admin.status
      }
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutAdmin = async (refreshToken: string): Promise<AdminResponse> => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    return {
      success: true,
      message: 'Admin logout successful'
    };
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
};

export const fetchAdmin = async (adminId: string): Promise<AdminResponse> => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return {
      success: true,
      message: 'Admin profile retrieved successfully',
      data: admin
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch admin: ${error.message}`);
  }
};

export const createSubAdmin = async (params: AdminRegisterParams): Promise<AdminResponse> => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);

    const subAdmin = await prisma.user.create({
      data: {
        email: params.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: params.firstName,
        lastName: params.lastName,
        phoneNumber: params.phoneNumber,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true
      }
    });

    return {
      success: true,
      message: 'Sub-admin created successfully',
      data: {
        id: subAdmin.id,
        email: subAdmin.email,
        firstName: subAdmin.firstName,
        lastName: subAdmin.lastName,
        role: subAdmin.role
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to create sub-admin: ${error.message}`);
  }
};

export const updateSubAdmin = async (adminId: string, params: AdminUpdateParams): Promise<AdminResponse> => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.role !== UserRole.ADMIN) {
      throw new Error('User is not an admin');
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: {
        firstName: params.firstName,
        lastName: params.lastName,
        phoneNumber: params.phoneNumber,
        email: params.email?.toLowerCase()
      }
    });

    return {
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        role: updatedAdmin.role
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to update admin: ${error.message}`);
  }
};

export const toggleSuspendAdmin = async ({ adminId, action }: AdminManagementParams): Promise<AdminResponse> => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.role !== UserRole.ADMIN) {
      throw new Error('User is not an admin');
    }

    const newStatus = action === 'suspend' ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: { status: newStatus }
    });

    return {
      success: true,
      message: `Admin ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
      data: {
        id: updatedAdmin.id,
        status: updatedAdmin.status
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to ${action} admin: ${error.message}`);
  }
};

export const deleteSubAdmin = async (adminId: string): Promise<AdminResponse> => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.role !== UserRole.ADMIN) {
      throw new Error('Can only delete admins');
    }

    await prisma.user.delete({
      where: { id: adminId }
    });

    return {
      success: true,
      message: 'Sub-admin deleted successfully'
    };
  } catch (error: any) {
    throw new Error(`Failed to delete sub-admin: ${error.message}`);
  }
};

export const fetchAllUsers = async (): Promise<AdminResponse> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        artisan: {
          select: {
            id: true,
            businessName: true,
            serviceCategories: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

export const fetchSingleUser = async (userId: string): Promise<AdminResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artisan: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const toggleSuspendAccount = async ({ userId, action }: UserManagementParams): Promise<AdminResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newStatus = action === 'suspend' ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    });

    return {
      success: true,
      message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
      data: {
        id: updatedUser.id,
        status: updatedUser.status
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to ${action} user: ${error.message}`);
  }
};

export const requestAccessToken = async (refreshToken: string): Promise<AdminResponse> => {
  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id }
      });
      throw new Error('Refresh token expired');
    }

    // Check if user is an admin
    if (tokenRecord.user.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Generate new tokens
    const tokens = jwtUtils.generateTokens(tokenRecord.user);

    // Update refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return {
      success: true,
      message: 'Access token refreshed successfully',
      tokens
    };
  } catch (error: any) {
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
}; 