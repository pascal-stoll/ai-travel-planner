export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ecf1ff',
          200: '#d8e1ff',
          500: '#1f4d8f',
          700: '#173059',
        },
        surface: '#ffffff',
        background: '#f6f8fb',
        muted: '#667085',
      },
      boxShadow: {
        card: '0 18px 40px rgba(31, 49, 76, 0.08)',
      },
    },
  },
  plugins: [],
};
