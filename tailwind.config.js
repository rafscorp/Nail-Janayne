/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        rose: {
          50: 'rgb(var(--color-light) / <alpha-value>)',
          100: 'rgb(var(--color-light) / <alpha-value>)',
          200: 'rgb(var(--color-primary) / 0.3)',
          300: 'rgb(var(--color-primary) / 0.6)',
          400: 'rgb(var(--color-primary) / <alpha-value>)',
          500: 'rgb(var(--color-primary) / <alpha-value>)'
        },
        stone: {
          800: 'rgb(var(--color-text) / <alpha-value>)',
          900: '#1c1917',
          600: '#57534e'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Quicksand"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s infinite',
        'typewriter': 'typewriter 6s infinite, blink 1s step-end infinite',
        'gentle-bounce': 'gentleBounce 3s infinite',
        'fade-in': 'fadeIn 1.2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 25px rgba(244,93,126,0.6))' },
          '50%': { filter: 'drop-shadow(0 0 45px rgba(244,93,126,0.9)) drop-shadow(0 0 15px rgba(255,255,255,0.5))' },
        },
        typewriter: {
          '0%': { maxWidth: '0', opacity: '1', animationTimingFunction: 'steps(16, end)' },
          '35%': { maxWidth: '16ch', opacity: '1', animationTimingFunction: 'linear' },
          '85%': { maxWidth: '16ch', opacity: '1' },
          '100%': { maxWidth: '16ch', opacity: '0' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#fb7185' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}