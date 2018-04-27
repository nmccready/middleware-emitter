module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true
  },
  extends: 'standard',
  rules: {
    'no-var': 'error',
    'space-before-function-paren': 0,
    'prefer-const': 'error',
    'valid-jsdoc': 'error',
    semi: ['error', 'always']
  },
  overrides: {
    files: ['test.js'],
    env: {
      mocha: true
    }
  }
};
