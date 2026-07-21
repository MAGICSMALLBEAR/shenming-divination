// Sentry error tracking — 需填入真實 DSN 後生效
// 文件: https://docs.sentry.io/platforms/react-native/expo/
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = ''; // ← 在此填入你的 Sentry DSN

export function initSentry() {
  if (!SENTRY_DSN) {
    if (__DEV__) console.log('[sentry] DSN 尚未設定，略過初始化');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    tracesSampleRate: 0.2,
    attachScreenshot: false,
    integrations: [Sentry.reactNativeTracingIntegration()],
  });

  if (__DEV__) console.log('[sentry] 已初始化');
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

export { Sentry };
