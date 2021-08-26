console.log(`🚀eslint-plugin🚀`);

module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // "@typescript-eslint/explicit-module-boundary-types": "off",
    // "@typescript-eslint/no-var-requires": 0,
    // "react/react-in-jsx-scope": 0,
    // "@typescript-eslint/explicit-function-return-type": 0,
    // "@typescript-eslint/no-empty-function": 0,
    // "@typescript-eslint/no-explicit-any": 0,
    // "@typescript-eslint/no-unused-vars": 0,
    // "@typescript-eslint/no-use-before-define": 0,
    // "@typescript-eslint/class-name-casing": 0,
    // "@typescript-eslint/triple-slash-reference": 0,
    // "react-hooks/rules-of-hooks": "warn",
    // "react-hooks/exhaustive-deps": "off",
    "prettier/prettier": ["error"],
  },
};
