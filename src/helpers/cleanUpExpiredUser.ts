import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupParams {
  id: string;
}

export const cleanupTokensAfterFailedEmailMessage = async ({ id }: CleanupParams) => {
  try {
    // Delete any auth tokens for this user
    await prisma.authToken.deleteMany({
      where: { userId: id }
    });

    // Delete any refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: id }
    });

    // Delete the user if they haven't verified their email yet
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (user && !user.isEmailVerified) {
      await prisma.user.delete({
        where: { id }
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw new Error('Failed to cleanup after email error');
  }
};
