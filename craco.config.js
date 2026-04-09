module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the source-map-loader rule
      const sourceMapLoader = webpackConfig.module.rules.find(
        (rule) => rule.loader && rule.loader.includes('source-map-loader')
      );

      if (sourceMapLoader) {
        // Exclude react-mx-web-components from source map processing
        sourceMapLoader.exclude = /node_modules\/react-mx-web-components/;
      }

      return webpackConfig;
    },
  },
};
