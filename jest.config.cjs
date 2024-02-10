module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'dist/config', 'dist/app.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  transform: { '\\.ts$': ['ts-jest', { isolatedModules: true }] },
  rootDir: 'src',
}
