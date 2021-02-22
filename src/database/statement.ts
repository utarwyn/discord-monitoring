export enum DatabaseStatementEnum {
    FIND_GUILD_CHANNELS = 'SELECT * FROM guilds_channels WHERE guild_id = ?',
    FIND_SERVICES = 'SELECT * FROM services WHERE guild_id = ?',

    INSERT_GUILD_CHANNEL = 'INSERT INTO guilds_channels VALUES(?, ?)',
    INSERT_SERVICE = 'INSERT INTO services VALUES(?, ?, ?, ?)'
}
