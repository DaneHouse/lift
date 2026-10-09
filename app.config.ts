import type { ExpoConfig } from 'expo/config';

const identity = {
  name: 'LIFT',
  slug: 'lift',
  scheme: 'lift',
  bundleIdentifier: 'com.placeholder.lift',
} as const;

const config: ExpoConfig = {
  name: identity.name,
  slug: identity.slug,
  scheme: identity.scheme,
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: identity.bundleIdentifier,
    supportsTablet: false,
  },
  android: {
    package: identity.bundleIdentifier,
  },
  web: {
    bundler: 'metro',
    output: 'single',
    name: identity.name,
    shortName: identity.name,
    backgroundColor: '#000000',
    themeColor: '#000000',
  },
  plugins: ['expo-router', 'expo-sqlite', 'expo-dev-client'],
  experiments: { typedRoutes: true },
};

export default config;
