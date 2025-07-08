import { prisma } from '../config/database.config';
import { AuthToken, User } from '../generated/prisma';

// Cleanup expired exam attempts and unverified users for CBT platform
export const cleanUpExpiredAttempts = async () => {
	try {
		const expiredAttempts = await prisma.authToken.findMany({
			where: {
				expiresAt: {
					lt: new Date()
				}
			},
			include: {
				user: true
			}
		});

		// Delete expired attempts
		await Promise.all(
			expiredAttempts.map(async (attempt: AuthToken) => {
				await prisma.authToken.delete({
					where: {
						id: attempt.id
					}
				});
			})
		);

		console.log(`Cleaned up ${expiredAttempts.length} expired attempts`);
	} catch (error) {
		console.error('Error cleaning up expired attempts:', error);
	}
};

// Cleanup unverified users after 24 hours
export const cleanUpUnverifiedUsers = async () => {
	try {
		const unverifiedUsers = await prisma.user.findMany({
			where: {
				isEmailVerified: false,
				createdAt: {
					lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
				}
			}
		});

		// Delete unverified users
		await Promise.all(
			unverifiedUsers.map(async (user: User) => {
				await prisma.user.delete({
					where: {
						id: user.id
					}
				});
			})
		);

		console.log(`Cleaned up ${unverifiedUsers.length} unverified users`);
	} catch (error) {
		console.error('Error cleaning up unverified users:', error);
	}
};

// Cleanup user after failed email verification
export const cleanupUserAfterFailedEmailMessage = async ({ id }: { id: string }) => {
	try {
		await prisma.user.delete({
			where: { 
				id,
				isEmailVerified: false 
			}
		});
		console.log(`Cleaned up user ${id} after failed email verification`);
	} catch (error) {
		console.error(`Error during cleanup after failed email for user ${id}:`, error);
	}
};
