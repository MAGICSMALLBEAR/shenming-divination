// Legacy compatibility exports. The active implementation lives in proceduralSound.
export {
  playTossSound as playJiaobeiSound,
  playDrawSound,
  playShengbeiSound,
} from './proceduralSound';
export function vibratePattern() {
  try {
    const { Vibration } = require('react-native');
    Vibration.vibrate([50, 100, 50]);
  } catch {
    // 靜默失敗
  }
}
