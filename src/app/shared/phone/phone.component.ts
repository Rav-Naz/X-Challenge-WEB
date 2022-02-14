import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss']
})
export class PhoneComponent {

  @Input() group!: FormGroup;
  @Input() controlName!: string;
  @Input() phoneCodeControlName!: string;
  @Input() nameKey!: string;
  @Input() collapsed: undefined | boolean;
  @Input() type: undefined | string;
  
  get isFormInvalid() {
    return !this.group.get(this.controlName)?.valid && this.group.get(this.controlName)?.touched;
  }

  get getErrors() {
    var control = this.group.get(this.controlName);
    var keys = control?.errors ? Object.keys(control?.errors) : [];
    return keys;
  }
  
  get isControlPassword() {
    return this.controlName.toLowerCase().indexOf('assword') > 0;
  }

  get isDisabled() {
    return this.group.disabled;
  }

}
