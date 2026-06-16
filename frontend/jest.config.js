module.exports = {
  // Usar a config do Expo
  preset: 'jest-expo',

  // Onde estão os testes
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],

  // Como compilar TypeScript/JSX
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Setup antes dos testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
