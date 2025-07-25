import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        lng: Localization?.locale?.startsWith('fr') ? 'fr' : 'en',
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
