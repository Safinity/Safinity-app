module.exports = {
  // Usar ts-jest para compilar TypeScript
  preset: 'ts-jest',

  // Usar Node como ambiente de testes
  testEnvironment: 'node',

  // Raiz dos testes
  rootDir: 'src',

  // Onde estão os testes
  testRegex: '.*\\.spec\\.ts$',

  // Tipos de ficheiros
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Cobertura
  collectCoverageFrom: ['**/*.(t|j)s'],
};
