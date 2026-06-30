const preset = require('@edunexus/design-tokens/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}'],
};
