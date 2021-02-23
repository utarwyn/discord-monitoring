export enum DatabaseStatementEnum {
    FIND_GUILD_CHANNELS = 'SELECT * FROM guilds_channels WHERE guild_id = ?',
    FIND_SERVICES = 'SELECT ROWID as id, * FROM services WHERE guild_id = ?',
    FIND_INCIDENT = 'SELECT * FROM incidents WHERE id = ? AND service_id = ?',

    INSERT_GUILD_CHANNEL = 'INSERT INTO guilds_channels VALUES(?, ?)',
    INSERT_SERVICE = 'INSERT INTO services VALUES(?, ?, ?)',
    INSERT_INCIDENT = 'INSERT INTO incidents VALUES(?, ?, ?, ?, ?)',

    UPDATE_INCIDENT = 'UPDATE incidents SET last_state = ?, updated_at = ? WHERE id = ? AND service_id = ?'
}
