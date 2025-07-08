import { BadRequestException } from "../utils/appError";
import { prisma } from '../config/database.config';

export const getCurrentUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      profilePicture: true,
      phoneNumber: true
    }
  });

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return { user };
};
