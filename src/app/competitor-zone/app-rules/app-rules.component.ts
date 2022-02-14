import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-rules',
  templateUrl: './app-rules.component.html',
  styleUrls: ['./app-rules.component.scss']
})
export class AppRulesComponent implements OnInit{

  private rules: Array<any> | undefined;
  private subs = new Subscription();

  constructor(private translate: TranslateService) {

  }

  ngOnInit() {
    const sub5 = this.translate.stream('app-rules.rules').subscribe((rules: Array<any>) => {
      this.rules = rules;
      // if(typeof rules === 'object') this.rules = rules;
    });
    this.subs.add(sub5);
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
