import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-smash-bots',
  templateUrl: './smash-bots.component.html',
  styleUrls: ['./smash-bots.component.scss']
})
export class SmashBotsComponent implements OnInit {
  categories: Array<Category> = [];
  private isScrollPaused: boolean = true;

  constructor(public translate: TranslateService) {
    const sub4 = translate.stream('home.competitions.categories').subscribe((categories: Array<Category>) => {
      this.categories = categories.filter((cat) => cat.id === 1);
    });
  }

  ngOnInit(): void {
    (document.getElementById('navigator') as HTMLElement).classList.add('navigator-sb');
    (document.getElementById('navigator-menu') as HTMLElement).classList.add('navigator-menu-sb');

    document.documentElement.classList.add('sb-scrollbar');
    window.scrollTo(0, 0);

  }

  ngOnDestroy(): void {
    (document.getElementById('navigator') as HTMLElement).classList.remove('navigator-sb');
    (document.getElementById('navigator-menu') as HTMLElement).classList.remove('navigator-menu-sb');

    document.documentElement.classList.remove('sb-scrollbar');
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
