import { AfterViewInit, Component, computed, effect, ElementRef, signal, viewChild, ViewChild } from '@angular/core';
import { Activity } from '../../../shared/model/activity.model';
import { Chart } from 'chart.js/auto';
import { filter } from 'rxjs';


type PeriodMode = 'predefined' | 'custom';

type ActivityFilterType = 'All' | 'Running' | 'Cycling' | 'Hiking';
type PeriodFilterType = 'All' | 'Current year' | 'Current month' | 'Current week';
type TypeFilterType = 'Distance' | 'Duration' | 'Calories' | 'Ascent';
type PeriodTypeFilter = 'Day' | 'Week' | 'Month' | 'Year';

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

  periodTypeFilters: PeriodTypeFilter[] = ['Day', 'Week', 'Month', 'Year'];
  activePeriodTypeFilter = signal<PeriodTypeFilter>('Day');


  filteredActivities = computed(() => {
    const activities = this.activities();
    const activityFilter = this.activeActivityFilter();
    const periodFilter = this.activePeriodFilter();
    
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
      const _ = this.activePeriodTypeFilter();
      if (this.isDataLoaded()) {
        this.createCharts();
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

  createCharts(): void {
    const canvasRef = this.activitiesCanvas();
    if (!canvasRef?.nativeElement) return;

    const ctx = canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.activitiesChart) {
      this.activitiesChart.destroy();
    }

    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';

    const chartType: any = this.activePeriodTypeFilter() === 'Day' ? 'line' : 'bar';

    this.activitiesChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: [],
        datasets: [
          (chartType === 'line'
            ? {
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
            : {
                label: '',
                data: [],
                backgroundColor: 'rgba(99,102,241,0.9)',
                borderColor: '#6366F1',
                borderWidth: 1,
              }
          )
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
                const maybeDate = new Date(label);
                if (!isNaN(maybeDate.getTime())) {
                  return maybeDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit'
                  });
                }
                return String(label);
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

  updateCharts(): void {
    const acts = this.filteredActivities().slice().sort((a, b) => a.date.getTime() - b.date.getTime());
    if (!this.activitiesChart) return;

    const periodType = this.activePeriodTypeFilter();
    const typeFilter = this.activeTypeFilter();

    const aggMap = new Map<string, number>();
    const labelMap = new Map<string, string>();

    const getValue = (a: Activity): number => {
      switch (typeFilter) {
        case 'Distance': return a.distance;
        case 'Duration': return a.duration;
        case 'Calories': return a.calories;
        case 'Ascent': return a.totalAscent;
        default: return 0;
      }
    };

    for (const a of acts) {
      const d = a.date;
      if (!d) continue;

      let key: string;
      let label: string;

      switch (periodType) {
        case 'Day': {
          key = d.toISOString().split('T')[0];
          label = key;
          break;
        }
        case 'Week': {
          const weekStart = this.getFirstDayOfWeek(new Date(d));
          key = weekStart.toISOString().split('T')[0];
          label = weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          break;
        }
        case 'Month': {
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          label = d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
          break;
        }
        case 'Year': {
          key = `${d.getFullYear()}`;
          label = key;
          break;
        }
        default:
          continue;
      }

      const value = getValue(a);
      aggMap.set(key, (aggMap.get(key) || 0) + value);
      if (!labelMap.has(key)) labelMap.set(key, label);
    }

    if (aggMap.size === 0) {
      this.activitiesChart.data.labels = [];
      this.activitiesChart.data.datasets[0].data = [];
      try { this.activitiesChart.update(); } catch { /* no-op */ }
      return;
    }

    const sortedKeys = Array.from(aggMap.keys()).sort((k1, k2) => new Date(k1).getTime() - new Date(k2).getTime());

    const labels = sortedKeys.map(k => labelMap.get(k) || k);
    const rawData = sortedKeys.map(k => aggMap.get(k) || 0);

    const data = rawData.map(v => {
      switch (typeFilter) {
        case 'Distance': return Number(v.toFixed(2));
        case 'Duration': return Number((v / 3600).toFixed(2));
        case 'Calories': return Math.round(v);
        case 'Ascent': return Math.round(v);
        default: return Number(v.toFixed(2));
      }
    });

    this.activitiesChart.data.labels = labels;
    this.activitiesChart.data.datasets[0].data = data;
    try { this.activitiesChart.update(); } catch { /* no-op */ }
  }
}
