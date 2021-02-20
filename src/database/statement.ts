export enum DatabaseStatementEnum {
    FIND_GUILD_CHANNELS = 'SELECT * FROM guilds_channels WHERE guild_id = ?',

    INSERT_GUILD_CHANNEL = 'INSERT INTO guilds_channels VALUES(?, ?)'
}
