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
  jest: {
    configure: {
      transformIgnorePatterns: [
        "node_modules/(?!(uuid|react-markdown|markdown-table|hast-util-to-jsx-runtime|devlop|micromark|decode-named-character-reference|character-entities|escape-string-regexp|mdast-util-from-markdown|mdast-util-to-markdown|unist-util-stringify-position|unist-util-visit|unified))"
      ]
    }
  }
};
