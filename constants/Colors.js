export const lightTheme = {
  primary: '#CDC1FF',
  secondary: '#BFECFF',
  background: '#ffffff',
  white: '#ffffff',
  black: '#000000',
  
  gray25: '#fcfcfd',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  border: '#e5e7eb',
  
  shadow: {
    color: '#000000',
  },
};

export const darkTheme = {
  primary: '#1e40af',
  secondary: '#4c1d95',
  secondary2: '#374151',
  secondary3: '#7c2d12',
  background: '#111827',
  white: '#1f2937',
  black: '#ffffff',
  
  gray25: '#1f2937',
  gray50: '#374151',
  gray100: '#4b5563',
  gray200: '#6b7280',
  gray300: '#9ca3af',
  gray400: '#d1d5db',
  gray500: '#e5e7eb',
  gray600: '#f3f4f6',
  gray700: '#f9fafb',
  gray800: '#fcfcfd',
  gray900: '#ffffff',
  
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  
  border: '#4b5563',
  
  shadow: {
    color: '#000000',
  },
};

export const getColors = (theme = 'light') => {
  return theme === 'dark' ? darkTheme : lightTheme;
};

export const Colors = lightTheme;