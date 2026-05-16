/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fundo-principal': '#F8FAFC',
        'fundo-card': '#FFFFFF',
        'azul-principal': '#2563EB',
        'azul-suave': '#DBEAFE',
        'azul-medio': '#3B82F6',
        'azul-claro': '#60A5FA',
        'azul-escuro': '#0F172A',
        'azul-texto': '#1E293B',
        'rosa-principal': '#EC4899',
        'rosa-suave': '#FCE7F3',
        'rosa-claro': '#F9A8D4',
        'texto-principal': '#0F172A',
        'texto-secundario': '#475569',
        'borda-suave': '#E2E8F0',
      },
      animation: {
        'slide-down': 'slideDown 0.2s ease-out',
      },
    },
  },
  plugins: [],
}