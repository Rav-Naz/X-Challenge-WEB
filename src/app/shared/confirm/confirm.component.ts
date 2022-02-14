import { TranslateService } from '@ngx-translate/core';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {

  constructor(private translate: TranslateService) {

  }

  context: string | null = null;

  @Output() decision = new EventEmitter<boolean>();

  async awaitToDecision(context: string)
  {
    this.context = context;
    return new Promise<boolean>((resolve) => {
      this.decision.subscribe(event => {
        this.context = null;
        resolve(event);
      });
    });
  }

  decide(value: boolean)
  {
    this.decision.emit(value);
  }

  dummy(event: Event) {
    event.stopPropagation();
  }
}
