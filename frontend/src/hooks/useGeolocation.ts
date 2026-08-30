import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null; // in meters
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  errorCode: number | null;
  isLoading: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

export const useGeolocation = (autoFetch: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    errorCode: null,
    isLoading: false,
    permissionState: !navigator.geolocation ? 'unsupported' : 'prompt',
  });

  // Check permissions query if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setState((prev) => ({ ...prev, permissionState: result.state as any }));
          result.onchange = () => {
            setState((prev) => ({ ...prev, permissionState: result.state as any }));
          };
        })
        .catch(() => {
          // Permissions query not supported for geolocation in some browsers
        });
    }
  }, []);

  const getPosition = useCallback((): Promise<{ lat: number; lng: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser/device.';
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          isLoading: false,
          permissionState: 'unsupported',
        }));
        reject(new Error(errorMsg));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // Force fresh GPS fix rather than cached/stale coordinates
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, heading, speed } = position.coords;

          // Validate coordinates to prevent NaN or coordinate swap
          if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
            const errorMsg = 'Invalid GPS coordinates received from device.';
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: errorMsg,
            }));
            reject(new Error(errorMsg));
            return;
          }

          setState({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || null,
            heading: heading || null,
            speed: speed || null,
            timestamp: position.timestamp,
            error: null,
            errorCode: null,
            isLoading: false,
            permissionState: 'granted',
          });

          resolve({ lat: latitude, lng: longitude, accuracy: accuracy || 0 });
        },
        (error) => {
          let userFriendlyMessage = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              userFriendlyMessage =
                'Location access was denied. Please allow location permissions in your browser to view your live GPS position on the map.';
              break;
            case error.POSITION_UNAVAILABLE:
              userFriendlyMessage =
                'GPS position unavailable. Please ensure your device location services/Wi-Fi are enabled.';
              break;
            case error.TIMEOUT:
              userFriendlyMessage =
                'Location request timed out. Please check your GPS signal and try again.';
              break;
            default:
              userFriendlyMessage = error.message || 'An unknown error occurred while fetching GPS coordinates.';
          }

          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: userFriendlyMessage,
            errorCode: error.code,
            permissionState: error.code === 1 ? 'denied' : prev.permissionState,
          }));

          reject(new Error(userFriendlyMessage));
        },
        options
      );
    });
  }, []);

  // Auto-fetch on mount if requested
  useEffect(() => {
    if (autoFetch) {
      getPosition().catch(() => {});
    }
  }, [autoFetch, getPosition]);

  return {
    ...state,
    getPosition,
  };
};
