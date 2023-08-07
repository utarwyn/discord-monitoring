import { MessageProvider, Replacements } from '@i18n/types';
import fs from 'fs';
import path from 'path';

/**
 * Default implementation to translate messages.
 * Can load messages from integrated or external locale files.
 *
 * @author Utarwyn
 * @since 2.0.0
 * @internal
 */
export class I18nProvider {
    /**
     * Users must use this prefix in order to use an external file
     */
    private static readonly FILEPATH_PREFIX = 'file:';
    /**
     * Key of the default locale of the module
     */
    private static readonly DEFAULT_LOCALE = 'en';

    /**
     * Collection with paths of integrated locales in the module
     * @private
     */
    private readonly availableLocales: Map<string, string>;
    /**
     * Collection of message providers added programmatically
     * @private
     */
    private readonly messageProviders: Map<string, MessageProvider>;
    /**
     * Collection of all locale messages loaded from a language file
     * @private
     */
    private localeData?: Record<string, string>;
    private currentLocale?: string;

    constructor() {
        const workingDirectory = global.__dirname ?? __dirname;
        const localesPath = path.join(workingDirectory, '..', '..', '..', 'config', 'locales');

        this.availableLocales = new Map(
            fs
                .readdirSync(localesPath)
                .map(file => [path.basename(file, '.json'), path.resolve(localesPath, file)])
        );
        this.messageProviders = new Map<string, MessageProvider>();
    }

    public getLanguage(): string | undefined {
        return this.currentLocale;
    }

    /**
     * Loads module messages from an internal or external file.
     *
     * @param locale locale key or language file to load
     */
    public loadFromLocale(locale?: string): void {
        let filepath = this.availableLocales.get(locale ?? I18nProvider.DEFAULT_LOCALE);
        let loaded = filepath !== undefined;

        if (!loaded && locale && locale.startsWith(I18nProvider.FILEPATH_PREFIX)) {
            filepath = path.resolve(
                process.cwd(),
                locale.slice(I18nProvider.FILEPATH_PREFIX.length)
            );
        }

        try {
            if (filepath) {
                this.localeData = I18nProvider.flatten(
                    JSON.parse(fs.readFileSync(filepath, 'utf-8'))
                );
                this.currentLocale = locale;
                loaded = true;
            }
        } catch (e) {
            // ignored
        }

        if (!loaded) {
            this.loadFromLocale(I18nProvider.DEFAULT_LOCALE);
            console.warn(`Cannot load language file ${filepath ?? locale}. Using default one.`);
        }
    }

    /**
     * Computes a translated message based
     * on its key using replacements if provided.
     *
     * @param key flatten message key
     * @param replacements collection of replacement to operate on the message
     * @returns translated message using replacements
     */
    public __(key: string, replacements?: Replacements): string {
        if (this.localeData?.[key]) {
            let message = this.messageProviders.get(key)?.() ?? this.localeData[key];

            if (replacements) {
                Object.entries(replacements).forEach(replacement => {
                    message = message.replace(`{${replacement[0]}}`, replacement[1].toString());
                });
            }

            return message;
        } else {
            return key;
        }
    }

    /**
     * Adds a message provider for a given key.
     * Key must already exist in the cache, otherwise an error will be thrown.
     *
     * @param key key corresponding to the added provider
     * @param provider function that dynamically supplies the message
     */
    public addProvider(key: string, provider: MessageProvider): void {
        if (this.localeData?.[key] == null) {
            throw new Error(`Cannot register message provider because key "${key}" does not exist`);
        }
        this.messageProviders.set(key, provider);
    }

    private static flatten<T extends Record<string, any>>(
        object: T,
        objectPath: string | null = null,
        separator = '.'
    ): T {
        return Object.keys(object).reduce((acc: T, key: string): T => {
            const newObjectPath = [objectPath, key].filter(Boolean).join(separator);
            return typeof object?.[key] === 'object'
                ? { ...acc, ...I18nProvider.flatten(object[key], newObjectPath, separator) }
                : { ...acc, [newObjectPath]: object[key] };
        }, {} as T);
    }
}
