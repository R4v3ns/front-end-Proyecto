import { usePreferences } from '@/contexts/PreferencesContext';
import { getTranslation, Language } from '@/i18n/translations';

export const useTranslation = () => {
  const { preferences } = usePreferences();
  const language: Language = (preferences.language as Language) || 'es';
  
  const t = (key: string): string => {
    return getTranslation(key, language);
  };
  
  return { t, language };
};

