const appConfig = () => {
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
  const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  return {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5001",
    BASE_PATH: process.env.BASE_PATH || "/api",
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/homie_app?schema=public",
    
    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret",
    JWT_EXPIRES_IN: jwtExpiresIn as "1h" | "2h" | "4h" | "8h" | "12h" | "24h",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret",
    REFRESH_TOKEN_EXPIRES_IN: refreshTokenExpiresIn as "1d" | "7d" | "14d" | "30d",

    // Frontend
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
    FRONTEND_GOOGLE_CALLBACK_URL: process.env.FRONTEND_GOOGLE_CALLBACK_URL || "http://localhost:5173/auth/google/callback",
  };
};

export const config = appConfig();
