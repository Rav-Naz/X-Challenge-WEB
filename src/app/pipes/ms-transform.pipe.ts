import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'msTransform'
})
export class MsToDaysPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): number {
    var temp = args[0];
    let transformed: number = 0;
    transformed = value / 1000;
    if (temp == 's') {
      transformed %= 60;
    }
    if (temp == 'm') {
      transformed *= (1 / 60);
      transformed %= 60;
    }
    if (temp == 'h') {
      transformed *= (1 / 3600);
      transformed %= 24;
    }
    if (temp == 'd') {
      transformed *= (1 / (24 * 3600));
    }

    return Math.floor(transformed);
  }

}
