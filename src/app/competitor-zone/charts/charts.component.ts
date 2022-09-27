import { Subscription, fromEvent, Observable } from 'rxjs';
import { CategoriesService } from './../../services/categories.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { WindowSize } from 'src/app/models/window_size.model';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  host: {
    'class': 'router-flex'
  }

})
export class ChartsComponent implements OnDestroy {

  public windowSize: WindowSize = { height: 1080, width: 1920};


  options: any = {
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: '0%',
      left: '0%',
      position: 'left',
      textStyle: {
        color: '#fff',
        fontSize: '15'
      }
    },
    series: [
      {
        name: 'Kategorie',
        type: 'pie',
        radius: ['50%', '90%'],
        left: '20%',
        itemStyle: {
          borderRadius: 20,
          borderColor: '#2E2C2E',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center',
          color: '#fff'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: '15',
            fontWeight: 'bold',
            fontFamily: 'Goldman',
            formatter:'{b}:\n\n{c}'
          }
        },
        labelLine: {
          show: true
        },
        data: [],
        stillShowZeroSum: false
      }
    ]
  };
  subs: Subscription = new Subscription();
  series: any;

  constructor(private categoriesService: CategoriesService) {
    const sub1 = this.categoriesService.categories$.subscribe((data) => {
      if (data) {
        this.series = [...data].map((el) => {
          return {value: el.ilosc_robotow, name: el.nazwa}
        })
        this.buildOptions();
      }
    })
    this.windowSize = {height: window.innerHeight, width: window.innerWidth };
    const resizeObs = fromEvent(window, 'resize') as Observable<any>;
    const sub2 = resizeObs.subscribe(size => {
      if (!size) { return; }
      this.windowSize = {height: size.currentTarget.innerHeight, width: size.currentTarget.innerWidth};
      this.buildOptions();
    })
    this.subs.add(sub1);
  }

  buildOptions() {
    this.options = {
      legend: {
        // type: 'scroll',
        orient: this.isMobile ? 'horizontal' : 'vertical',
        top: '0%',
        left: '0%',
        // bottom: '50%',
        position: this.isMobile ? 'center' : 'left',
        textStyle: {
          color: '#fff',
          fontSize: this.isMobile ? '10' :'15'
        }
      },
      series: [
        {
          name: 'Kategorie',
          type: 'pie',
          radius: ['50%', '90%'],
          top: this.isMobile ? '40%' : '0%',
          left: this.isMobile ? '0%' : '20%',
          itemStyle: {
            borderRadius: this.isMobile ? 10 : 20,
            borderColor: '#2E2C2E',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center',
            color: '#fff'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            label: {
              show: true,
              fontSize: '15',
              fontWeight: 'normal',
              fontFamily: 'Goldman',
              formatter:'{b}:\n\n{c}'
            }
          },
          labelLine: {
            show: true
          },
          data: this.series,
          stillShowZeroSum: false
        }
      ]
    };
  }

  get isMobile()
  {
    return this.windowSize.width <= 800;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
