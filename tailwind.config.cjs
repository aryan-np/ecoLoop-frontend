module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32', // Eco Green
        secondary: '#81C784', // Soft Leaf Green
        accent: '#1976D2', // Earth Blue
        bg: '#FFFFFF',
        section: '#F6F8F6',
        card: '#FAFAFA',
        textPrimary: '#1F2933',
        textSecondary: '#6B7280',
        disabled: '#9CA3AF',
        success: '#388E3C',
        warning: '#F9A825',
        error: '#D32F2F',
        info: '#0288D1',
        border: '#E5E7EB',
        hoverBg: '#EEF6EE',
        focusRing: '#66BB6A',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(31,41,51,0.06), 0 1px 2px rgba(31,41,51,0.04)'
      },
      container: {
        center: true,
        padding: '1rem',
      }
    },
  },
  plugins: [],
};
