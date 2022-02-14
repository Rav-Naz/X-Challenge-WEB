import { FormGroup } from '@angular/forms';

export function AlreadyExist(controlName: string, searchList: Array<any>){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const exist = searchList.findIndex(element => element.uzytkownik_uuid === control.value) >= 0;
        if (control.errors && !control.errors.alreadyExistValidator) {
            return;
        }
        if (exist) {
            control.setErrors({ alreadyExistValidator: true });
        } else {
            control.setErrors(null);
        }
    }
}