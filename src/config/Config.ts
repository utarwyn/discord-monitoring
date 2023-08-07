/**
 * @author Utarwyn
 * @since 1.0.0
 */
export interface Config {
    /**
     * Token used to connect to Discord's API.
     */
    token?: string;
    /**
     * Locale of the module.
     */
    language?: string;
    /**
     * Path where to store internal database.
     */
    databaseFilePath?: string;
}
