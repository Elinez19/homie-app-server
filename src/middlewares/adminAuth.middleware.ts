import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';
import { UserRole } from '../generated/prisma';

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Access token required');
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwtUtils.verifyToken(token) as any;
    
    if (!decoded) {
      throw new Error('Invalid or expired token');
    }

    // Check if user is an admin
    if (decoded.role !== UserRole.ADMIN) {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Add user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    next(new Error('Authentication failed'));
  }
}; 