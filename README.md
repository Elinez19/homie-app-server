# Homie App Server

A robust authentication server built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- Complete authentication system
- Email verification
- Password reset functionality
- JWT-based authentication
- Google OAuth integration
- PostgreSQL database with Prisma ORM
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn
- Google OAuth credentials (for social login)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/homie_app"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@example.com"
SMTP_SECURE="false"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# URLs
API_URL="http://localhost:5713"
FRONTEND_URL="http://localhost:5173"
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/homie-app-server.git
   cd homie-app-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890" // optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully. Please verify your email.",
    "data": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
  ```

#### Verify Email
- **POST** `/auth/verify/:userId`
- **Body:**
  ```json
  {
    "code": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Email successfully verified",
    "data": null
  }
  ```

#### Resend Verification Code
- **POST** `/auth/verify/resend/:userId`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Verification code resent successfully",
    "data": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
  ```

#### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
  ```

#### Google OAuth Login
- **GET** `/auth/google`
  - Redirects to Google login page
  - No request body needed

- **GET** `/auth/google/callback`
  - Callback URL for Google OAuth
  - Automatically handled by the server
  - Redirects to frontend with tokens:
    ```
    http://localhost:5173/auth/google/callback?accessToken=jwt-token&refreshToken=refresh-token
    ```

#### Logout
- **POST** `/auth/logout`
- **Body:**
  ```json
  {
    "refreshToken": "jwt-refresh-token"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": null
  }
  ```

#### Forgot Password
- **POST** `/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset instructions sent to your email",
    "data": null
  }
  ```

#### Reset Password
- **POST** `/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset-token",
    "password": "new-password"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successful",
    "data": null
  }
  ```

#### Refresh Access Token
- **POST** `/auth/refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "jwt-refresh-token"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully",
    "data": {
      "accessToken": "new-jwt-access-token",
      "refreshToken": "new-jwt-refresh-token"
    }
  }
  ```

### Frontend Integration

#### Google OAuth Integration

1. Add login button to your frontend:
   ```typescript
   const loginWithGoogle = () => {
     window.location.href = 'http://localhost:5713/auth/google';
   };
   ```

2. Handle OAuth callback:
   ```typescript
   // In your callback route component
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const accessToken = params.get('accessToken');
     const refreshToken = params.get('refreshToken');
     
     if (accessToken && refreshToken) {
       // Store tokens
       localStorage.setItem('accessToken', accessToken);
       localStorage.setItem('refreshToken', refreshToken);
       // Update auth state and redirect
       navigate('/dashboard');
     }
   }, []);
   ```

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "details": "Additional error details if available"
  }
}
```

Common error status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

1. Password Security:
   - Passwords are hashed using bcrypt
   - Minimum password requirements enforced

2. Token Security:
   - Short-lived access tokens (1 hour)
   - Refresh tokens with longer validity (30 days)
   - Secure token rotation

3. Email Verification:
   - Required for new accounts
   - Time-limited verification codes
   - Rate-limited resend functionality

4. OAuth Security:
   - State parameter validation
   - Secure token handling
   - HTTPS enforced in production

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 