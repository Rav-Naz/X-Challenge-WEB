import { ErrorsService } from './errors.service';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService, private errorService: ErrorsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    if (this.authService.isLogged)
    {
      return true;
    }
    else
    {
      this.errorService.showError(401);
      this.authService.SetDetails(null);
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
