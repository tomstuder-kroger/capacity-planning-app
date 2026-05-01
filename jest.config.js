module.exports = {
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  moduleNameMapper: {
    'react-mx-web-components': '<rootDir>/src/__mocks__/react-mx-web-components.js',
    'react-markdown': '<rootDir>/src/__mocks__/react-markdown.js',
    '^marked$': '<rootDir>/src/__mocks__/marked.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
