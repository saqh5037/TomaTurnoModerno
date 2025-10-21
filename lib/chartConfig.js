/**
 * Centralized Chart.js configuration
 * Registers all Chart.js components once to avoid duplicate registrations
 * Import this file in _app.js to ensure Chart.js is initialized before any page loads
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register all Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Export ChartJS for use in components if needed
export { ChartJS };

// Chart.js default configuration
export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [5, 5],
      },
    },
  },
};

// Common color schemes
export const colorSchemes = {
  primary: {
    background: 'rgba(79, 125, 243, 0.2)',
    border: 'rgb(79, 125, 243)',
  },
  success: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: 'rgb(16, 185, 129)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: 'rgb(245, 158, 11)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: 'rgb(239, 68, 68)',
  },
  purple: {
    background: 'rgba(107, 115, 255, 0.2)',
    border: 'rgb(107, 115, 255)',
  },
};

export default ChartJS;
