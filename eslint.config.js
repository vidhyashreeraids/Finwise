import globals from "globals";

export default [
  {
    files: ["server/**/*.js", "server.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Provides process, __dirname, module, require, etc.
      },
    },
  },
];