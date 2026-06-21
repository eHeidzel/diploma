
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const isGuest = request.headers['x-guest'] === 'true';

    
    if (isGuest) {
      
      request.user = {
        id: 'guest',
        role: 'guest',
        isGuest: true,
        name: 'Гость',
        email: 'guest@example.com',
      };
      return true;
    }

    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Вы не авторизованы. Пожалуйста, войдите в систему.',
        )
      );
    }
    return user;
  }
}
