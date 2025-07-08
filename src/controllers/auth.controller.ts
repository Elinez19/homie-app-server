import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { HTTPSTATUS } from "../config/http.config";
import { 
  loginService, 
  registerUserService,
  registerServiceProviderService,
  refreshTokenService,
  logoutService
} from "../services/auth.service";
import { 
  registerUserSchema, 
  loginSchema, 
  registerServiceProviderSchema 
} from "../validation/auth.validation";
import passport from "passport";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/auth/callback?status=success`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = registerUserSchema.parse(req.body);
    const result = await registerUserService(data);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result
    });
  }
);

export const registerServiceProviderController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = registerServiceProviderSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "You must be logged in to register as a service provider"
      });
    }

    const result = await registerServiceProviderService(userId, data);

    return res.status(HTTPSTATUS.OK).json({
      message: "Service provider registered successfully",
      data: result
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginService(email, password);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Refresh token not found"
      });
    }

    const result = await refreshTokenService(refreshToken);

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken
      }
    });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (userId) {
      await logoutService(userId);
    }

    res.clearCookie('refreshToken');

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out successfully"
    });
  }
);
