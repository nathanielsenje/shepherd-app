import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  ENCRYPTION_KEY: string;

  @IsNumber()
  BCRYPT_ROUNDS: number;

  @IsString()
  MFA_ISSUER: string;

  @IsNumber()
  SESSION_TIMEOUT: number;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, {
    ...config,
    PORT: parseInt(config.PORT as string, 10),
    REDIS_PORT: parseInt(config.REDIS_PORT as string, 10),
    BCRYPT_ROUNDS: parseInt(config.BCRYPT_ROUNDS as string, 10),
    SESSION_TIMEOUT: parseInt(config.SESSION_TIMEOUT as string, 10),
  });
  return validatedConfig;
};
