import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient, UserRole, UserStatus } from '../generated/prisma';
import { getEnv } from '../utils/get-env';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: getEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${getEnv('API_URL')}/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.name?.givenName || profile.displayName,
              lastName: profile.name?.familyName || '',
              passwordHash: '', // OAuth users don't need a password
              role: UserRole.CUSTOMER,
              status: UserStatus.ACTIVE,
              isEmailVerified: true,
              profilePicture: profile.photos?.[0]?.value
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
