import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(configService: ConfigService, private usersService: UsersService,) {
    const supabaseUrl =
      configService.get<string>('SUPABASE_URL');

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      issuer: `${supabaseUrl}/auth/v1`,

      audience: 'authenticated',

      algorithms: ['ES256'],

      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,

        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }) as any,
    });
  }

 async validate(payload: JwtPayload) {
  const supabaseId = payload.sub;
  const email = payload.email;

  let user =
    await this.usersService.findBySupabaseId(
      supabaseId,
    );

  if (!user) {
    user =
      await this.usersService.createUser({
        supabaseId,
        email: email!,
      });
  }

  return user;
}
}