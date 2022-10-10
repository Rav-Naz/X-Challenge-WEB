import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '../models/response';
import { ErrorsService } from './errors.service';
import { HttpService } from './http.service';
import { WebsocketService } from './websocket.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private anouncements = new BehaviorSubject<Array<any> | null>(null);
  private seenMessages: string | null = null;

  constructor(private http: HttpService, private errorService: ErrorsService, private translate: TranslateService,private websocket: WebsocketService, private injcetor: Injector) {
    this.getAnnouncements();
    this.seenMessages = localStorage.getItem('seenMessages')
    this.websocket.getWebSocket$.subscribe((socket) => {
      socket?.on('sendMessageToAllUsers', (data) => {
        this.WS_sendMessageToAllUsers(data);
      });
    });
  }

  public getAnnouncements() {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      if (this.anouncements.value === null && this.anouncements.value === undefined) { reject(); return; }
      const value = await this.http.getAnnouncements.catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      });
      if (value !== undefined) {
        this.anouncements.next(value.body);
      }
      resolve(value);
    });
  }

  public addAnnouncements(tresc: string) {
    return new Promise<APIResponse | void>(async (resolve, reject) => {
      if (!this.injcetor.get(UserService).isAdmin) { reject(); return}
      const value = await this.http.sendMessageToAllUsers(tresc).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      });
      resolve(value);
    });
  }

  public updateSeenMessages() {
    localStorage.setItem('seenMessages', JSON.stringify(this.anouncements.value))
    this.seenMessages = localStorage.getItem('seenMessages');
  }

  public WS_sendMessageToAllUsers(data: any) {
    this.anouncements.value?.push(data)
    this.anouncements.next(this.anouncements.value);
  }

  public get isNewAnnouncement() {
    return JSON.stringify(this.anouncements.value) != this.seenMessages;
  }

  get allAnnouncements$() {
    return this.anouncements.asObservable();
  }
}
