const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  crypto: require.resolve('expo-crypto'),
};

config.resolver.unstable_enablePackageExports = false;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

config.resetCache = true;

module.exports = config;