import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss']
})
export class InputFileComponent {

  @Input() group!: FormGroup;
  @Input() controlName!: string;
  @Input() nameKey!: string;
  @Input() collapsed: undefined | boolean;
  @Input() accept: string = ".pdf";
  @Output() file = new EventEmitter<any>();


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

  onFileSelected(event:any) {
    const file:File = event.target.files[0];

        if (file) {

          this.file.emit(file);
        }

  }

}
