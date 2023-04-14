import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-rules',
  templateUrl: './app-rules.component.html',
  styleUrls: ['./app-rules.component.scss']
})
export class AppRulesComponent implements OnInit {

  private rules: Array<any> | undefined;
  private subs = new Subscription();

  regulation1 = '';
  regulation2 = '';
  constructor(private translate: TranslateService) {

  }

  openUrl(url: string): void {
    window.open(url);
  }

  ngOnInit() {
    const sub5 = this.translate.stream('app-rules.rules').subscribe((rules: Array<any>) => {
      this.rules = rules;
      // if(typeof rules === 'object') this.rules = rules;
    });
    const sub6 = this.translate.stream('app-rules.regulations.link').subscribe((rule: string) => {
      this.regulation1 = rule;
    });
    const sub7 = this.translate.stream('app-rules.rodo.link').subscribe((rule: string) => {
      this.regulation2 = rule;
    });
    this.subs.add(sub5).add(sub6).add(sub7);
  }

  get getRules() {
    return this.rules;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subs.unsubscribe()
  }
}
