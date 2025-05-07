// src/lib/config.ts

const getEnvVar = (key: string): string => {
    //console.log(`Getting environment variable: ${key}`);
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    //console.log(`Value: ${value}`);
    return value;
  };
  
  export const config = {
    authSecret: getEnvVar("AUTH_SECRET"),
    databaseUrl: getEnvVar("DATABASE_URL"),
  };