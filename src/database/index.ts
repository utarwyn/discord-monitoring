import { Database, Statement } from 'sqlite3';
import { DatabaseStatementEnum } from '@database/statement';

export class MonitoringDatabase {
    private static readonly SETUP = `
        CREATE TABLE IF NOT EXISTS guilds_channels(
            guild_id   varchar(64) not null,
            channel_id varchar(64) not null
        );
        CREATE TABLE IF NOT EXISTS services (
            id       int(11)     not null primary key,
            guild_id varchar(64) not null,
            type     varchar(32) not null,
            options  JSON default '{}'
        );
        CREATE TABLE IF NOT EXISTS incidents (
            id         int(11)     not null primary key,
            service_id int(11)     not null,
            guild_id   varchar(64) not null,
            message_id varchar(64) not null
        );
    `;

    private readonly database: Database;

    private readonly statements: Map<DatabaseStatementEnum, Statement>;

    constructor(path: string) {
        this.database = new Database(process.cwd() + '/' + path);
        this.database.exec(MonitoringDatabase.SETUP);

        this.statements = new Map();
        Object.values(DatabaseStatementEnum).forEach(item =>
            this.statements.set(item, this.database.prepare(item as string))
        );
    }

    public async findAll<T>(statement: DatabaseStatementEnum, ...params: any[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.statements.get(statement)?.all(params, (err: Error, rows: any[]) => {
                if (!err) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            });
        });
    }

    public async find<T>(statement: DatabaseStatementEnum, ...params: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            this.statements.get(statement)?.get(params, (err: Error, row: any) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    }

    public async run(statement: DatabaseStatementEnum, ...params: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.statements.get(statement)?.run(params, (err: Error) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }
}
