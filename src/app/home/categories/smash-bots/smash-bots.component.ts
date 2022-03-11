import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Category } from 'src/app/models/category';
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
  selector: 'app-smash-bots',
  templateUrl: './smash-bots.component.html',
  styleUrls: ['./smash-bots.component.scss']
})
export class SmashBotsComponent implements OnInit, OnDestroy, AfterViewInit {
  categories: Array<Category> = [];
  private isScrollPaused: boolean = true;
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
    'J.Baran_SKNI_KOD (167).jpg',
    'K.Szydelko_142.jpg',
    'K.Szydelko_146.jpg',
    'T.Hućko_LENS UR_ (110).JPG',
    'T.Hućko_LENS UR_ (156).JPG',
    'T.Hućko_LENS UR_ (173).JPG',
    'T.Hućko_LENS UR_ (178).JPG',
    'T.Hućko_LENS UR_ (181).JPG',
    'T.Hućko_LENS UR_ (183).JPG'
  ]


  constructor(public translate: TranslateService) {
    const sub4 = translate.stream('home.competitions.categories').subscribe((categories: Array<Category>) => {
      this.categories = categories.filter((cat) => cat.id === 1);
    });
  }

  ngOnInit(): void {
    (document.getElementById('navigator') as HTMLElement).classList.add('navigator-sb');
    (document.getElementById('navigator-menu') as HTMLElement).classList.add('navigator-menu-sb');
    document.documentElement.style.setProperty('--swiper-theme-color', '#ffffff');
    document.documentElement.classList.add('sb-scrollbar');
    window.scrollTo(0, 0);

  }
  addColorInit() {
   (document.getElementsByClassName('swiper-slide-active')[0] as HTMLElement).children[0].classList.add('gallery-color');
  }
  addColor(args:any) {
    var img:HTMLElement;
    if(args.previousIndex < args.activeIndex) {
     img = (document.getElementsByClassName('swiper-slide-next')[0] as HTMLElement)
    } else {
      img = (document.getElementsByClassName('swiper-slide-prev')[0] as HTMLElement)
    }
    // console.log(img)
    if(img && !img.children[0].classList.contains('gallery-color')) {
      img.children[0].classList.add('gallery-color')
    }
    var img_old = (document.getElementsByClassName('swiper-slide-active')[0] as HTMLElement);
    // console.log(img)
    if(img_old && img_old.children[0].classList.contains('gallery-color')) {
      img_old.children[0].classList.remove('gallery-color')
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    var swiperRight = (document.getElementsByClassName('swiper-button-next')[0] as HTMLElement);
    // swiperRight.style.padding = '6rem';
    swiperRight.style.transform = "scale(0.5) translateY(-50%)";
    swiperRight.style.backgroundColor = '#9c0101';
    swiperRight.style.borderRadius = '10rem';
    swiperRight.style.boxShadow = '0 .2rem 2rem .5rem rgba(0, 0, 0, 0.5)';
    // var swiperRightAfter = (document.getElementsByClassName('swiper-button-next::after')[0] as HTMLElement);
    var swiperLeft = (document.getElementsByClassName('swiper-button-prev')[0]  as HTMLElement);
    // swiperLeft.style.padding = '6rem';
    swiperLeft.style.transform = "scale(0.5) translateY(-50%)";
    swiperLeft.style.backgroundColor = '#9c0101';
    swiperLeft.style.borderRadius = '10rem';
    swiperLeft.style.boxShadow = '0 .2rem 2rem .5rem rgba(0, 0, 0, 0.5)';
    var slidersInGallery = document.getElementsByClassName('swiper-slide');
    for (let index = 0; index < slidersInGallery.length; index++) {
      const slide = slidersInGallery[index] as HTMLElement;
      slide.style.width = 'auto';
    }
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
