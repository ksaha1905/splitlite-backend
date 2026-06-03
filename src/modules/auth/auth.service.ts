import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
     getCurrentUser(user: any) {
    return user;
  }
}
