export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_EXPIRY_MINUTES = 10;

export const generateVerificationCode = (length: number): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

export const calculateExpiryTime = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
}; 