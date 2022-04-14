import { createI18n } from 'react-router-i18n';

const locales = ['ru', 'en'];

// Dictionary of translations
const translations = {
    ru: {
        hello: 'Hello',
    },
    en: {
        hello: 'Bonjour',
    }
}
const I18n = createI18n(
    locales,
    translations,
);

export default I18n;
