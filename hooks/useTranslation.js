import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../constants/translations';

export const useTranslation = () => {
  const { language } = useSettings();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    return value || key;
  };

  return { t, language };
};