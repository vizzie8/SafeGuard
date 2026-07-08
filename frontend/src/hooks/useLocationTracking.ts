import { useState, useEffect } from 'react';

interface LocationData {
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: number;
}

export const useLocationTracking = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let watchId: number;

    if (isTracking) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  return { location, error, isTracking, setIsTracking };
};
