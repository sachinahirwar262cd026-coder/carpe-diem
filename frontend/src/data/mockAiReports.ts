import { AiRecommendation } from '../types';

export interface EnvironmentalReportSummary {
  reportId: string;
  generatedDate: string;
  reportingPeriod: string;
  executiveSummary: string;
  criticalHighlights: string[];
  airQualityStatus: {
    averageAqi: number;
    highestPocket: string;
    dominantPollutant: string;
    forecastTrend: string;
    asthmaWarningActive: boolean;
  };
  noiseStatus: {
    peakNoiseDb: number;
    worstPocket: string;
    primaryCause: string;
    nighttimeViolationsCount: number;
  };
  recommendations: AiRecommendation[];
}

export const CURRENT_AI_REPORT: EnvironmentalReportSummary = {
  reportId: 'SIH-ENV-REP-2026-088',
  generatedDate: '29 August 2026, 23:15 IST',
  reportingPeriod: 'Last 24 Hours & Next 24-Hour Horizon',
  executiveSummary:
    'Comprehensive multi-modal data fusion of CPCB ground stations, OpenWeather API meteorological telemetry, CORTN traffic-to-noise estimations, and geotagged citizen acoustic complaints indicates severe compounding air and noise stress across major metropolitan transit arteries and industrial pockets. The WVPBL-BiLSTM forecasting model indicates severe particulate accumulation during morning rush hours (06:00 - 09:00 IST) due to meteorological temperature inversion and low boundary layer mixing.',
  criticalHighlights: [
    'Anand Vihar ISBT (Delhi) exhibits a severe dual crisis: AQI 368 with acute PM2.5 concentration, accompanied by sustained 86.4 dB(A) noise levels.',
    'Silk Board Junction (Bengaluru) registered 31 acoustic noise complaints within 4 hours, verified by CNN Mel-spectrogram analysis as sustained heavy commercial horn usage.',
    'Atmospheric dispersion model flags an active toxic plume near Wazirpur Industrial Phase 2 due to unauthorized open material combustion.',
    'NITK Surathkal / Mangalore coastal pocket remains within moderate parameters (AQI 62), but NH-66 freight corridor registers recurrent nighttime noise spikes (>81 dB).'
  ],
  airQualityStatus: {
    averageAqi: 284,
    highestPocket: 'Wazirpur Industrial Area (AQI 395)',
    dominantPollutant: 'PM 2.5 (Fine Respirable Particulates)',
    forecastTrend: 'Worsening by +18% between 06:00 AM - 09:00 AM',
    asthmaWarningActive: true,
  },
  noiseStatus: {
    peakNoiseDb: 96.4,
    worstPocket: 'Wazirpur Heavy Machinery & Anand Vihar Flyover',
    primaryCause: 'Severe Traffic Gridlock & Industrial Operations',
    nighttimeViolationsCount: 42,
  },
  recommendations: [
    {
      id: 'REC-01',
      priority: 'Critical',
      targetType: 'Air Quality',
      location: 'Anand Vihar ISBT & Surrounding 2km Radius',
      city: 'Delhi NCR',
      problemStatement: 'Severe PM2.5 concentration (165 µg/m³) exceeding national standard by 275% during morning commute hours.',
      modelConfidence: 98.2,
      recommendedAction: 'Deploy 4 high-capacity Mobile Anti-Smog Guns and enforce mandatory mist spraying along Vikas Marg arterial corridor.',
      authorityResponsible: 'Municipal Corp',
      estimatedImpact: 'Expected 22-28% reduction in local PM2.5 / PM10 concentration within 3 hours of deployment.',
      timeframe: 'Immediate (< 2 hrs)',
      status: 'In Progress',
    },
    {
      id: 'REC-02',
      priority: 'Critical',
      targetType: 'Noise Reduction',
      location: 'Central Silk Board Flyover Junction & Madiwala Ramp',
      city: 'Bengaluru',
      problemStatement: 'Sustained acoustic violations exceeding 85 dB(A) in commercial/mixed transit hub with 31 verified citizen complaints.',
      modelConfidence: 97.4,
      recommendedAction: 'Dynamically retime traffic signals via Intelligent Traffic System (ITS) and deploy automated acoustic radar challans for pressure horn violations.',
      authorityResponsible: 'Traffic Police',
      estimatedImpact: 'Projected 12-16 dB(A) drop in peak horn frequency and 35% improvement in vehicular throughput speed.',
      timeframe: 'Immediate (< 2 hrs)',
      status: 'Pending Dispatch',
    },
    {
      id: 'REC-03',
      priority: 'High',
      targetType: 'Air Quality',
      location: 'Wazirpur Industrial Area Phase 2',
      city: 'Delhi NCR',
      problemStatement: 'AI visual recognition confirmed open industrial waste combustion emitting dense particulate smoke plume.',
      modelConfidence: 98.4,
      recommendedAction: 'Dispatch SPCB Flying Enforcement Squad for on-site inspection, seize unauthorized incineration equipment, and impose environmental compensation fine.',
      authorityResponsible: 'State Pollution Control Board',
      estimatedImpact: 'Eliminates localized severe toxic hotspot contributing to ~40 AQI point spike across North Delhi.',
      timeframe: 'Immediate (< 2 hrs)',
      status: 'In Progress',
    },
    {
      id: 'REC-04',
      priority: 'High',
      targetType: 'Noise Reduction',
      location: 'BKC Metro Construction Line 3 Zone',
      city: 'Mumbai',
      problemStatement: 'Nighttime hydraulic drilling and unshielded diesel generator vibration violating 55 dB nighttime ambient threshold.',
      modelConfidence: 94.5,
      recommendedAction: 'Mandate acoustic sound barrier curtains around active piling rigs and switch diesel generators to grid-tied silent acoustic enclosures.',
      authorityResponsible: 'Public Works Dept (PWD)',
      estimatedImpact: 'Expected 18 dB(A) attenuation at adjacent commercial and residential facade boundaries.',
      timeframe: 'Short Term (24-48 hrs)',
      status: 'Pending Dispatch',
    },
    {
      id: 'REC-05',
      priority: 'Medium',
      targetType: 'Combined Action',
      location: 'NH-66 Surathkal Freight Corridor (NITK Zone)',
      city: 'NITK Surathkal / Mangalore',
      problemStatement: 'Uncovered clinker transport and high-speed freight braking creating fugitive dust and 81+ dB roadside disturbance.',
      modelConfidence: 93.8,
      recommendedAction: 'Mandate automated tarpaulin checking at Surathkal Toll Plaza and enforce nocturnal speed calming rumble strips.',
      authorityResponsible: 'Traffic Police',
      estimatedImpact: 'Reduces fugitive PM10 road dust by 40% and dampens night braking screech noise by 10 dB.',
      timeframe: 'Short Term (24-48 hrs)',
      status: 'Completed',
    }
  ]
};
