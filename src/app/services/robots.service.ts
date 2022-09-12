import { WebsocketService } from './websocket.service';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from './ui.service';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from './errors.service';
import { HttpService } from './http.service';
import { Injectable, Injector } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RobotsService{

  private userRobots = new BehaviorSubject<Array<any> | null>(null);
  private allRobots = new BehaviorSubject<Array<any> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private ui: UiService, private translate: TranslateService,
     private websocket: WebsocketService, private injector: Injector) {
      if(injector.get(UserService).isReferee) {
        this.getAllRobotsOfUser();
      }
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('robots/updateRobot', (data) => {
        this.WS_updateRobot(data)
      })
      socket?.on('robots/addRobotCategory', (data) => {
        this.WS_addCategory(data)
      })
      socket?.on('robots/uploadDocumentation', (data) => {
        this.WS_uploadDocumentation(data)
      })
      socket?.on('robots/addFilm', (data) => {
        this.WS_addFilm(data)
      })
      socket?.on('robots/deleteRobotCategory', (data) => {
        this.WS_deleteCategory(data)
      })
      socket?.on('robots/deleteRobot', (data) => {
        this.WS_deleteRobot(data);
      })
      socket?.on('robots/newArrival', (data) => {
        this.WS_confirmArrival(data);
      })
      socket?.on('robots/addRobotRejection', (data) => {
        this.WS_addRobotRejection(data);
      })
    })
  }

  public getAllRobotsOfUser() {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.getAllRobotsOfUser().catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        this.userRobots.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  public getAllRobots() {
    return new Promise<any>(async (resolve, reject) => {
      if (this.allRobots.value === null && this.allRobots.value === undefined) { reject(); return; }
      const value = await this.http.getAllRobots.catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined) {
        this.allRobots.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  public addRobot(nazwa: string, kategoria_id: number) {
    return new Promise<any | void>(async (resolve) => {
      const value = await this.http.addRobot(nazwa,kategoria_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        let newRobot = value.body.robot;
        newRobot.kategorie = newRobot.kategoria_id.toString();
        newRobot.nazwa_robota = newRobot.nazwa;
        delete newRobot.nazwa;
        delete newRobot.kategoria_id;
        this.userRobots.value?.push(newRobot);
        this.websocket.createSocket(this.injector.get(AuthService).JWT!);
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.new-robot.success'), 2);
        resolve(newRobot);
      } else {
        resolve(null)
      }
    });
  }

  public deleteRobot(robot_uuid: string) {
    return new Promise<any | void>(async (resolve) => {
      const value = await this.http.deleteRobot(robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {

      }
      resolve(value);
    });
  }

  public updateRobot(robot_uuid: string, nazwa: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.updateRobot(nazwa, robot_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        // this.userRobots.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  public addRobotDocumentation(robot_uuid: string, plik: File) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addRobotDocumentation(robot_uuid,plik).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public downloadDocumentation(robot_uuid: string) {
    this.http.downloadDocumentation(robot_uuid).catch(err => {
      if(err.status === 400) {
        this.errorService.showError(err.status, this.translate.instant(err.error.body));
      } else {
        this.errorService.showError(err.status);
      }
    })
  }

  public addRobotMovie(robot_uuid: string, link: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addRobotMovie(robot_uuid,link).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      resolve(value);
    });
  }

  public WS_confirmArrival(data: any) {
    const robotIndex = this.allRobots.value?.findIndex(robot => robot.robot_uuid === data.robot_uuid);
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value![robotIndex].czy_dotarl = data?.czy_dotarl;
      this.allRobots.next(this.allRobots.value)
    }

    const userRobotIndex = this.userRobots.value?.findIndex(robot => robot.robot_uuid === data.robot_uuid);
    if(userRobotIndex !== undefined && userRobotIndex !== null && userRobotIndex >= 0 && this.userRobots.value) {
      this.userRobots.value![userRobotIndex].czy_dotarl = data?.czy_dotarl;
      this.userRobots.next(this.userRobots.value)
    }
  }

  public WS_updateRobot(data: any) {
    const allRobotIndex = this.allRobots.value?.findIndex(robot => robot.robot_id === data.robot_id);
    if(allRobotIndex !== undefined && allRobotIndex !== null && allRobotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value![allRobotIndex].nazwa_robota = data?.nazwa;
      this.allRobots.next(this.allRobots.value)
    }

    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_id === data?.robot_id)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      this.userRobots.value![robotIndex].nazwa_robota = data?.nazwa;
      this.userRobots.next(this.userRobots.value)
    }
  }

  public WS_addCategory(data: any) {
    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_id === data?.robot_id)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      let categories = ('' + this.userRobots.value![robotIndex].kategorie).slice();
      const newCategories = categories.split(', ').concat([data?.kategoria_id]).sort().join(', ')
      this.userRobots.value![robotIndex].kategorie = newCategories;
      this.userRobots.next(this.userRobots.value)
    }
  }

  public WS_deleteCategory(data: any) {
    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_id === data?.robot_id)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      let categories = ('' + this.userRobots.value![robotIndex].kategorie).slice();
      const newCategories = categories.split(', ').filter(cat => cat !== data?.kategoria_id.toString()).sort().join(', ')
      this.userRobots.value![robotIndex].kategorie = newCategories;
      this.userRobots.next(this.userRobots.value)
    }
  }

  public WS_deleteRobot(data: any) {
    const allRobotIndex = this.allRobots.value?.findIndex(robot => robot.robot_id === data.robot_id);
    if(allRobotIndex !== undefined && allRobotIndex !== null && allRobotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value.splice(allRobotIndex, 1);
      this.allRobots.next(this.allRobots.value)
    }

    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_id === data?.robot_id)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      this.userRobots.value.splice(robotIndex, 1);
      this.userRobots.next(this.userRobots.value)
      this.ui.showFeedback("succes", `${this.translate.instant('competitor-zone.robot.delete-robot')} ${data?.robot_uuid}`,2)
    }
  }
  public WS_uploadDocumentation(data: any) {
    const allRobotIndex = this.allRobots.value?.findIndex(robot => robot.robot_uuid === data.robot_uuid);
    if(allRobotIndex !== undefined && allRobotIndex !== null && allRobotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value![allRobotIndex].link_do_dokumentacji = data?.path;
      this.allRobots.next(this.allRobots.value)
    }

    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_uuid === data?.robot_uuid)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      this.userRobots.value![robotIndex].link_do_dokumentacji = data?.path;
      this.userRobots.next(this.userRobots.value)
    }
  }

  public WS_addFilm(data: any) {
    const allRobotIndex = this.allRobots.value?.findIndex(robot => robot.robot_uuid === data.robot_uuid);
    if(allRobotIndex !== undefined && allRobotIndex !== null && allRobotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value![allRobotIndex].link_do_filmiku = data?.link_do_filmiku;
      this.allRobots.next(this.allRobots.value)
    }

    const robotIndex = this.userRobots.value?.findIndex(robot => robot.robot_uuid === data?.robot_uuid)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.userRobots.value) {
      this.userRobots.value![robotIndex].link_do_filmiku = data?.link_do_filmiku;
      this.userRobots.next(this.userRobots.value)
    }
  }
  public WS_addRobotRejection(data: any) {
    const robotIndex = this.allRobots.value?.findIndex(robot => robot.robot_id == data?.robot_id)
    if(robotIndex !== undefined && robotIndex !== null && robotIndex >= 0 && this.allRobots.value) {
      this.allRobots.value![robotIndex].powod_odrzucenia = data?.powod_odrzucenia;
      this.allRobots.next(this.allRobots.value)
    }
  }

  get userRobots$() {
    return this.userRobots.asObservable()
  }

  get allRobots$() {
    return this.allRobots.asObservable()
  }
}
