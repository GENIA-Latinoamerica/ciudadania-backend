import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() === 'development') {
    console.log(`mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}${process.env.DATABASE_PORT ? ':' + process.env.DATABASE_PORT : ''}/${process.env.DATABASE_NAME}${process.env.DATABASE_EXTRA}`)
    return {
      uri: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}${process.env.DATABASE_PORT ? ':' + process.env.DATABASE_PORT : ''}/${process.env.DATABASE_NAME}${process.env.DATABASE_EXTRA}`,
    };
  }
});