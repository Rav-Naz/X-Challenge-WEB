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
      this.getAllPositions();
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

  addPosition(nazwa: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addPosition(nazwa).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined) {
        this.allPostions.value?.push(value.body)
        this.allPostions.next(this.allPostions.value);
      }
      resolve(value);
    });
  }

  editPosition(stanowisko_id: number,nazwa: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.editPosition(stanowisko_id, nazwa).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined && this.allPostions.value) {
        const index = this.allPostions.value.findIndex(el => el.stanowisko_id == value.body.stanowisko_id)
        if(index >= 0) {
          (this.allPostions.value[index] as any).nazwa_stanowiska = value.body.nazwa_stanowiska;
          this.allPostions.next(this.allPostions.value);
        }
      }
      resolve(value);
    });
  }

  removePosition(stanowisko_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.removePosition(stanowisko_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if(value !== undefined && this.allPostions.value) {
        const index = this.allPostions.value.findIndex(el => el.stanowisko_id == value.body.stanowisko_id)
        if( index >= 0) {
          this.allPostions.value?.splice(index,1)
          this.allPostions.next(this.allPostions.value);
        }
      }
      resolve(value);
    });
  }

  addRefereeToPosition(stanowisko_id: number, uzytkownik_uuid: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addRefereeToPosition(stanowisko_id, uzytkownik_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined && this.allPostions.value) {
        const stanowisko = this.allPostions.value.find(el => el.stanowisko_id == value.body.stanowisko_id)
        if(stanowisko) {
          let index = this.allPostions.value.findIndex(el => el == stanowisko);
          let sedziowie = (stanowisko as any).sedziowie;
          if(sedziowie) {
            sedziowie = sedziowie.split(', ')
            sedziowie.push(value.body.uzytkownik_uuid);
          } else {
            sedziowie = [value.body.uzytkownik_uuid]
          }
          (this.allPostions.value[index] as any).sedziowie = sedziowie.join(', ')
          this.allPostions.next(this.allPostions.value);
        }
      }
      resolve(value);
    });
  }

  removeRefereeFromPosition(stanowisko_id: number, uzytkownik_uuid: string) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.removeRefereeToPosition(stanowisko_id, uzytkownik_uuid).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined && this.allPostions.value) {
        const stanowisko = this.allPostions.value.find(el => el.stanowisko_id == value.body.stanowisko_id)
        if(stanowisko) {
          let index = this.allPostions.value.findIndex(el => el == stanowisko);
          (this.allPostions.value[index] as any).sedziowie = (stanowisko as any).sedziowie.split(', ').filter((pos: any) => pos != value.body.uzytkownik_uuid).join(', ');
          this.allPostions.next(this.allPostions.value);
        }
      }
      resolve(value);
    });
  }

  addCategoryToPosition(stanowisko_id: number, kategoria_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.addCategoryToPosition(stanowisko_id, kategoria_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined && this.allPostions.value) {
        const stanowisko = this.allPostions.value.find(el => el.stanowisko_id == value.body.stanowisko_id)
        if(stanowisko) {
          let index = this.allPostions.value.findIndex(el => el == stanowisko);
          let kategorie= stanowisko.kategorie as any;
          if (kategorie) {
            kategorie = kategorie.split(', ').map((val: any) => Number(val));
            kategorie.push(value.body.kategoria_id)
          } else {
            kategorie = [value.body.kategoria_id]
          }
          this.allPostions.value[index].kategorie = kategorie.join(', ')
          this.allPostions.next(this.allPostions.value);
        }
      }
      resolve(value);
    });
  }

  removeCategoryFromPosition(stanowisko_id: number, kategoria_id: number) {
    return new Promise<any>(async (resolve) => {
      const value = await this.http.removeCategoryFromPosition(stanowisko_id, kategoria_id).catch(err => {
        if(err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if(value !== undefined && this.allPostions.value) {
        const stanowisko = this.allPostions.value.find(el => el.stanowisko_id == value.body.stanowisko_id)
        if(stanowisko) {
          let index = this.allPostions.value.findIndex(el => el == stanowisko);
          this.allPostions.value[index].kategorie = stanowisko.kategorie.split(', ').map(val => Number(val)).filter(pos => pos != value.body.kategoria_id).join(', ');
          this.allPostions.next(this.allPostions.value);
        }
      }
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
