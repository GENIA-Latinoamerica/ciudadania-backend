import { registerAs } from '@nestjs/config';

export default registerAs('jwt', async () => {
  return {
    global: true,
    secret: process.env.SECURITY_JWT,
    signOptions: { expiresIn: process.env.SECURITY_EXPIRATION },
  };
});
