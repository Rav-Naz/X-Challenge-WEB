import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from './errors.service';
import { HttpService } from './http.service';
import { UiService } from './ui.service';
import { WebsocketService } from './websocket.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {

  private allTimetables = new BehaviorSubject<Array<any> | null>(null);

  constructor(private http: HttpService, private errorService: ErrorsService, private ui: UiService, private translate: TranslateService,
    private websocket: WebsocketService, private injector: Injector) {
    this.getAllTimetables();
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('addNewTimetable', (data) => {
        this.WS_addTimeline(data)
      })
      socket?.on('deleteTimetable', (data) => {
        this.WS_deleteTimeline(data)
      })
      socket?.on('editTimetable', (data) => {
        this.WS_editTimetable(data)
      })
    });
  }

  public getAllTimetables() {
    return new Promise<any>(async (resolve, reject) => {
      if (this.allTimetables.value === null && this.allTimetables.value === undefined) { reject(); return; }
      const value = await this.http.getTimetables().catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if (value !== undefined) {
        this.allTimetables.next(Object.assign(value.body));
      }
      resolve(value);
    });
  }

  public addNewTimetable(nazwa: string, godzina_rozpoczecia: Date, interwal: number, wiersze: number, kolumny: number) {
    return new Promise<any | void>(async (resolve) => {
      const value = await this.http.addNewTimetable(nazwa, godzina_rozpoczecia, interwal, wiersze, kolumny).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })


      if (value !== undefined) {

      }
      resolve(value);
    });
  }

  public editTimetable(harmonogram_id: number, komorki: string, czy_widoczny: number) {
    return new Promise<any | void>(async (resolve) => {
      const value = await this.http.editTimetable(harmonogram_id, komorki, czy_widoczny).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if (value !== undefined) {

      }
      resolve(value);
    });
  }

  public deleteTimetable(harmonogram_id: number) {
    return new Promise<any | void>(async (resolve) => {
      const value = await this.http.deleteTimetable(harmonogram_id).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })

      if (value !== undefined) {

      }
      resolve(value);
    });
  }

  public WS_addTimeline(data: any) {
    this.allTimetables.value?.push(data);
    this.allTimetables.next(this.allTimetables.value)
  }
  public WS_editTimetable(data: any) {
    const timetableIndex = this.allTimetables.value?.findIndex(timetable => timetable.harmonogram_id === data?.harmonogram_id)
    if (timetableIndex !== undefined && timetableIndex !== null && timetableIndex >= 0 && this.allTimetables.value) {
      this.allTimetables.value[timetableIndex].komorki = data.komorki;
      this.allTimetables.value[timetableIndex].czy_widoczny = data.czy_widoczny;
      this.allTimetables.next(this.allTimetables.value)
    }
  }

  public WS_deleteTimeline(data: any) {
    const timetableIndex = this.allTimetables.value?.findIndex(timetable => timetable.harmonogram_id === data?.harmonogram_id)
    if (timetableIndex !== undefined && timetableIndex !== null && timetableIndex >= 0 && this.allTimetables.value) {
      this.allTimetables.value.splice(timetableIndex, 1);
      this.allTimetables.next(this.allTimetables.value)
    }
  }
  get allTimetables$() {
    return this.allTimetables.asObservable()
  }
}
