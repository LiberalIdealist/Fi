import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import aspectRatio from '@tailwindcss/aspect-ratio';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        'dark-bg': '#0F0F1A',
        'card-bg': '#1A1A2E',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        lg: '16px',
      },
      backgroundColor: {
        'blue-500/20': 'rgba(59, 130, 246, 0.2)',
        'blue-500/10': 'rgba(59, 130, 246, 0.1)',
        'purple-500/20': 'rgba(168, 85, 247, 0.2)',
        'purple-500/10': 'rgba(168, 85, 247, 0.1)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      }
    },
  },
  plugins: [
    // Add this plugin for backdrop blur support
    aspectRatio,
  ],
};

export default config;
