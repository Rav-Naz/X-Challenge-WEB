import { UserService } from './user.service';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import { UiService } from './ui.service';
import { ErrorsService } from './errors.service';
import { Injectable, Injector } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { sha256 } from 'js-sha256'
import { TranslateService } from '@ngx-translate/core';
import jwt_decode from 'jwt-decode';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public JWT: string | null = null;
  public eventDate: Date | null = null;
  public accessToModifyExpirationDate: Date | null = null;
  public accesToSendDocumentation: Date | null = null;
  public registerInfo: any = null;
  public registrationStart: Date | null = null;
  public registrationEnd: Date | null = null;
  public robotAcceptTime: Date | null = null;
  public streamLink: SafeResourceUrl | undefined = undefined;
  private info = new BehaviorSubject<object | null>(null);
  public foodList: Array<string> | null = null;
  public tshirtSizes: Array<string> | null = null;

  constructor(private http: HttpService, private router: Router, private errorService: ErrorsService, private ui: UiService,
    private translate: TranslateService, private webSocket: WebsocketService, private userService: UserService, private sanitizer: DomSanitizer, private injector: Injector) {
    const details = localStorage.getItem('details');
    this.http.getHomePageInfo.subscribe((data) => {
      if (data === undefined || data === null) return;
      this.accessToModifyExpirationDate = new Date(data.body.accessToModifyExpirationDate.data_zakonczenia);
      this.registrationStart = new Date(data.body.accessToModifyExpirationDate.data_rozpoczecia);
      this.registrationEnd = new Date(data.body.accessToModifyExpirationDate.data_zakonczenia);
      this.eventDate = new Date(data.body.eventDate.data_rozpoczecia);
      this.accesToSendDocumentation = new Date(data.body.accesToSendDocumentation.data_zakonczenia);
      this.robotAcceptTime = new Date(data.body.robotAcceptTime.data_zakonczenia);
      this.registerInfo = data.body.registerInfo;
      if (data.body.streamLink) {
        this.streamLink = this.sanitizer.bypassSecurityTrustResourceUrl(data.body.streamLink);
      }
      this.info.next({
        // eventDate: new Date(),
        eventDate: this.eventDate,
        accessToModifyExpirationDate: this.accessToModifyExpirationDate,
        accesToSendDocumentation: this.accesToSendDocumentation,
        registerStart: this.registrationStart,
        streamLink: this.streamLink,
        registerInfo: this.registerInfo
      })
    })
    if (details) {
      this.SetDetails(details).then(() => {
        if (!this.isLogged) { this.SetDetails(null) }
        else {
          setTimeout(() => {
            this.userService.getUser().then((value) => {
              this.SetDetails(JSON.stringify({ ...value.body, token: this.JWT }))
            })
          }, 1000)
        };
      });
    } else {
      this.webSocket.createSocket();
    }
  }

  SetDetails(userDetails: string | null) {
    return new Promise<void>((resolve) => {

      if (userDetails !== null) {
        const detailsParsed = JSON.parse(userDetails);
        this.userService.userDetails = detailsParsed;
        this.JWT = detailsParsed.token;
        this.userService.user.next(detailsParsed);
        localStorage.setItem('details', JSON.stringify(detailsParsed));
        this.webSocket.createSocket(this.JWT!);
      } else {
        this.userService.user.next(null);
        this.userService.userDetails = null;
        this.JWT = null;
        localStorage.removeItem('details');
        this.webSocket.createSocket();
      }
      this.http.setNewToken(this.JWT);
      resolve();
    });
  }

  setUserPhoneLocaly(numer_telefonu: string | null) {
    (this.userService.userDetails as any).numer_telefonu = numer_telefonu;
    this.userService.user.next(this.userService.userDetails);
    localStorage.setItem('details', JSON.stringify(this.userService.userDetails));
  }

  async login(email: string, haslo: string) {
    return new Promise<string>(async (resolve) => {
      const value = await this.http.login(email, this.hashPassword(haslo).toString()).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));

        } else if (err.status === 401) {
          this.errorService.showError(err.status, this.translate.instant('competitor-zone.login.errors.failed'));
        }
        else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.SetDetails(JSON.stringify(value.body))
        this.router.navigateByUrl('/competitor-zone').then(() => {
        })
      }
      resolve(value);
    });
  }

  async register(imie: string, nazwisko: string, email: string, kodPocztowy: string | null, numerTelefonu: string | null, rozmiarKoszulki: number, preferowaneJedzenie: number, czyOpiekun: boolean, haslo: string) {
    return new Promise<string>(async (resolve) => {
      var kod_pocztowy = kodPocztowy != null && kodPocztowy.length > 0 ? kodPocztowy : null;
      var numer_telefonu = numerTelefonu != null && numerTelefonu.length > 0 ? numerTelefonu : null;
      var czy_opiekun = czyOpiekun ? 1 : 0;
      const value = await this.http.register(imie, nazwisko, email, kod_pocztowy, numer_telefonu, rozmiarKoszulki, preferowaneJedzenie, czy_opiekun, this.hashPassword(haslo).toString()).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.router.navigateByUrl('/login').then(() => {
          setTimeout(() => {
            this.ui.showFeedback("succes", this.translate.instant('competitor-zone.register.errors.success'), 4)
          }, 200)
        })
      }
      resolve(value);
    });
  }

  async remindPassword(email: string) {
    return new Promise<string>(async (resolve, reject) => {
      const value = await this.http.remindPassword(email).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.forgot-password.errors.sended'), 4)
        resolve(value);
      } else {
        reject();
      }
    });
  }

  async resetPassword(uzytkownik_uuid: string, kod: string, haslo: string) {
    return new Promise<string>(async (resolve) => {
      const value = await this.http.resetPassword(uzytkownik_uuid, kod, this.hashPassword(haslo).toString()).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.router.navigateByUrl('/login').then(() => {
          setTimeout(() => {
            this.ui.showFeedback("succes", this.translate.instant('competitor-zone.reset-password.errors.success'), 4)
          }, 200)
        })
      }
      resolve(value);
    });
  }

  async changeUserPassword(stareHaslo: string, noweHaslo: string) {
    return new Promise<string>(async (resolve) => {
      const value = await this.http.changeUserPassword(this.hashPassword(stareHaslo).toString(), this.hashPassword(noweHaslo).toString()).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
        } else {
          this.errorService.showError(err.status);
        }
      })
      if (value !== undefined) {
        this.ui.showFeedback("succes", this.translate.instant('competitor-zone.settings.errors.success'))
      }
      resolve(value);
    });
  }

  async logout() {
    return new Promise<void>(async (resolve) => {
      await this.SetDetails(null);
      if (this.router.url.length === 1 || (this.router.url.length > 1 && this.router.url.slice(0, 2) === '/#')) { //jeśli jest na stronie głownej
        setTimeout(() => {
          this.ui.showFeedback('succes', this.translate.instant('competitor-zone.login.errors.logout'), 3);
        }, 400);
      } else {
        this.router.navigateByUrl('/login').then(() => {
          setTimeout(() => {
            this.ui.showFeedback('succes', this.translate.instant('competitor-zone.login.errors.logout'), 3);
          }, 400);
        });
      }
      resolve()
    });
  }

  async getRegisterAddons() {
    return new Promise<any>(async (resolve) => {
      if (this.foodList == null || this.tshirtSizes == null) {
        this.http.getRegisterAddons.toPromise().then((value) => {
          this.foodList = value.body.jedzenie;
          this.tshirtSizes = value.body.rozmiaryKoszulek;
          resolve(value);
        }).catch((err) => {
          resolve(null)
        });
      } else { resolve(null) }
    });

  }

  hashPassword(haslo: string): string {
    return sha256(haslo);
  }

  get info$() {
    return this.info.asObservable();
  }

  get isLogged() {
    if (this.JWT === null || this.JWT === undefined) return false;
    const d = new Date(0);
    d.setUTCSeconds((jwt_decode(this.JWT!) as any).exp);
    return new Date() < d;
  }

  get canModify() {
    // return false
    return (this.accessToModifyExpirationDate !== null && this.accessToModifyExpirationDate > new Date()) || this.userService.isReferee;
  }

  get canSendDocumetation() {
    // return false
    return (this.accesToSendDocumentation !== null && this.accesToSendDocumentation > new Date()) || this.userService.isAdmin;
  }

  get isRegistationOpen() {
    // return false
    return (this.registrationStart != null && this.registrationStart < new Date() && this.registrationEnd != null && this.registrationEnd > new Date()) && this.registerPercentageCompletion < 100;
  }

  get isAfterRegistration() {
    // return false
    return (this.registrationEnd != null && this.registrationEnd < new Date());
  }

  get isWaitingForRobotAcceptation() {
    // return false
    return (this.robotAcceptTime != null && this.robotAcceptTime > new Date() && this.isAfterRegistration);
  }

  get isEvent() {
    // return false
    return (this.eventDate != null && this.eventDate < new Date()) || this.injector.get(UserService).isAdmin;
  }

  get registerPercentageCompletion() {
    return this.registerInfo != null ? Math.round((this.registerInfo.aktualnie / this.registerInfo.limitOsob) * 100) : 100
  }
}
