import { Injectable } from '@angular/core';
import { ErrorsService } from './errors.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from './http.service';
import { UiService } from './ui.service';
import { RefereeService } from './referee.service';
import { InputComponent } from '../shared/input/input.component';

@Injectable({
  providedIn: 'root'
})
export class Esp32Service {

  public rfidOption: number = 1;
  public isLoading: boolean = false;
  public isAutocomplete: boolean = false;
  public lastResponse: any = null;
  public allUsers: Array<any> | null = null;
  public lastActivedElement: InputComponent | null = null;

  constructor(private errorService: ErrorsService, private translate: TranslateService, private http: HttpService, private ui: UiService, private refereeService: RefereeService) {
    let option = localStorage.getItem('rfidOption');
    this.rfidOption = option != null ? Number(option) : 1;
    this.refereeService.allUsers$.subscribe((data) => {
      this.allUsers = data;
    })
  }

  onChangeRFIDDevice(option: number) {
    this.rfidOption = option;
    console.log(option)
    localStorage.setItem('rfidOption', option.toString());
  }
  onChangeAutocomplete() {
    this.isAutocomplete = !this.isAutocomplete;
  }

  errorHandler(error: any) {
    this.ui.showFeedback('error', error.body, 3)
    this.lastResponse = null;
  }

  public setActiveInput(currentInput: InputComponent) {
    this.lastActivedElement = currentInput;
  }

  uzytkownikIdHandler(uzytkownik_id: number) {
    let finded = this.allUsers?.find(user => user.uzytkownik_id == uzytkownik_id)
    if (finded) {
      this.lastResponse = finded.uzytkownik_uuid
      this.copyLastResponse()
      this.ui.showFeedback('succes', `Skopiowano identyfikator użytkownika ${finded.imie} ${finded.nazwisko} do schowka`, 3)
    } else {
      this.ui.showFeedback('error', "Nie znaleziono użytkownika o takim identyfikatorze", 3)
    }
  }


  public readRFIDTag() {
    this.isLoading = true;
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.readRFIDTag().catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      this.isLoading = false;
      if (value.status == "Error") {
        this.errorHandler(value)
      } else {
        this.uzytkownikIdHandler(value.body.uzytkownik_id)
        resolve(value);
      }
    });
  }

  public eraseRFIDTag() {
    this.isLoading = true;
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.eraseRFIDTag().catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      this.isLoading = false;
      if (value.status == "Error") {
        this.errorHandler(value)
      } else {
        this.lastResponse = null
        this.ui.showFeedback('succes', "Pomyślnie wyczyszczono kartę RFID", 3)
        resolve(value);
      }
    });
  }

  public readOneGate() {
    this.isLoading = true;
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.readOneGate().catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      this.isLoading = false;
      if (value.status == "Error") {
        this.errorHandler(value)
      } else {
        this.lastResponse = value.body.czas_przejazdu
        this.copyLastResponse()
        this.ui.showFeedback('succes', `Skopiowano czas przejazdu do schowka`, 3)
        resolve(value);
      }
    });
  }

  public readTwoGates() {
    this.isLoading = true;
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.readTwoGates().catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      this.isLoading = false;
      if (value.status == "Error") {
        this.errorHandler(value)
      } else {
        this.lastResponse = value.body.czas_przejazdu
        this.copyLastResponse()
        this.ui.showFeedback('succes', `Skopiowano czas przejazdu do schowka`, 3)
        resolve(value);
      }
    });
  }

  public writeRFIDTag(uzytkownik_id: number) {
    this.isLoading = true;
    return new Promise<any>(async (resolve, reject) => {
      const value = await this.http.writeRFIDTag(uzytkownik_id).catch(err => {
        if (err.status === 400) {
          this.errorService.showError(err.status, this.translate.instant(err.error.body));
          reject(err);
        } else {
          this.errorService.showError(err.status);
          reject(err);
        }
      })
      this.isLoading = false;
      if (value.status == "Error") {
        this.errorHandler(value)
      } else {
        this.uzytkownikIdHandler(value.body.uzytkownik_id)
        resolve(value);
      }
    });
  }

  copyToClipboard(value: string) {
    if (this.lastActivedElement && this.isAutocomplete) {
      this.lastActivedElement.updateValueFromOutside(value);
    }
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  copyLastResponse() {
    this.copyToClipboard(this.lastResponse)
  }
}
