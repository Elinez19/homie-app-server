import { UserRole, UserStatus } from '../generated/prisma';
import { prisma } from '../config/database.config';
import jwtUtils from '../utils/jwtUtils';
import { OAuthProfile, OAuthUserData, OAuthCallbackParams, OAuthResponse } from '../@types/oauth.types';

export const handleOAuthUser = async (profile: OAuthProfile, role: UserRole = UserRole.CUSTOMER): Promise<OAuthUserData> => {
  const email = profile.emails?.[0]?.value;
  
  if (!email) {
    throw new Error('No email found in OAuth profile');
  }

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      artisan: role === UserRole.ARTISAN
    }
  });

  if (!user) {
        // Create new user
    const userData: any = {
      email,
      firstName: profile.name?.givenName || profile.displayName,
      lastName: profile.name?.familyName || '',
      passwordHash: '', // OAuth users don't need a password
      role,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      ...(profile.photos?.[0]?.value && { profilePicture: profile.photos[0].value })
    };

    // If creating an artisan, we need additional data
    if (role === UserRole.ARTISAN) {
      userData.artisan = {
        create: {
          businessName: `${profile.displayName}'s Business`,
          businessLicense: 'PENDING_VERIFICATION',
          serviceCategories: ['General'],
          serviceAreas: ['Local'],
          description: 'OAuth registered artisan',
          hourlyRate: 0,
          yearsOfExperience: 0,
          qualifications: [],
          maxJobDistance: 50
        }
      };
    }

    user = await prisma.user.create({
      data: userData,
      include: {
        artisan: role === UserRole.ARTISAN
      }
    });
  } else {
    // Update existing user's profile picture if not set
    if (!user.profilePicture && profile.photos?.[0]?.value) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: profile.photos[0].value },
        include: {
          artisan: role === UserRole.ARTISAN
        }
      });
    }
  }

  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture || undefined,
    role: user.role,
    isEmailVerified: user.isEmailVerified
  };
};

export const generateOAuthTokens = async (user: any): Promise<OAuthResponse> => {
  try {
    // Generate tokens
    const tokens = jwtUtils.generateTokens(user);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return {
      success: true,
      message: 'OAuth authentication successful',
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
        artisan: user.artisan
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to generate OAuth tokens: ${error.message}`);
  }
};

export const processOAuthCallback = async ({ user, role }: OAuthCallbackParams): Promise<OAuthResponse> => {
  if (!user) {
    throw new Error('No user data from OAuth provider');
  }

  try {
    return await generateOAuthTokens(user);
  } catch (error: any) {
    throw new Error(`OAuth callback processing failed: ${error.message}`);
  }
}; 