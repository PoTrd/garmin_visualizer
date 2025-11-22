
# Garmin Activity Visualizer

Visualize your Garmin activity data with clarity and style. This app lets you upload your exported Garmin CSV file and instantly see your training stats, trends, and progress—no account or cloud upload required.

## Features

- **Drag & Drop CSV Import**: Just drop your Garmin activities CSV file to get started.
- **Dashboard Overview**: See total activities, distance, duration, and ascent at a glance.
- **Interactive Filters**: Filter by activity type and year/month to focus on what matters.
- **Charts**: Annual and monthly volume widgets help you spot trends and stay motivated.
- **Detailed Table**: Browse all your activities with sortable stats like distance, pace, and heart rate.
- **Modern UI**: Clean, responsive design with Tailwind CSS and Chart.js.

## Quick Start

1. **Install dependencies**
	 ```bash
	 npm install
	 ```
2. **Run the app locally**
	 ```bash
	 ng serve
	 ```
3. Open your browser at [http://localhost:4200](http://localhost:4200)
4. On the home page, drag and drop your Garmin CSV export to unlock your stats. If the localStorage already contains data you can directly go on /dashboard page.

## CSV Format

Export your activities from Garmin Connect as a CSV file. The app expects columns like:

- `Type d'activité` (Activity Type)
- `Date`
- `Titre` (Title)
- `Distance`
- `Durée` (Duration)
- `Calories`
- `Fréquence cardiaque moyenne` (Avg HR)
- `Fréquence cardiaque maximale` (Max HR)
- `Allure moyenne` (Avg Pace)
- `Ascension totale` (Total Ascent)

If your file is missing columns, some stats may not display.

## Project Structure

- `src/app/core/pages/csv-loader-page/` — File upload and parsing UI
- `src/app/core/pages/dashboard-page/` — Main dashboard and widgets
- `src/app/shared/model/` — Activity data model
- `src/app/shared/services/csv-parser.service.ts` — CSV parsing logic

## Tech Stack

- [Angular](https://angular.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## Development

- **Build for production:**
	```bash
	npm run build
	```
<!-- - **Run tests:**
    ```bash
    npm test 
    ``` -->

## CI/CD

- **Production Deployment Workflow:**  
    The file `.github/workflows/production.yml` defines a GitHub Actions workflow for building and deploying the app automatically on pushes to the `production` branch.  



## License

MIT. This project is open source and free to use.

---

*Built for athletes who love their data, by someone who does too.*