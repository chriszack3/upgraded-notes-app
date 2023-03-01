module.exports = {
  root: true,

  extends: ['base'],

  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },

  ignorePatterns: ['dist', 'node_modules', '.eslintrc.js', 'tsup.config.ts'],
};
