import { useEffect, useState } from 'react';
import { getLanguage, onLanguageChange, t } from '@/services/i18n';

export function useI18n() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    return onLanguageChange(setLang);
  }, []);

  return { t, lang };
}
