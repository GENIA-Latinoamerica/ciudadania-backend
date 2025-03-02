export class ResetPasswordNotificationDto {
  userId: string;
  code: string;

  constructor(userId: string, code: string) {
    this.userId = userId;
    this.code = code;
  }
}
