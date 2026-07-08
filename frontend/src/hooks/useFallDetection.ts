import { useState, useEffect } from 'react';

export const useFallDetection = (onFallDetected: () => void) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMonitoring) return;

    if (!window.DeviceMotionEvent) {
      setError("Device Motion API not supported.");
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      // Calculate the magnitude of the acceleration vector
      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

      // Normal gravity is ~9.8 m/s^2. 
      // A freefall drops the magnitude near 0. 
      // A sudden impact spikes it > 25.
      if (magnitude > 25) { 
        console.log("High impact force detected!", magnitude);
        onFallDetected();
        // Optional: disable to prevent infinite triggers
        setIsMonitoring(false);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isMonitoring, onFallDetected]);

  return { isMonitoring, setIsMonitoring, error };
};
