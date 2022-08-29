import { UserService } from './user.service';
import { ErrorsService } from './errors.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService,private errorService: ErrorsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.userService.isAdmin;
  }
}
