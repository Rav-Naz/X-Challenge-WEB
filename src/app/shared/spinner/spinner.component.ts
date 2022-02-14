import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit{

  @Input() size = 80;
  
  ngOnInit(): void {
    const container =document.getElementById('spinner-container')!.style
    container.setProperty('--size', `${this.size}px`);
    const spinner =document.getElementById('spinner')!.style
    spinner.setProperty('--borderSize', `${this.size*0.075}px`);

  }

}
