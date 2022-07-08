module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: [2, 'never'],
    'import/extensions': [0, 'never'],
    'import/no-unresolved': [0],
    'default-case': [0],
    'consistent-return': [0],
    'no-console': [0],
  },
}
