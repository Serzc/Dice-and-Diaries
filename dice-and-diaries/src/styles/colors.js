// src/styles/colors.js
// Paleta de colores de la aplicación – se puede importar en cualquier componente JS.
// Los mismos valores se exponen como variables CSS en theme.css para usar en hojas de estilo.

const colors = {
  purple: {
    900: '#2e1a3e',
    800: '#4a2b65',
    700: '#633d85',
    600: '#7c4fa0',
    500: '#9561bb',
    400: '#b587d4',
    300: '#d0aee8',
    200: '#e5d1f5',
    100: '#f3eafa',
  },
  brown: {
    900: '#3e2a1b',
    800: '#5c3d29',
    700: '#7a5033',
    600: '#98633d',
    500: '#b67a4a',
    400: '#c9996b',
    300: '#dcb791',
    200: '#eed5ba',
    100: '#f8efe4',
  },
  gray: {
    900: '#1f1f1f',
    800: '#2e2e2e',
    700: '#404040',
    600: '#555555',
    500: '#717171',
    400: '#909090',
    300: '#b0b0b0',
    200: '#d1d1d1',
    100: '#e8e8e8',
    50:  '#f5f5f5',
  },
  white: '#ffffff',
  offWhite: '#fbf9f7',

  // Semánticos
  primary: '#7c4fa0',        // purple-600
  primaryHover: '#633d85',   // purple-700
  primaryLight: '#e5d1f5',   // purple-200
  primaryBg: '#f3eafa',      // purple-100

  secondary: '#b67a4a',      // brown-500
  secondaryHover: '#98633d', // brown-600
  secondaryLight: '#eed5ba', // brown-200
  secondaryBg: '#f8efe4',    // brown-100

  background: '#fbf9f7',     // off-white
  surface: '#ffffff',
  surfaceHover: '#f5f5f5',   // gray-50

  textPrimary: '#1f1f1f',    // gray-900
  textSecondary: '#404040',  // gray-700
  textMuted: '#717171',      // gray-500
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',

  border: '#d1d1d1',         // gray-200
  divider: '#e8e8e8',        // gray-100

  success: '#2b5930',
  successBg: '#e0f2e2',
  error: '#b82c2c',
  errorBg: '#fce9e9',
  warning: '#8a6300',
  warningBg: '#fff4d6',
};

export default colors;