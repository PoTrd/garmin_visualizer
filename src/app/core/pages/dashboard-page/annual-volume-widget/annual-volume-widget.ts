import { AfterViewInit, Component, computed, input } from '@angular/core';
import { Activity } from '../../../../shared/model/activity.model';

type Months = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

type displayedData = {
    month: Months;
    distanceInPercent: number;
    durationInPercent: number;
    caloriesInPercent: number;
    ascentInPercent: number;
    
}

@Component({
  selector: 'app-annual-volume-widget',
  imports: [],
  templateUrl: './annual-volume-widget.html',
  styleUrl: './annual-volume-widget.css',
})
export class AnnualVolumeWidget {
  data = input<Activity[]>();
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
          const totalDistance = monthActivities.reduce((sum, act) => sum + act.distance, 0);
          const totalDuration = monthActivities.reduce((sum, act) => sum + act.duration, 0);
          const totalCalories = monthActivities.reduce((sum, act) => sum + act.calories, 0);
          const totalAscent = monthActivities.reduce((sum, act) => sum + act.totalAscent, 0);
          
          result.push({
              month: month,
              distanceInPercent: totalDistance,
              durationInPercent: totalDuration,
              caloriesInPercent: totalCalories,
              ascentInPercent: totalAscent,
          });
      }
      const geMaxValue = (array: number[]) => Math.max(...array);
      const maxDistance = geMaxValue(result.map(d => d.distanceInPercent));
      const maxDuration = geMaxValue(result.map(d => d.durationInPercent));
      const maxCalories = geMaxValue(result.map(d => d.caloriesInPercent));
      const maxAscent = geMaxValue(result.map(d => d.ascentInPercent));
      
      for(let data of result) {
          data.distanceInPercent = maxDistance ? (data.distanceInPercent / maxDistance) * 100 : 0;
          data.durationInPercent = maxDuration ? (data.durationInPercent / maxDuration) * 100 : 0;
          data.caloriesInPercent = maxCalories ? (data.caloriesInPercent / maxCalories) * 100 : 0;
          data.ascentInPercent = maxAscent ? (data.ascentInPercent / maxAscent) * 100 : 0;
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
