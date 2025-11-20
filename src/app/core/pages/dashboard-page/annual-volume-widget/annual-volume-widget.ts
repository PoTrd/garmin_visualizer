import { Component, computed, input, Renderer2, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Activity } from '../../../../shared/model/activity.model';
import { TypeFilterType } from '../dashboard-page';

type Months = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

type displayedData = {
    month: Months;
    value: number;
}

@Component({
  selector: 'app-annual-volume-widget',
  imports: [],
  templateUrl: './annual-volume-widget.html',
  styleUrl: './annual-volume-widget.css',
})
export class AnnualVolumeWidget {
  @ViewChildren('animatedBar') bars!: QueryList<ElementRef>;

  constructor(private renderer: Renderer2) {}

  triggerAnimation(): void {
    this.bars.forEach((bar) => {
      this.renderer.removeClass(bar.nativeElement, 'animate');
      void bar.nativeElement.offsetWidth; // Trigger reflow to restart animation
      this.renderer.addClass(bar.nativeElement, 'animate');
    });
  }

  data = input<Activity[]>();
  filter = input<TypeFilterType>();
  lstMonths: Months[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  displayedData = computed<displayedData[]>(() => {
      const activities = this.data() ?? [];
      const monthsToDisplay = this.getLast12Months();
      const result: displayedData[] = [];
      for(let month of monthsToDisplay) {
          const monthActivities: Activity[] = activities.filter(activity => {
              const activityMonth = activity.date.toLocaleString('en-US', { month: 'long' }) as Months;
              return activityMonth === month;
          });
          let totalValue = 0;
          switch(this.filter()) {
              case 'Distance':
                  totalValue = monthActivities.reduce((sum, act) => sum + act.distance, 0);
                  break;
              case 'Duration':
                  totalValue = monthActivities.reduce((sum, act) => sum + act.duration, 0);
                  break;
              case 'Calories':
                  totalValue = monthActivities.reduce((sum, act) => sum + act.calories, 0);
                  break;
              case 'Ascent':
                  totalValue = monthActivities.reduce((sum, act) => sum + act.totalAscent, 0);
                  break;
          }
          
          result.push({
              month: month,
              value: totalValue
          });
      }
      const maxValue = Math.max(...result.map(d => d.value));
      
      for(let data of result) {
        data.value = maxValue ? (data.value / maxValue) * 100 : 0;
      }

      return result;
  });

  getLast12Months(): Months[] {
      const result: Months[] = [];
      const now = new Date();
      this.lstMonths.forEach((month, index) => {
          const monthIndex = (now.getMonth() + 1 - index + 12) % 12;
          result.unshift(this.lstMonths[monthIndex]);
      });
      return result;
  }

}
