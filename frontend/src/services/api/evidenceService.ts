import { AirAnalysisResult, NoiseAnalysisResult } from '../../types';

/**
 * Service layer for Evidence Submission & AI Analysis.
 * Note: These functions currently simulate AI/ML processing with realistic mock responses.
 * When real backend APIs and ML inference endpoints are deployed, replace the internal implementation
 * with `fetch()` or `axios()` calls to the backend endpoints without altering the interface contracts.
 */

export const SAMPLE_AIR_PRESETS = [
  {
    id: 'preset-smoke-industrial',
    title: 'Industrial Chimney Heavy Smoke',
    description: 'Black unscrubbed particulate exhaust from fabrication plant boiler.',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
    location: 'Wazirpur Industrial Area Phase 2, Delhi NCR',
    mockSeverity: 'Critical' as const,
    detectedSource: 'Dense Industrial Boiler Exhaust (Soot & Carbon Black)',
    primaryPollutant: 'PM2.5 & SO2',
    estimatedAqi: 385,
    aqiImpact: '+125 Local AQI Spike (Critical Zone)',
    confidenceScore: 97.8,
    summaryExplanation: 'Computer vision analysis detected a heavy dark carbonaceous smoke plume with high optical opacity (>85%), exceeding permissible industrial stack emission limits.',
    healthImpact: 'Severe respiratory risk for nearby residents. High risk of immediate asthma exacerbation and acute airway inflammation.',
    recommendedActionCitizen: 'Stay indoors with sealed windows and run HEPA air purifiers. Wear N95 respirators if stepping outside.',
    recommendedActionAuthority: 'Dispatch SPCB Flying Squad for stack scrubber inspection and issue immediate stop-work notice.',
  },
  {
    id: 'preset-waste-burning',
    title: 'Open Waste & Plastic Combustion',
    description: 'Open municipal plastic waste burning in vacant plot.',
    imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=800&q=80',
    location: 'Silk Board Outer Ring Road Junction, Bengaluru',
    mockSeverity: 'Unhealthy' as const,
    detectedSource: 'Open Solid Waste & Plastic Incineration',
    primaryPollutant: 'PM2.5, VOCs & CO',
    estimatedAqi: 275,
    aqiImpact: '+70 Local AQI Spike (Unhealthy Zone)',
    confidenceScore: 95.4,
    summaryExplanation: 'Visual pattern recognition identified low-temperature open trash burning emitting toxic VOCs, dioxins, and fine respirable particulate clouds.',
    healthImpact: 'Irritates eyes, throat, and mucous membranes. Toxic for asthmatic patients, pregnant women, and children.',
    recommendedActionCitizen: 'Maintain at least 500m distance from combustion site; report to municipal flying marshals.',
    recommendedActionAuthority: 'Instruct municipal beat patrol to extinguish fire and impose Section 15 Environment Protection Act fine on property owner.',
  },
  {
    id: 'preset-construction-dust',
    title: 'Uncovered Construction Dust Dispersion',
    description: 'Dry cement mixing and unshielded aggregate loading generating dense dust cloud.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80',
    location: 'BKC Metro Construction Corridor, Mumbai',
    mockSeverity: 'Moderate' as const,
    detectedSource: 'Coarse Construction & Demolition Dust Plume',
    primaryPollutant: 'PM10 & Silica Dust',
    estimatedAqi: 185,
    aqiImpact: '+45 Local AQI Spike (Poor / Moderate Zone)',
    confidenceScore: 93.6,
    summaryExplanation: 'High concentration of coarse particulate matter (PM10) detected due to lack of anti-smog water sprinklers and green barrier tarpaulins.',
    healthImpact: 'Causes coughing, nasal congestion, and allergic rhinitis in pedestrians and commuters.',
    recommendedActionCitizen: 'Wear particulate dust mask when transiting past construction site.',
    recommendedActionAuthority: 'Issue mandate for continuous water mist spraying and high-density geotextile dust curtains around site boundary.',
  },
];

export const SAMPLE_NOISE_PRESETS = [
  {
    id: 'preset-horns-12s',
    title: '12s Heavy Commercial Pressure Horns',
    description: 'Continuous multi-tone pressure honking in congested traffic bottleneck.',
    durationSeconds: 12.4,
    location: 'Anand Vihar Flyover & ISBT Interchange, Delhi NCR',
    mockSeverity: 'Critical' as const,
    estimatedIntensityDb: 88.5,
    detectedSource: 'Multi-Tone Air Pressure Horns & Diesel Truck Idling',
    confidenceScore: 97.4,
    permissibleLimit: 65,
    violationMarginDb: 23.5,
    spectralPeaks: 'Dual dominant frequencies at 1.8 kHz and 3.2 kHz with high acoustic persistence',
    summaryExplanation: 'Acoustic feature extraction detected illegal pressure horn bursts peaking at 88.5 dB(A), violating Central Motor Vehicle Rules (Rule 119) by over 23 dB.',
    recommendedActionCitizen: 'Avoid sustained pedestrian transit near flyover; keep car windows raised to dampen hearing fatigue.',
    recommendedActionAuthority: 'Deploy Traffic Police automated acoustic radar enforcement and issue e-challan for prohibited horn usage.',
    frequencyGraph: [
      { freq: '63Hz', amplitude: 52 },
      { freq: '125Hz', amplitude: 64 },
      { freq: '250Hz', amplitude: 72 },
      { freq: '500Hz', amplitude: 79 },
      { freq: '1kHz', amplitude: 86 },
      { freq: '2kHz', amplitude: 91 },
      { freq: '4kHz', amplitude: 88 },
      { freq: '8kHz', amplitude: 74 },
    ],
  },
  {
    id: 'preset-drilling-15s',
    title: '15s Nighttime Hydraulic Concrete Breaker',
    description: 'Sustained hydraulic breaker jackhammer operating during nocturnal hours.',
    durationSeconds: 15.0,
    location: 'Indiranagar 100ft Rd Residential Sector, Bengaluru',
    mockSeverity: 'High' as const,
    estimatedIntensityDb: 84.0,
    detectedSource: 'Hydraulic Pavement Breaker / Impact Hammer',
    confidenceScore: 96.2,
    permissibleLimit: 45,
    violationMarginDb: 39.0,
    spectralPeaks: 'Low-frequency rhythmic mechanical impacts (80 Hz - 250 Hz) with high structural vibration',
    summaryExplanation: 'Acoustic waveform analysis identified repetitive heavy hydraulic percussion during nighttime hours, violating residential noise limits (45 dB) by 39 dB.',
    recommendedActionCitizen: 'Submit geotagged complaint to City Police night PCR patrol.',
    recommendedActionAuthority: 'Enforce CPCB nocturnal construction ban (10:00 PM - 06:00 AM) and confiscate unauthorized pneumatic machinery.',
    frequencyGraph: [
      { freq: '63Hz', amplitude: 85 },
      { freq: '125Hz', amplitude: 88 },
      { freq: '250Hz', amplitude: 82 },
      { freq: '500Hz', amplitude: 76 },
      { freq: '1kHz', amplitude: 68 },
      { freq: '2kHz', amplitude: 60 },
      { freq: '4kHz', amplitude: 52 },
      { freq: '8kHz', amplitude: 45 },
    ],
  },
  {
    id: 'preset-loudspeaker-10s',
    title: '10s Commercial Promotional Public Address',
    description: 'High-power horn loudspeakers broadcasting promotional audio.',
    durationSeconds: 10.8,
    location: 'Baikampady Commercial Hub, NITK / Mangalore',
    mockSeverity: 'Moderate' as const,
    estimatedIntensityDb: 76.5,
    detectedSource: 'Public Address Amplified Horn Loudspeaker',
    confidenceScore: 94.8,
    permissibleLimit: 65,
    violationMarginDb: 11.5,
    spectralPeaks: 'Broad mid-range acoustic distribution (400 Hz - 3.5 kHz) with harmonic distortion',
    summaryExplanation: 'Spectrogram classifier detected amplified public voice audio exceeding the commercial ambient standard limit by 11.5 dB.',
    recommendedActionCitizen: 'Report commercial establishment for volume regulation.',
    recommendedActionAuthority: 'Serve statutory compliance notice under Noise Pollution (Regulation and Control) Rules, 2000.',
    frequencyGraph: [
      { freq: '63Hz', amplitude: 44 },
      { freq: '125Hz', amplitude: 58 },
      { freq: '250Hz', amplitude: 71 },
      { freq: '500Hz', amplitude: 78 },
      { freq: '1kHz', amplitude: 82 },
      { freq: '2kHz', amplitude: 80 },
      { freq: '4kHz', amplitude: 73 },
      { freq: '8kHz', amplitude: 59 },
    ],
  },
];

export const analyzeAirEvidence = async (
  imageUrl: string,
  location: string,
  description?: string,
  presetId?: string
): Promise<AirAnalysisResult> => {
  // Simulate network latency & model inference delay
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const matchedPreset = SAMPLE_AIR_PRESETS.find((p) => p.id === presetId) || SAMPLE_AIR_PRESETS[0];

  return {
    id: `air-eval-${Date.now()}`,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    location: location || matchedPreset.location,
    severity: matchedPreset.mockSeverity,
    aqiImpact: matchedPreset.aqiImpact,
    estimatedAqi: matchedPreset.estimatedAqi,
    primaryPollutant: matchedPreset.primaryPollutant,
    confidenceScore: matchedPreset.confidenceScore,
    detectedSource: matchedPreset.detectedSource,
    summaryExplanation: matchedPreset.summaryExplanation,
    healthImpact: matchedPreset.healthImpact,
    recommendedActionCitizen: matchedPreset.recommendedActionCitizen,
    recommendedActionAuthority: matchedPreset.recommendedActionAuthority,
    imageUrl: imageUrl || matchedPreset.imageUrl,
    status: 'Analyzed',
  };
};

export const analyzeNoiseEvidence = async (
  durationSeconds: number,
  location: string,
  description?: string,
  presetId?: string
): Promise<NoiseAnalysisResult> => {
  if (durationSeconds < 10) {
    throw new Error('Audio sample is less than 10 seconds. CPCB acoustic standards require at least 10 seconds.');
  }

  // Simulate network latency & spectrogram conversion
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const matchedPreset = SAMPLE_NOISE_PRESETS.find((p) => p.id === presetId) || SAMPLE_NOISE_PRESETS[0];

  return {
    id: `noise-eval-${Date.now()}`,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    location: location || matchedPreset.location,
    durationSeconds: durationSeconds || matchedPreset.durationSeconds,
    estimatedIntensityDb: matchedPreset.estimatedIntensityDb,
    severity: matchedPreset.mockSeverity,
    detectedSource: matchedPreset.detectedSource,
    confidenceScore: matchedPreset.confidenceScore,
    summaryExplanation: matchedPreset.summaryExplanation,
    permissibleLimit: matchedPreset.permissibleLimit,
    violationMarginDb: matchedPreset.violationMarginDb,
    spectralPeaks: matchedPreset.spectralPeaks,
    recommendedActionCitizen: matchedPreset.recommendedActionCitizen,
    recommendedActionAuthority: matchedPreset.recommendedActionAuthority,
    status: 'Analyzed',
    frequencyGraph: matchedPreset.frequencyGraph,
  };
};
