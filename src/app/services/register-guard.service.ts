import { ErrorsService } from './errors.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable()
export class RegisterGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService, private userService: UserService, private errorService: ErrorsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const hasPrivileges = this.authService.isRegistationOpen || this.userService.isAdmin;
    if (!hasPrivileges) {
      this.router.navigateByUrl('/login');
    }
    return hasPrivileges;
  }
}
