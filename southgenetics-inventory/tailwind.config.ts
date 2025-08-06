import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mustard: {
          DEFAULT: 'rgb(218, 165, 32)',
          light: 'rgb(255, 215, 0)',
          dark: 'rgb(184, 134, 11)',
          gold: 'rgb(255, 193, 7)',
          amber: 'rgb(255, 149, 0)',
        },
        olive: {
          DEFAULT: 'rgb(128, 128, 0)',
          light: 'rgb(154, 205, 50)',
          dark: 'rgb(85, 107, 47)',
          sage: 'rgb(158, 169, 127)',
          forest: 'rgb(34, 139, 34)',
        },
      },
    },
  },
  plugins: [],
}

export default config 