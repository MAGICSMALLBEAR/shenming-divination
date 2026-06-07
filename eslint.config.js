const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'dist/**',
      'web-build/**',
      '.expo/**',
      'node_modules/**',
      'assets/**',
    ],
  },
  {
    rules: {
      // The app uses React Native Animated refs and effect-driven storage hydration.
      // Keep these as future refactor warnings rather than blocking lint errors.
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
