import type { TranslationMessages } from 'ra-core';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import { resolveBrowserLocale } from 'react-admin';

const translations: { [key: string]: TranslationMessages } = { en };

const i18nProvider = polyglotI18nProvider(
  (locale: string) =>
    translations[locale] ? translations[locale] : translations.en,
  resolveBrowserLocale(),
  [{ locale: 'en', name: 'English' }],
);

export default i18nProvider;
