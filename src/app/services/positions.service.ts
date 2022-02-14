import { Position } from './../models/position';
import { Injectable, Injector } from '@angular/core';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from './errors.service';
import { HttpService } from 'src/app/services/http.service';
import { APIResponse } from '../models/response';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PositionsService {

  private positions = new BehaviorSubject<Array<Position> | null>(null);
  private allPostions = new BehaviorSubject<Array<Position> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService, private userService: UserService,
    private incjetor: Injector) {
      if (userService.isReferee) this.getAllRefereePositions();
  }

  public getAllPositions() {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      if(this.allPostions.value === null && this.allPostions.value === undefined) {reject(); return;}
      const value = await this.http.getAllPositions.catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined) {
        this.allPostions.next(value.body);
      }
      resolve(value);
    }); 
  }

  public getAllRefereePositions() {
    return new Promise<APIResponse | void>(async (resolve) => {
      const value = await this.http.getRefereePositions(this.userService.userUUID).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined) {
        this.positions.next(value.body);
      }
      resolve(value);
    }); 
  }

  public checkIfRobotCanInThisPosition(robot_uuid: string, kategoria_id: number, stanowisko_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.checkIfRobotCanInThisPosition(robot_uuid,kategoria_id, stanowisko_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  get positions$() {
    return this.positions.asObservable();
  }

  get allPositions$() {
    return this.allPostions.asObservable();
  }
}
