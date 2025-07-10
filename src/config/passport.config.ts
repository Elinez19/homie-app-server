import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRole, UserStatus } from '../generated/prisma';
import { prisma } from './database.config';
import { config } from './app.config';
import { handleOAuthUser } from '../services/oauth.service';

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
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get role from state parameter or default to CUSTOMER
        const state = (profile as any).state;
        const role = state === 'artisan' ? UserRole.ARTISAN : UserRole.CUSTOMER;
        
        // Handle OAuth user creation/update
        const userData = await handleOAuthUser(profile, role);
        
        // Find the user after creation/update
        const user = await prisma.user.findUnique({
          where: { email: userData.email },
          include: {
            artisan: role === UserRole.ARTISAN
          }
        });

        if (!user) {
          return done(new Error('Failed to create or find user'), undefined);
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
