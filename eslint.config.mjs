import expo from 'eslint-config-expo/flat.js';

export default [
  { ignores: ['node_modules', 'ios', 'android', 'coverage', 'src/data/exercises.json'] },
  ...expo,
];
