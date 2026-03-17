import * as Location from 'expo-location';
import { useState, useEffect, useRef, useCallback } from 'react';

type LocationCoords = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export default function useLocation(pollingIntervalMs: number = 10000) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation: LocationCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp || Date.now(),
      };

      setLocation(newLocation);
      console.log('📍 Location updated:', newLocation);
    } catch (err: any) {
      console.error('Failed to fetch location:', err);
      setError(err.message || 'Failed to fetch location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling when hook is used
  useEffect(() => {
    fetchLocation(); // Fetch immediately

    intervalRef.current = setInterval(fetchLocation, pollingIntervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLocation, pollingIntervalMs]);

  return {
    location,
    error,
    loading,
    refetch: fetchLocation,           // Manual refresh anytime
  };
}