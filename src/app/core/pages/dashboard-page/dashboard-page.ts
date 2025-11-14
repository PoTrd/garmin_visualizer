import { AfterViewInit, Component, computed, effect, ElementRef, signal, viewChild, ViewChild } from '@angular/core';
import { Activity } from '../../../shared/model/activity.model';
import { Chart } from 'chart.js/auto';


type PeriodMode = 'predefined' | 'custom';

type ActivityFilterType = 'All' | 'Running' | 'Cycling' | 'Hiking';
type PeriodFilterType = 'All' | 'Current year' | 'Current month' | 'Current week';
type TypeFilterType = 'Distance' | 'Duration' | 'Calories' | 'Ascent';
type PeriodTypeFilter = 'None' | 'Day' | 'Week' | 'Month' | 'Year';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage implements AfterViewInit {
  activitiesCanvas = viewChild<ElementRef<HTMLCanvasElement>>('activitiesChart');
  private activitiesChart: any = null;
  
  activities = signal<Activity[]>([]);

  periodMode = signal<PeriodMode>('predefined');
  
  isDataLoaded = computed(() => this.activities().length > 0);
  
  activityFilters: ActivityFilterType[] = ['All', 'Running', 'Cycling', 'Hiking'];
  activeActivityFilter = signal<ActivityFilterType>('All');

  typeFilters: TypeFilterType[] = ['Distance', 'Duration', 'Calories', 'Ascent'];
  activeTypeFilter = signal<TypeFilterType>('Distance');
  
  periodFilters: PeriodFilterType[] = ['All', 'Current year', 'Current month', 'Current week'];
  activePeriodFilter = signal<PeriodFilterType>('All');

  periodTypeFilters: PeriodTypeFilter[] = ['None', 'Day', 'Week', 'Month', 'Year'];
  activePeriodTypeFilter = signal<PeriodTypeFilter>('None');


  filteredActivities = computed(() => {
    const activities = this.activities();
    const activityFilter = this.activeActivityFilter();
    const periodFilter = this.activePeriodFilter();
    const typeFilter = this.activeTypeFilter();
    const periodTypeFilter = this.activePeriodTypeFilter();

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

    if (periodFilter !== 'All') {
      const today = new Date();
      filtered = filtered.filter(activity => {
          const activityDate = activity.date;
          if (!activityDate) return false;

          if (periodFilter === 'Current year') {
              return activityDate.getFullYear() === today.getFullYear();
          }
          if (periodFilter === 'Current month') {
              return activityDate.getFullYear() === today.getFullYear() && activityDate.getMonth() === today.getMonth();
          }
          if (periodFilter === 'Current week') {
              const firstDayOfWeek = this.getFirstDayOfWeek(new Date(today));
              const lastDayOfWeek = new Date();
              lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
              return activityDate >= firstDayOfWeek && activityDate <= lastDayOfWeek;
          }
          return true;
      });
    }

    if (typeFilter !== 'Distance') {
      if (typeFilter === 'Duration') {
        filtered = filtered.sort((a, b) => b.duration - a.duration);
      } else if (typeFilter === 'Calories') {
        filtered = filtered.sort((a, b) => b.calories - a.calories);
      } else if (typeFilter === 'Ascent') {
        filtered = filtered.sort((a, b) => b.totalAscent - a.totalAscent);
      }
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
      if (this.isDataLoaded() && this.activitiesChart) {
        this.updateCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    const storedActivities = localStorage.getItem('activities');
    if (storedActivities) {
      this.createCharts();
      this.activities.set(JSON.parse(storedActivities).map((act: any) => ({
        ...act,
        date: new Date(act.date)
      })));
    }
  }

  setActivityFilter(filter: ActivityFilterType): void {
    this.activeActivityFilter.set(filter);
  }

  setPeriodFilter(filter: PeriodFilterType): void {
    this.activePeriodFilter.set(filter);
  }

  setPeriodMode(mode: PeriodMode): void {
    this.periodMode.set(mode);
  }

  setTypeFilter(filter: TypeFilterType): void {
    this.activeTypeFilter.set(filter);
  }

  setPeriodTypeFilter(filter: PeriodTypeFilter): void {
    this.activePeriodTypeFilter.set(filter);
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

  private createCharts(): void {
    const canvasRef = this.activitiesCanvas();
    if (!canvasRef?.nativeElement) return;

    const ctx = canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.activitiesChart) {
      this.activitiesChart.destroy();
    }

    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.color = '#94a3b8';     // slate-400
    Chart.defaults.borderColor = '#334155'; // slate-700

    this.activitiesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            fill: true,
            tension: 0.25,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              callback: (value: any, index: number) => {
                const label = (this.activitiesChart?.data?.labels || [])[index];
                if (!label) return '';
                const d = new Date(label);
                return d.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit'
                });
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              padding: 6
            },
            grid: {
              color: 'rgba(0,0,0,0.06)'
            }
          }
        }
      }
    });

    this.updateCharts();
  }

  private updateCharts(): void {
    const acts = this.filteredActivities().slice().sort((a, b) => a.date.getTime() - b.date.getTime());
    if (this.activitiesChart) {
      const labels = acts.map(a =>
        a.date.toISOString().split('T')[0]
      );
      const data = acts.map(a => Number(a.distance.toFixed(2)));
      this.activitiesChart.data.labels = labels;
      this.activitiesChart.data.datasets[0].data = data;
      try { this.activitiesChart.update(); } catch (e) { /* no-op */ }
    }
  }
}
