import { ErrorsService } from './../../services/errors.service';
import { UiService } from './../../services/ui.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { HttpService } from 'src/app/services/http.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit {

  constructor(private route: ActivatedRoute, public translate: TranslateService, private httpService: HttpService, 
     private errorService: ErrorsService ) { }

  public text:any = undefined;
  private opis:any = undefined;
  public success: boolean = false;

  async ngOnInit(): Promise<void> {
    const uzytkownik_uuid = this.route.snapshot.paramMap.get('uzytkownik_uuid');
    const kod = this.route.snapshot.paramMap.get('kod');
    const czy_na_telefon = this.route.snapshot.paramMap.get('czy_na_telefon');

    this.translate.stream('competitor-zone.confirmation-code').subscribe((opis: any) => {
      this.opis = opis;
    });

    if(typeof uzytkownik_uuid !== 'string' || typeof kod !== 'string' || typeof czy_na_telefon !== 'string') {
      this.text = 'competitor-zone.confirmation-code.incorrect';
      this.errorService.showError(400)
      return;
    }

    const value = await this.httpService.confirmCode(uzytkownik_uuid,kod,czy_na_telefon).catch(err => {
      if(err.error.body == "errors.details.user-have-email") {
        this.text = 'competitor-zone.confirmation-code.activated';
      } else {
        this.text = err.error.body;
      }
      this.errorService.showError(err.status, this.translate.instant(this.text));
    });

    if(value !== undefined) { this.text = 'competitor-zone.confirmation-code.success'; this.success = true}
  }

}
