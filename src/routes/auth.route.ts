import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  loginController,
  logoutController,
  refreshTokenController,
  registerUserController,
  registerServiceProviderController,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const router = Router();

// Public routes
router.post("/register", registerUserController);
router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);

// Protected routes
router.use(isAuthenticated);
router.post("/register-provider", registerServiceProviderController);
router.post("/logout", logoutController);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback
);

export default router;
