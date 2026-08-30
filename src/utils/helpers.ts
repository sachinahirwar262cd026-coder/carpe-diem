import { AqiCategory } from '../types';

export const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#10b981'; // Good (Green)
  if (aqi <= 100) return '#f59e0b'; // Moderate (Yellow/Amber)
  if (aqi <= 200) return '#f97316'; // Poor (Orange)
  if (aqi <= 300) return '#ef4444'; // Very Poor (Red)
  if (aqi <= 400) return '#7c3aed'; // Severe (Purple)
  return '#831843'; // Hazardous (Maroon)
};

export const getAqiCategory = (aqi: number): AqiCategory => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  if (aqi <= 400) return 'Severe';
  return 'Hazardous';
};

export const getAqiBadgeStyle = (category: AqiCategory): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'Good':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Moderate':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Poor':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'Very Poor':
      return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
    case 'Severe':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'Hazardous':
      return { bg: 'bg-rose-900/30', text: 'text-rose-400', border: 'border-rose-700/40' };
    default:
      return { bg: 'bg-slate-700/30', text: 'text-slate-300', border: 'border-slate-600' };
  }
};

export const getNoiseBadgeStyle = (db: number): { bg: string; text: string; border: string; label: string } => {
  if (db < 55) {
    return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Quiet / Normal' };
  }
  if (db < 65) {
    return { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Moderate' };
  }
  if (db < 75) {
    return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Loud Traffic' };
  }
  if (db < 85) {
    return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Very Loud (Violating)' };
  }
  return { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40', label: 'Hazardous / Extreme' };
};

export const getHealthAdvisory = (category: AqiCategory): { title: string; desc: string; asthmaWarning: string } => {
  switch (category) {
    case 'Good':
      return {
        title: 'Air Quality is Ideal',
        desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        asthmaWarning: 'Safe for asthmatic individuals. Great conditions for outdoor exercises.',
      };
    case 'Moderate':
      return {
        title: 'Acceptable Air Quality',
        desc: 'Air quality is acceptable; however, some pollutants may pose a moderate health concern for sensitive individuals.',
        asthmaWarning: 'Unusually sensitive people may experience minor respiratory symptoms.',
      };
    case 'Poor':
      return {
        title: 'Unhealthy for Sensitive Groups',
        desc: 'Members of sensitive groups (asthma, COPD, children, elderly) may experience health effects.',
        asthmaWarning: 'Asthmatic patients should keep quick-relief inhalers handy and reduce prolonged heavy outdoor exertion.',
      };
    case 'Very Poor':
      return {
        title: 'Unhealthy Air Quality',
        desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
        asthmaWarning: 'High Risk: Asthmatic individuals must wear N95 respirators outdoors and run HEPA air purifiers indoors.',
      };
    case 'Severe':
    case 'Hazardous':
      return {
        title: 'Emergency Health Warning',
        desc: 'Health alert: everyone may experience more serious health effects. Micro-pocket particulate levels critically elevated.',
        asthmaWarning: 'CRITICAL ALERT: Asthmatic patients and cardiac patients must remain strictly indoors with closed windows.',
      };
  }
};
