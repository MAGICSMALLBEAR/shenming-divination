import Constants from 'expo-constants';
import { Platform } from 'react-native';

type VersionConfig = {
  version?: string;
  ios?: { buildNumber?: string };
  android?: { versionCode?: number };
} | null | undefined;

/**
 * Version label shown in settings so device QA records can be matched to a
 * release-candidate note (scripts/release-candidate.js).
 */
export function formatAppVersion(config: VersionConfig, os: string = Platform.OS): string {
  const version = config?.version ?? '0.0.0';
  const build = os === 'ios' ? config?.ios?.buildNumber : os === 'android' ? config?.android?.versionCode : undefined;
  return build ? `v${version} (build ${build})` : `v${version}`;
}

export function getAppVersionLabel(): string {
  return formatAppVersion(Constants.expoConfig);
}
