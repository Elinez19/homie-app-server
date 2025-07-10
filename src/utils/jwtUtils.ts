import jwt from 'jsonwebtoken';
import { getEnv } from './get-env';

const JWT_SECRET = getEnv('JWT_SECRET');
const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');

export const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const generateResetToken = (email: string) => {
  return jwt.sign(
    { email },
    JWT_SECRET,
    { expiresIn: '10m' }
  );
};

export default {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  generateResetToken
}; 