import { ActivityType } from "../enum/activity-type.enum";

export interface Activity {
  activityType: ActivityType;
  date: Date;
  title: string;
  distance: number;
  calories: number;
  duration: number;
  avgHR: number;
  maxHR: number;
  avgPace: string;
  totalAscent: number;
}
