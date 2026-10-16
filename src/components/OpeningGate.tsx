import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OPENING_BACKGROUND, OpeningCeremony, type OpeningVariant } from '@/components/OpeningCeremony';
import {
  loadOpeningLastShown,
  loadOpeningPreferences,
  markOpeningShown,
  resolveOpeningVariant,
  shouldPlayOpening,
} from '@/services/openingPreferences';

type Decision = { status: 'pending' } | { status: 'skip' } | { status: 'play'; variant?: OpeningVariant };

/** 依使用者設定決定是否播放開場動畫；讀取設定時先以同色底遮住，避免 App 畫面閃現。 */
export function OpeningGate() {
  const [decision, setDecision] = useState<Decision>({ status: 'pending' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadOpeningPreferences(), loadOpeningLastShown()])
      .then(([prefs, lastShown]) => {
        if (cancelled) return;
        if (shouldPlayOpening(prefs, lastShown)) {
          setDecision({ status: 'play', variant: resolveOpeningVariant(prefs) });
          markOpeningShown();
        } else {
          setDecision({ status: 'skip' });
        }
      })
      .catch(() => {
        if (!cancelled) setDecision({ status: 'play' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (decision.status === 'skip') return null;
  if (decision.status === 'pending') return <View pointerEvents='none' style={styles.cover} />;
  return <OpeningCeremony variant={decision.variant} />;
}

const styles = StyleSheet.create({
  cover: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10000, elevation: 10000, backgroundColor: OPENING_BACKGROUND },
});
