const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web loads a wasm build of SQLite.
config.resolver.assetExts.push('wasm');

module.exports = config;
