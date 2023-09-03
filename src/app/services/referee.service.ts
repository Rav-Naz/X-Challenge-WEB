import { TranslateService } from '@ngx-translate/core';
import { HttpService } from 'src/app/services/http.service';
import { ErrorsService } from './errors.service';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { UiService } from './ui.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RefereeService {

  private allUsers = new BehaviorSubject<Array<any> | null>(null);

  constructor(private errorService: ErrorsService, private http: HttpService, private translate: TranslateService, private websocket: WebsocketService, private ui: UiService, private injector: Injector) {
    if (injector.get(UserService).isReferee) {
      this.getUsers();
    }
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('user/addPostalCode', (data) => {
        this.WS_addPostalCode(data);
      })
    })
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('user/giveStarterpack', (data) => {
        this.WS_givenStarterpack(data);
      })
    })
  }

  public getRobotsOfUserInCategory(uzytkownik_uuid: string, kategoria_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.getRobotsOfUserInCategory(uzytkownik_uuid, kategoria_id).catch(err => {
        if (err.status === 400) {
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
      const value = await this.http.checkIfRobotHasCategory(robot_uuid, kategoria_id).catch(err => {
        if (err.status === 400) {
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
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public callForConstructors(robot_uuid: string, stanowisko_id: number, robot_nazwa: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.callForConstructors(robot_uuid, stanowisko_id, robot_nazwa).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public sendPrivateMessage(uzytkownik_uuid: string, tresc: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.sendPrivateMessage(uzytkownik_uuid, tresc).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public confirmArrival(robot_uuid: string, value: boolean) {
    return new Promise<any>(async (resolve) => {
      const resp = await this.http.confirmArrival(robot_uuid, value).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(resp);
    });
  }

  public confirmGivenStarterPack(uzytkownik_uuid: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.confirmGivenStarterpack(uzytkownik_uuid).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public addRobotRejection(robot_uuid: string, powod_odrzucenia: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addRobotRejection(robot_uuid, powod_odrzucenia).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }
  public setRobotWeight(robot_uuid: string, weight: string) {
    console.log(weight);
    return new Promise<any>(async (resolve) => {
      const value = await this.http.setRobotWeight(robot_uuid, weight).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public changeUserType(uzytkownik_uuid: string, uzytkownik_typ: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.changeUserType(uzytkownik_uuid, uzytkownik_typ).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      this.ui.showFeedback('succes', 'Zmieniono typ użytkownika', 2)
      resolve(value);
    });
  }

  public getUsers() {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.getUsers.catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.allUsers.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  public createGroupForCategory(stanowiskaLista: Array<number>, kategoria_id: number, iloscDoFinalu: number, opcjaTworzenia: number | null) {
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.createGroupsFromCategory(stanowiskaLista, kategoria_id, iloscDoFinalu, opcjaTworzenia).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      resolve(value);
    });
  }

  public deleteGroup(grupa_id: number) {
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.removeGroup(grupa_id).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      resolve(value);
    });
  }

  async WS_addPostalCode(data: any) {
    const userIndex = this.allUsers.value?.findIndex(user => user.uzytkownik_id === data?.uzytkownik_id)
    if (userIndex !== undefined && userIndex !== null && userIndex >= 0 && this.allUsers.value) {
      this.allUsers.value![userIndex].kod_pocztowy = data.kod_pocztowy;
      this.allUsers.next(this.allUsers.value);
    }
  }

  async WS_givenStarterpack(data: any) {
    const userIndex = this.allUsers.value?.findIndex(user => user.uzytkownik_uuid === data?.uzytkownik_uuid)
    if (userIndex !== undefined && userIndex !== null && userIndex >= 0 && this.allUsers.value) {
      this.allUsers.value![userIndex].czy_odebral_starterpack = data.czy_odebral_starterpack;
      this.allUsers.next(this.allUsers.value);
    }
  }

  get allUsers$() {
    return this.allUsers.asObservable()
  }
}
