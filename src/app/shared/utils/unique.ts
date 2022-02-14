import { FormGroup } from '@angular/forms';

export function onlyUnique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
}