import { ModelMetric } from '../types';

export const HISTORICAL_7DAY_TRENDS = [
  { day: 'Mon', aqi: 185, aqiPredicted: 180, pm25: 85, pm10: 160, no2: 52, noiseAvgDb: 68.2, complaints: 14 },
  { day: 'Tue', aqi: 210, aqiPredicted: 205, pm25: 98, pm10: 178, no2: 58, noiseAvgDb: 71.4, complaints: 19 },
  { day: 'Wed', aqi: 245, aqiPredicted: 240, pm25: 115, pm10: 195, no2: 66, noiseAvgDb: 74.0, complaints: 24 },
  { day: 'Thu', aqi: 280, aqiPredicted: 275, pm25: 132, pm10: 218, no2: 74, noiseAvgDb: 77.8, complaints: 32 },
  { day: 'Fri', aqi: 315, aqiPredicted: 310, pm25: 154, pm10: 242, no2: 82, noiseAvgDb: 81.5, complaints: 45 },
  { day: 'Sat', aqi: 260, aqiPredicted: 268, pm25: 124, pm10: 205, no2: 64, noiseAvgDb: 76.2, complaints: 28 },
  { day: 'Sun (Today)', aqi: 284, aqiPredicted: 282, pm25: 128, pm10: 215, no2: 78, noiseAvgDb: 74.2, complaints: 36 },
];

export const TRAFFIC_VS_NOISE_CORRELATION = [
  { time: '06:00', trafficSpeedKmph: 48, vehicleCountPerMin: 22, noiseDb: 58.2, cortnEstimatedDb: 57.8 },
  { time: '08:00', trafficSpeedKmph: 18, vehicleCountPerMin: 68, noiseDb: 82.4, cortnEstimatedDb: 81.9 },
  { time: '10:00', trafficSpeedKmph: 14, vehicleCountPerMin: 85, noiseDb: 86.8, cortnEstimatedDb: 86.2 },
  { time: '12:00', trafficSpeedKmph: 26, vehicleCountPerMin: 54, noiseDb: 76.5, cortnEstimatedDb: 75.9 },
  { time: '14:00', trafficSpeedKmph: 32, vehicleCountPerMin: 46, noiseDb: 73.1, cortnEstimatedDb: 72.8 },
  { time: '16:00', trafficSpeedKmph: 22, vehicleCountPerMin: 62, noiseDb: 79.8, cortnEstimatedDb: 79.1 },
  { time: '18:00', trafficSpeedKmph: 11, vehicleCountPerMin: 94, noiseDb: 88.3, cortnEstimatedDb: 87.9 },
  { time: '20:00', trafficSpeedKmph: 15, vehicleCountPerMin: 78, noiseDb: 84.6, cortnEstimatedDb: 84.1 },
  { time: '22:00', trafficSpeedKmph: 38, vehicleCountPerMin: 34, noiseDb: 68.4, cortnEstimatedDb: 67.9 },
];

export const POLLUTANT_RADAR_DATA = [
  { subject: 'PM 2.5', AnandVihar: 185, SilkBoard: 85, BKC: 98, Baikampady: 64, fullMark: 200 },
  { subject: 'PM 10', AnandVihar: 190, SilkBoard: 120, BKC: 110, Baikampady: 92, fullMark: 200 },
  { subject: 'NO2', AnandVihar: 140, SilkBoard: 165, BKC: 130, Baikampady: 78, fullMark: 200 },
  { subject: 'Noise dB', AnandVihar: 172, SilkBoard: 170, BKC: 160, Baikampady: 154, fullMark: 200 },
  { subject: 'CO', AnandVihar: 120, SilkBoard: 95, BKC: 80, Baikampady: 60, fullMark: 200 },
  { subject: 'SO2', AnandVihar: 110, SilkBoard: 65, BKC: 145, Baikampady: 160, fullMark: 200 },
];

export const AI_RESEARCH_MODELS: ModelMetric[] = [
  {
    name: 'WVPBL + BiLSTM (AQI Predictor)',
    architecture: 'Wavelet Packet Decomposition + Bidirectional LSTM',
    purpose: 'Multi-step 24-Hour micro-pocket AQI & PM2.5 forecasting',
    accuracy: '98.2%',
    mae: 1.24,
    rmse: 1.8247,
    r2: 0.941,
    trainingDataset: 'CPCB 5-Year Continuous Monitoring Stations + OpenWeather API',
    inferenceSpeed: '18 ms',
    status: 'Online / Active',
  },
  {
    name: 'TCoA-BiLSTM (Anomaly Detector)',
    architecture: 'Temporal Convolutional Attention + BiLSTM',
    purpose: 'Instantaneous sudden pollution spikes & industrial emission bursts',
    accuracy: '97.98%',
    mae: 0.98,
    rmse: 1.412,
    r2: 0.965,
    trainingDataset: 'Urban Micro-Climate Sensor Stream & Wind Interpolation Grid',
    inferenceSpeed: '12 ms',
    status: 'Online / Active',
  },
  {
    name: 'CORTN + CNN Spectrogram (Noise AI)',
    architecture: 'Calculation of Road Traffic Noise + 2D ResNet CNN',
    purpose: 'Virtual street decibel estimation & citizen audio source recognition',
    accuracy: '94.2%',
    mae: 1.85,
    rmse: 2.31,
    r2: 0.918,
    trainingDataset: 'UrbanSound8K + ESC-50 + Live Traffic TomTom Sensor Stream',
    inferenceSpeed: '34 ms',
    status: 'Online / Active',
  },
  {
    name: 'DBSCAN + Spatial Kriging (Hotspot Engine)',
    architecture: 'Density-Based Spatial Clustering + Ordinary Kriging',
    purpose: 'Automated geospatial hotspot delineation and complaint fusion',
    accuracy: '91.5%',
    mae: 2.10,
    rmse: 2.89,
    r2: 0.884,
    trainingDataset: 'Geotagged Citizen Evidence + Ground Sensor Spatial Grid',
    inferenceSpeed: '25 ms',
    status: 'Optimal',
  }
];
