import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-robomotion',
  templateUrl: './robomotion.component.html',
  styleUrls: ['./robomotion.component.scss']
})
export class RobomotionComponent implements OnInit {

  categories: Array<Category> = [];
  private isScrollPaused: boolean = true;

  constructor(public translate: TranslateService) {
    const sub4 = translate.stream('home.competitions.categories').subscribe((categories: Array<Category>) => {
      this.categories = categories.filter((cat) => [1,2].indexOf(cat.id) < 0);
    });
  }

  ngOnInit(): void {
    (document.getElementById('navigator') as HTMLElement).classList.add('navigator-rm');
    (document.getElementById('navigator-menu') as HTMLElement).classList.add('navigator-menu-black');
    (document.getElementById('navigator-menu') as HTMLElement).classList.add('navigator-menu-rm');

    document.documentElement.classList.add('rm-scrollbar');
    window.scrollTo(0, 0);

  }

  ngOnDestroy(): void {
    (document.getElementById('navigator') as HTMLElement).classList.remove('navigator-rm');
    (document.getElementById('navigator-menu') as HTMLElement).classList.remove('navigator-menu-black');
    (document.getElementById('navigator-menu') as HTMLElement).classList.remove('navigator-menu-rm');


    document.documentElement.classList.remove('rm-scrollbar');
  }

  flipCard(event: Event, direction: 'front' | 'back') {
    var allFliped = document.getElementsByClassName("is-flipped") as HTMLCollectionOf<Element>;
    for (let i = 0; i < allFliped.length; i++) {
      allFliped[i].classList.remove("is-flipped");
    }
    if (direction === 'back') {
      let target = event.target as HTMLElement;
      ((target.parentElement as HTMLElement).parentElement as HTMLElement).classList.toggle('is-flipped')
    }
  }

  
  openUrl(url: string): void {
    window.open(url);
  }
  pauseScrolling(value: boolean) {
    this.isScrollPaused = value;
  }
}
