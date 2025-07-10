import dotenv from 'dotenv';

dotenv.config();

export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value || defaultValue || '';
};

export default getEnv;
