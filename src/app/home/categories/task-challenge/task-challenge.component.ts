import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-task-challenge',
  templateUrl: './task-challenge.component.html',
  styleUrls: ['./task-challenge.component.scss']
})
export class TaskChallengeComponent implements OnInit, OnDestroy {
  categories: Array<Category> = [];
  private isScrollPaused: boolean = true;

  constructor(public translate: TranslateService) {
    const sub4 = translate.stream('home.competitions.categories').subscribe((categories: Array<Category>) => {
      this.categories = categories.filter((cat) => cat.id === 2);
    });
  }

  ngOnInit(): void {
    (document.getElementById('navigator') as HTMLElement).classList.add('navigator-tc');
    (document.getElementById('navigator-menu') as HTMLElement).classList.add('navigator-menu-tc');
    document.documentElement.classList.add('tc-scrollbar');
    window.scrollTo(0, 0);

  }

  ngOnDestroy(): void {
    (document.getElementById('navigator') as HTMLElement).classList.remove('navigator-tc');
    (document.getElementById('navigator-menu') as HTMLElement).classList.remove('navigator-menu-tc');

    document.documentElement.classList.remove('tc-scrollbar');
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
