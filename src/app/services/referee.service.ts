import { TranslateService } from '@ngx-translate/core';
import { HttpService } from 'src/app/services/http.service';
import { ErrorsService } from './errors.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class RefereeService {

  private allUsers = new BehaviorSubject<Array<any> | null>(null);

  constructor (private errorService: ErrorsService, private http: HttpService, private translate: TranslateService, private websocket: WebsocketService) {
    this.getUsers();
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('user/addPostalCode', (data) => {
        this.WS_addPostalCode(data);
      })
    })
  }

  public getRobotsOfUserInCategory(uzytkownik_uuid: string, kategoria_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.getRobotsOfUserInCategory(uzytkownik_uuid,kategoria_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public checkIfRobotHasCategory(robot_uuid: string, kategoria_id: number) {
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.checkIfRobotHasCategory(robot_uuid,kategoria_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public checkIfUserIsConstructorOfRobot(uzytkownik_uuid: string, robot_uuid: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.checkIfUserIsConstructorOfRobot(uzytkownik_uuid, robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public callForConstructors(robot_uuid : string, stanowisko_id: number, robot_nazwa: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.callForConstructors(robot_uuid, stanowisko_id, robot_nazwa).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public sendPrivateMessage(uzytkownik_uuid: string, tresc : string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.sendPrivateMessage(uzytkownik_uuid, tresc).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public confirmArrival(robot_uuid : string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.confirmArrival(robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public getUsers() {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.getUsers.catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined) {
        this.allUsers.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  async WS_addPostalCode(data: any) {
    const userIndex = this.allUsers.value?.findIndex(user => user.uzytkownik_id === data?.uzytkownik_id)
    if(userIndex !== undefined && userIndex !== null && userIndex >= 0 && this.allUsers.value) {
      this.allUsers.value![userIndex].kod_pocztowy = data.kod_pocztowy;
      this.allUsers.next(this.allUsers.value);
    }
  }

  get allUsers$() {
    return this.allUsers.asObservable()
  }
}
