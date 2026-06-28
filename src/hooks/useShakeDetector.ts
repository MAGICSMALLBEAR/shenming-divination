// 搖手機偵測 Hook — 使用加速度計，達到閾值時觸發回調
import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

const SHAKE_THRESHOLD = 2.8;   // G force 閾值（加速度計單位）
const COOLDOWN_MS = 1200;       // 觸發後冷卻時間，避免連續觸發

export function useShakeDetector(onShake: () => void, enabled = true) {
  const lastShake = useRef(0);
  const subscription = useRef<{ remove: () => void } | null>(null);

  const handleShake = useCallback(() => {
    onShake();
  }, [onShake]);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let Accelerometer: any;
    try {

      Accelerometer = require('expo-sensors').Accelerometer;
    } catch {
      return;
    }

    Accelerometer.setUpdateInterval(100);

    subscription.current = Accelerometer.addListener(
      ({ x, y, z }: { x: number; y: number; z: number }) => {
        const totalForce = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        if (totalForce > SHAKE_THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
          lastShake.current = now;
          handleShake();
        }
      }
    );

    return () => {
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [enabled, handleShake]);
}
