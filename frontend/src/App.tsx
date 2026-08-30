import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AirEvidencePage } from './pages/citizen/AirEvidencePage';
import { NoiseEvidencePage } from './pages/citizen/NoiseEvidencePage';
import { AirQualityPage } from './pages/AirQualityPage';
import { NoiseMonitoringPage } from './pages/NoiseMonitoringPage';
import { HotspotMapPage } from './pages/HotspotMapPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiReportsPage } from './pages/AiReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Unified Home Dashboard */}
              <Route index element={<DashboardPage />} />

              {/* Core Modules */}
              <Route path="air-quality" element={<AirQualityPage />} />
              <Route path="noise-monitoring" element={<NoiseMonitoringPage />} />
              <Route path="hotspots" element={<HotspotMapPage />} />
              <Route path="complaints" element={<SubmitComplaintPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<AiReportsPage />} />

              {/* Evidence Submission Sub-Routes */}
              <Route path="citizen/air-evidence" element={<AirEvidencePage />} />
              <Route path="citizen/noise-evidence" element={<NoiseEvidencePage />} />

              {/* Legacy / Redundant Redirects */}
              <Route path="citizen" element={<Navigate to="/" replace />} />
              <Route path="officer" element={<Navigate to="/" replace />} />

              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
