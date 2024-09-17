import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Esp32Service } from '../../services/esp32.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {

  @Input() group!: FormGroup;
  @Input() controlName!: string;
  @Input() nameKey!: string;
  @Input() collapsed: undefined | boolean;
  @Input() type: undefined | string;
  @Input() placeholder: string = " ";
  @Input() disabled: boolean = false;
  @Input() showBarcodeIcon: boolean = false;

  constructor(public esp32Service: Esp32Service) { }

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
    return this.group.disabled || this.disabled;
  }

  get barcodeInput() {
    return (document.getElementById("barcode") as any).value as string;
  }

  updateActiveInput() {
    this.esp32Service.setActiveInput(this);
  }

  updateValueFromOutside(value: string) {
    this.group.get(this.controlName)?.setValue(value)
  }

  showModal() {
    const dialog = document.getElementById("customDialog") as any;
    (document.getElementById("barcode") as any).value = '';
    this.updateActiveInput();
    dialog?.showModal();
  }

  closeModal() {
    const dialog = document.getElementById("customDialog") as any;
    dialog?.close();
    if (this.barcodeInput.length >= 1) {
      this.esp32Service.uzytkownikIdHandler(this.barcodeInput, true);
    }
  }

}
