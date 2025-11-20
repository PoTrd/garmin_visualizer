import { AfterViewInit, Component, computed, effect, signal } from '@angular/core';
import { Activity } from '../../../shared/model/activity.model';
import { AnnualVolumeWidget } from './annual-volume-widget/annual-volume-widget';


type PeriodMode = 'predefined' | 'custom';

type ActivityFilterType = 'All' | 'Running' | 'Cycling' | 'Hiking';
export type TypeFilterType = 'Distance' | 'Duration' | 'Calories' | 'Ascent';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [
    AnnualVolumeWidget
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage implements AfterViewInit {
  activities = signal<Activity[]>([]);

  periodMode = signal<PeriodMode>('predefined');
  
  isDataLoaded = computed(() => this.activities().length > 0);
  
  activityFilters: ActivityFilterType[] = ['All', 'Running', 'Cycling', 'Hiking'];
  activeActivityFilter = signal<ActivityFilterType>('All');

  typeFilters: TypeFilterType[] = ['Distance', 'Duration', 'Calories', 'Ascent'];
  activeTypeFilter = signal<TypeFilterType>('Distance');
  
  filteredActivities = computed(() => {
    const activities = this.activities();
    const activityFilter = this.activeActivityFilter();
    
    let filtered = activities;

    if (activityFilter !== 'All') {
        filtered = activities.filter(activity => {
            const type = activity.activityType;
            if (activityFilter === 'Running') return type === 'Course à pied' || type === 'Trail' || type === 'Course à pied sur tapis roulant';
            if (activityFilter === 'Cycling') return type.includes('Cyclisme');
            if (activityFilter === 'Hiking') return type === 'Randonnée';
            return false;
        });
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  isNoActivityToDisplay = computed(() => this.filteredActivities().length === 0);

  summaryStats = computed(() => {
    const acts = this.filteredActivities();
    const totalDistance = acts.reduce((sum, act) => sum + act.distance, 0);
    const totalDuration = acts.reduce((sum, act) => sum + act.duration, 0);
    const totalAscent = acts.reduce((sum, act) => sum + act.totalAscent, 0);
    
    return {
      count: acts.length,
      totalDistance,
      totalDuration,
      totalAscent,
    };
  });

  constructor() {
    effect(() => {
      if (this.isDataLoaded()) {
      }
    });
  }

  ngAfterViewInit(): void {
    const storedActivities = localStorage.getItem('activities');
    if (storedActivities) {
      this.activities.set(JSON.parse(storedActivities).map((act: any) => ({
        ...act,
        date: new Date(act.date)
      })));
    }
  }

  setActivityFilter(filter: ActivityFilterType): void {
    this.activeActivityFilter.set(filter);
  }

  setPeriodMode(mode: PeriodMode): void {
    this.periodMode.set(mode);
  }

  setTypeFilter(filter: TypeFilterType): void {
    this.activeTypeFilter.set(filter);
  }

  formatDuration(totalSeconds: number): string {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  getFirstDayOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }
}
