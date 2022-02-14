import { AuthService } from './../services/auth.service';
import { UserService } from './../services/user.service';
import { HttpService } from './../services/http.service';
import { Patreon } from './../models/patreon';
import { EventDescription } from './../models/event-description.model';
import { Component, OnInit} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Category } from '../models/category';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TranslateService } from '@ngx-translate/core';
import { WindowSize } from '../models/window_size.model';
import { fromEvent, Observable, Subscription } from "rxjs";
// import Swiper core and required components
import SwiperCore , {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
  SwiperOptions,
} from 'swiper';
import { BehaviorSubject } from "rxjs";
import Swiper from "swiper/types/swiper-class";

// install Swiper components
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller
]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('switch', [

      state('start', style({
        opacity: 0,
        transform: 'translateY(-2rem)'
      })),
      state('end', style({
        opacity: 0,
        transform: 'translateY(10rem)'
      })),

      transition('void => start', [
        animate(`0.2s ease-in`)
      ]),
      transition('void => end', [
        animate('0.2s ease-out')
      ]),
      transition('end => void', [
        animate('0.2s ease-in')
      ]),
      transition('start => void', [
        animate('0.2s ease-out')
      ]),
      transition('start => end', [
        animate('0s')
      ]),
      transition('end => start', [
        animate('0s')
      ]),
    ])
  ],
})
export class HomeComponent implements OnInit{

  eventsList: Array<EventDescription> = [];
  categories: Array<Category> = [];
  patreons: Array<Patreon> = [];
  patreonNames: Array<string> = [];

  switchTime = 200;
  selectedEventIndex: number = 1;
  private switchTimer: any;
  private scrollTimer: any;
  private isScrollPaused: boolean = true;
  private subs: Subscription = new Subscription;
  public timeToEvent: number | undefined;
  public streamLink: SafeResourceUrl | undefined = undefined;
  public timeIsUp = false;
  public switchAnimationStateName: 'start' | 'void' | 'end' = 'void';
  public eventDate: Date = new Date(2022, 10, 28, 9, 0, 0);
  public windowSize: WindowSize = { height: 1080, width: 1920};

  public timeLeft: number | undefined;
  public timeLeftSmashBots: number | undefined;
  public timeIsUp2: boolean = false;
  public timeIsUpSmashBots: boolean = false;
  public switcher = false;

  public config: SwiperOptions = {
    loop: true,
    autoHeight: true,
    allowTouchMove: true,
    autoplay: { delay: 1000, disableOnInteraction: false },
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 30,
    pagination: { clickable: true },
    navigation: true

  }

  constructor(public translate: TranslateService, private httpService: HttpService, private authService: AuthService) {
    setInterval(() => {
      this.switcher = !this.switcher;
    }, 5000)
    const sub1 = this.authService.info$.subscribe((data) => {
      if(data === undefined || data === null) return;
      // this.eventDate = new Date((data as any).eventDate);
      if((data as any).streamLink) {
        this.streamLink = (data as any).streamLink;
      }
    })
    this.windowSize = {height: window.innerHeight, width: window.innerWidth };
    const resizeObs = fromEvent(window, 'resize') as Observable<any>;
    const sub2 = resizeObs.subscribe(size => {
      if (!size) { return; }
      this.windowSize = {height: size.currentTarget.innerHeight, width: size.currentTarget.innerWidth};
    })
    this.refreshCounter()
    setInterval(() => {
      this.refreshCounter()
    }, 1000);
    this.resetSwitchTimer();
    const sub3 = translate.stream('home.event-program.eventsList').subscribe((events: Array<EventDescription>) => {
      this.eventsList = events;
    });
    const sub4 = translate.stream('home.competitions.categories').subscribe((categories: Array<Category>) => {
      this.categories = categories;
    });
    const sub5 = translate.stream('home.patreons.patreonList').subscribe((patreons: Array<Patreon>) => {
      if(typeof patreons === 'object') this.patreons = patreons;
    });
    const sub6 = translate.stream('home.patreons.tiers').subscribe((tiers: Array<string>) => {
      if(typeof tiers === 'object') this.patreonNames = tiers;
    });
    this.subs?.add(sub1).add(sub2).add(sub3).add(sub4).add(sub5).add(sub6);
  }

  ngOnInit() {
    // this.enableCompetitionsScrolling()
  }


  async onSwitchEvent(eventIndex: number) {
    const switchTime = 200;
    this.resetSwitchTimer();
    if (eventIndex == this.selectedEventIndex) return;
    if (eventIndex > this.eventsList.length) {
      eventIndex = 1
    }
    else if (eventIndex < 1) {
      eventIndex = this.eventsList.length;
    }
    if (this.isMobile) {
      if (eventIndex < this.selectedEventIndex) {
        this.switchAnimationStateName = 'end';
        await this.timeout(switchTime);
        this.switchAnimationStateName = 'start';
        this.selectedEventIndex = eventIndex;
        await this.timeout(switchTime);
        this.switchAnimationStateName = 'void';
      }
      else {
        this.switchAnimationStateName = 'start';
        await this.timeout(switchTime);
        this.switchAnimationStateName = 'end';
        this.selectedEventIndex = eventIndex;
        await this.timeout(switchTime);
        this.switchAnimationStateName = 'void';
      }

    } else {
      let temp = Math.abs(eventIndex - this.selectedEventIndex);
      for (let index = 0; index < temp; index++) {
        if (eventIndex < this.selectedEventIndex) {
          this.switchAnimationStateName = 'end';
          await this.timeout(switchTime/temp);
          this.switchAnimationStateName = 'start';
          this.selectedEventIndex -= 1;
          await this.timeout(switchTime/temp);
          this.switchAnimationStateName = 'void';
        }
        else {
          this.switchAnimationStateName = 'start';
          await this.timeout(switchTime/temp);
          this.switchAnimationStateName = 'end';
          this.selectedEventIndex += 1;
          await this.timeout(switchTime/temp);
          this.switchAnimationStateName = 'void';
        }
      }
    }
  }

  resetSwitchTimer(): void {
    clearInterval(this.switchTimer);
    this.switchTimer = setInterval(async () => {
      await this.onSwitchEvent(this.selectedEventIndex % this.eventsList.length + 1);
    }, 15000)
  }

  
  enableCompetitionsScrolling(): void {
    let lastScroll = -1;
    let scrollingBack = false;
    this.pauseScrolling(false);
    clearInterval(this.scrollTimer);
    const flavoursContainer = document.getElementById('competitions-scroll')! as HTMLElement;
    this.scrollTimer = setInterval(() => {
      if(!this.isScrollPaused) {
        if (lastScroll !== flavoursContainer.scrollLeft && !scrollingBack) {
          lastScroll = flavoursContainer.scrollLeft;
          flavoursContainer.scrollTo(flavoursContainer.scrollLeft + 1, 0);
        }
        else {
          this.isScrollPaused  = true;
          scrollingBack = true;
          setTimeout(() => {
            flavoursContainer.scrollTo({
              left: 0,
              behavior: 'smooth',
            });
            setTimeout(() => {
              this.isScrollPaused = false; 
              scrollingBack = false;
            }, 1000)
          }, 500)
        }
      }
    }, 15);
  }

  pauseScrolling(value: boolean) {
    this.isScrollPaused = value;
  }

  refreshCounter() :void {
    if(this.eventDate === undefined) return;
    this.timeToEvent = this.eventDate.getTime() - new Date().getTime();
    if(Math.floor(this.timeToEvent/1000) < 0) {
      this.timeIsUp = true;
    }
    if(!this.authService.accessToModifyExpirationDate || !this.authService.accessToModifySmashBotsExpirationDate) return;
    this.timeLeft = this.authService.accessToModifyExpirationDate.getTime() - new Date().getTime();
    this.timeLeftSmashBots = this.authService.accessToModifySmashBotsExpirationDate.getTime() - new Date().getTime();
    if(Math.floor(this.timeLeft/1000) < 0) {
      this.timeIsUp2 = true;
    }
    if(Math.floor(this.timeLeftSmashBots/1000) < 0) {
      this.timeIsUpSmashBots = true;
    }
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

  getAllPatreonsWithIndex(index: number) {
    return this.patreons.filter(element => element.patreonCategory === index);
  }

  openUrl(url: string): void {
    window.open(url);
  }

  patreonClassPicker(index: number) {
    return {[`patreons-class-${index}`]: true};
  }

  get descriptionOfSelectedEvent(): string | undefined {
    return this.eventsList.find((event) => event.id === this.selectedEventIndex)?.description;
  }
  get nameOfSelectedEvent(): string | undefined {
    return this.eventsList.find((event) => event.id === this.selectedEventIndex)?.name;
  }

  get iconOfSelectedEvent(): string {
    let icon = this.eventsList.find((event) => event.id === this.selectedEventIndex)?.icon;
    return icon == undefined ? '' : icon;
  }

  get isMobile()
  {
    return this.windowSize.width <= 800;
  }

  get isLessThanWeek() {
    return this.timeLeft && Math.floor(this.timeLeft/1000) < 604800;
  }

  get isLessThanWeekSmashBots() {
    return this.timeLeftSmashBots && Math.floor(this.timeLeftSmashBots/1000) < 604800;
  }

  get isEnglish() {
    return this.translate.currentLang
  }
  
  get getCurrnetYear() {
    return new Date().getFullYear();
  }

  get getEventDate() {
    return this.eventDate;
  }

  get getEventDateDay() {
    return this.eventDate.getDate();
  }

  timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
function ViewChild(arg0: string, arg1: { static: boolean; }) {
  throw new Error('Function not implemented.');
}

