import { I18nProvider } from '@i18n/I18nProvider';
import { MessageProvider, Replacements } from '@i18n/types';

const provider = new I18nProvider();

const getLanguage = (): string | undefined => provider.getLanguage();
const loadFromLocale = (locale?: string): void => provider.loadFromLocale(locale);
const __ = (id: string, replacements?: Replacements): string => provider.__(id, replacements);
const addProvider = (id: string, messageProvider: MessageProvider): void =>
    provider.addProvider(id, messageProvider);

export default { getLanguage, loadFromLocale, __, addProvider };
