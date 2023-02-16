import { AuthService } from './../services/auth.service';
import { UserService } from './../services/user.service';
import { HttpService } from './../services/http.service';
import { Patreon } from './../models/patreon';
import { EventDescription } from './../models/event-description.model';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { DatePipe } from '@angular/common'
import { Category } from '../models/category';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TranslateService } from '@ngx-translate/core';
import { WindowSize } from '../models/window_size.model';
import { fromEvent, Observable, Subscription } from "rxjs";
// import Swiper core and required components
import SwiperCore, {
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
export class HomeComponent implements OnInit, AfterViewInit {

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
  public eventDate: Date = new Date(2023, 9, 20, 9, 0, 0);
  public eventEndDate: Date = new Date(2023, 9, 21, 18, 0, 0);
  public windowSize: WindowSize = { height: 1080, width: 1920 };
  public registerInfo: any = null;

  public timeLeft: number | undefined;
  public timeLeftSmashBots: number | undefined;
  public timeIsUp2: boolean = false;
  public timeIsUpSmashBots: boolean = false;
  public switcher = false;

  public config: SwiperOptions = {
    loop: true,
    // autoHeight: true,
    allowTouchMove: true,
    autoplay: { delay: 3000, disableOnInteraction: true },
    slidesPerView: 'auto',
    centeredSlides: true,
    lazy: true,

    // spaceBetween: 30,
    pagination: { clickable: true },
    navigation: true,
    // freeMode: true,
    on: {
      init: this.addColorInit,
      slideChange: this.addColor
    }
  }

  public imageList = [
    'A.Kotlarska(123).jpg',
    'A.Szkulska_LENS_UR_38.jpg',
    'J.Baran_SKNI_KOD(168).jpg',
    'J.Baran_SKNI_KOD(280).jpg',
    'sb/K.Szydelko_142.jpg',
    'J.Burlikowska_LENS_UR_6.jpg',
    'J.Urban_LENS_UR_21.jpg',
    'Justyna_Tropio_Lens_Ur_12.jpg',
    'sb/T.Hucko_LENS_UR_(110).JPG',
    'Justyna_Tropio_Lens_Ur_14.jpg',
    'Justyna_Tropio_Lens_Ur_19.jpg',
    'sb/T.Hucko_LENS_UR_(173).JPG',
    'Justyna_Tropio_Lens_Ur_24.jpg',
    'K.Dudzinska_23.jpg',
    'Justyna_Tropio_Lens_Ur_57.jpg',
    'K.Szydelko_32.jpg',
    'sb/T.Hucko_LENS_UR_(183).JPG',
    'KWronski_9480.jpg',
    'KWro_DJI_0314.jpg',
    'KWR_9233.jpg',
    'sb/T.Hucko_LENS_UR_(178).JPG'
  ]

  public dateList = [
    { date: new Date(2022, 9, 7), title: "home.news.points.register-end.title", content: "home.news.points.register-end.content", printedDate: "07.10.2022", id: "" },
    { date: new Date(2022, 8, 1), title: "home.news.points.register-start.title", content: "home.news.points.register-start.content", printedDate: "01.09.2022", id: "" },
    { date: new Date(2022, 10, 25), title: "home.news.points.event-start.title", content: "home.news.points.event-start.content", printedDate: "25-26.11.2022", id: "" },
  ]

  constructor(public translate: TranslateService, private httpService: HttpService, private authService: AuthService, public datepipe: DatePipe) {
    let teraz = new Date()
    this.dateList.push({ date: teraz, title: "home.news.points.now.title", content: "home.news.points.now.content", printedDate: this.datepipe.transform(teraz, 'dd.MM.YYYY')!.toString(), id: "" })
    this.dateList.sort((a, b) => { return a.date.getTime() - b.date.getTime(); });
    let iter = 0;
    this.dateList.forEach(element => {
      element.id = iter.toString();
      iter++;
    });
    setInterval(() => {
      this.switcher = !this.switcher;
    }, 5000)
    const sub1 = this.authService.info$.subscribe((data) => {
      if (data === undefined || data === null) return;
      this.eventDate = new Date((data as any).eventDate);
      if ((data as any).streamLink) {
        this.streamLink = (data as any).streamLink;
        // console.log((this.streamLink as any));
        this.registerInfo = (data as any).registerInfo;
      }
    })
    this.windowSize = { height: window.innerHeight, width: window.innerWidth };
    const resizeObs = fromEvent(window, 'resize') as Observable<any>;
    const sub2 = resizeObs.subscribe(size => {
      if (!size) { return; }
      this.windowSize = { height: size.currentTarget.innerHeight, width: size.currentTarget.innerWidth };
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
      if (typeof patreons === 'object') this.patreons = patreons;
    });
    const sub6 = translate.stream('home.patreons.tiers').subscribe((tiers: Array<string>) => {
      if (typeof tiers === 'object') this.patreonNames = tiers;
    });
    this.subs?.add(sub1).add(sub2).add(sub3).add(sub4).add(sub5).add(sub6);
  }

  ngOnInit() {
    // this.enableCompetitionsScrolling()\
    document.documentElement.style.setProperty('--swiper-theme-color', '#ffffff');
  }

  addColorInit() {
    (document.getElementsByClassName('swiper-slide-active')[0] as HTMLElement).children[0].classList.add('gallery-color');
  }
  addColor(args: any) {
    var img: HTMLElement;
    if (args.previousIndex < args.activeIndex) {
      img = (document.getElementsByClassName('swiper-slide-next')[0] as HTMLElement)
    } else {
      img = (document.getElementsByClassName('swiper-slide-prev')[0] as HTMLElement)
    }
    // console.log(img)
    if (img && !img.children[0].classList.contains('gallery-color')) {
      img.children[0].classList.add('gallery-color')
    }
    var img_old = (document.getElementsByClassName('swiper-slide-active')[0] as HTMLElement);
    // console.log(img)
    if (img_old && img_old.children[0].classList.contains('gallery-color')) {
      img_old.children[0].classList.remove('gallery-color')
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      //Add 'implements AfterViewInit' to the class.
      var swiperRight = (document.getElementsByClassName('swiper-button-next')[0] as HTMLElement);
      // swiperRight.style.padding = '6rem';
      swiperRight.style.transform = "scale(0.5) translateY(-50%)";
      swiperRight.style.backgroundColor = '#4BDA19';
      swiperRight.style.borderRadius = '10rem';
      swiperRight.style.boxShadow = '0 .2rem 2rem .5rem rgba(0, 0, 0, 0.5)';
      // var swiperRightAfter = (document.getElementsByClassName('swiper-button-next::after')[0] as HTMLElement);
      var swiperLeft = (document.getElementsByClassName('swiper-button-prev')[0] as HTMLElement);
      // swiperLeft.style.padding = '6rem';
      swiperLeft.style.transform = "scale(0.5) translateY(-50%)";
      swiperLeft.style.backgroundColor = '#4BDA19';
      swiperLeft.style.borderRadius = '10rem';
      swiperLeft.style.boxShadow = '0 .2rem 2rem .5rem rgba(0, 0, 0, 0.5)';
      var slidersInGallery = document.getElementsByClassName('swiper-slide');
      for (let index = 0; index < slidersInGallery.length; index++) {
        const slide = slidersInGallery[index] as HTMLElement;
        slide.style.width = 'auto';
      }
    }, 50)
    let iter = 0;
    this.dateList.forEach(element => {
      document.getElementById("card" + iter)?.setAttribute('data-aos-delay', ((iter + 1) * 250).toString());
      iter++;
    });
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
          await this.timeout(switchTime / temp);
          this.switchAnimationStateName = 'start';
          this.selectedEventIndex -= 1;
          await this.timeout(switchTime / temp);
          this.switchAnimationStateName = 'void';
        }
        else {
          this.switchAnimationStateName = 'start';
          await this.timeout(switchTime / temp);
          this.switchAnimationStateName = 'end';
          this.selectedEventIndex += 1;
          await this.timeout(switchTime / temp);
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
      if (!this.isScrollPaused) {
        if (lastScroll !== flavoursContainer.scrollLeft && !scrollingBack) {
          lastScroll = flavoursContainer.scrollLeft;
          flavoursContainer.scrollTo(flavoursContainer.scrollLeft + 1, 0);
        }
        else {
          this.isScrollPaused = true;
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

  refreshCounter(): void {
    if (this.eventDate === undefined) return;
    this.timeToEvent = this.eventDate.getTime() - new Date().getTime();
    if (Math.floor(this.timeToEvent / 1000) < 0) {
      this.timeIsUp = true;
    }
    if (!this.authService.accessToModifyExpirationDate) return;
    this.timeLeft = this.authService.accessToModifyExpirationDate.getTime() - new Date().getTime();
    if (Math.floor(this.timeLeft / 1000) < 0) {
      this.timeIsUp2 = true;
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
    return { [`patreons-class-${index}`]: true };
  }
  isDateBefore(data: Date) {
    return data.getTime() > new Date().getTime()
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

  get isMobile() {
    return this.windowSize.width <= 800;
  }

  get isLessThanWeek() {
    return this.timeLeft && Math.floor(this.timeLeft / 1000) < 604800;
  }

  get isLessThanWeekSmashBots() {
    return this.timeLeftSmashBots && Math.floor(this.timeLeftSmashBots / 1000) < 604800;
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

  get getDaysToEndRegistration() {
    return this.timeLeft ? Math.ceil(this.timeLeft / 86400000) : 100000;
  }

  get registerPercentageCompletion() {
    return this.registerInfo != null ? Math.ceil((this.registerInfo.aktualnie / this.registerInfo.limitOsob) * 100) : null
  }

  timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
function ViewChild(arg0: string, arg1: { static: boolean; }) {
  throw new Error('Function not implemented.');
}

