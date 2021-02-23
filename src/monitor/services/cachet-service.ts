import { CachetIncident, CachetIncidentStatusEnum } from '@monitor/models/cachet';
import { Service } from '@monitor/service';
import { Util } from '@monitor/util';
import { IncidentSchema } from '@database/schemas/incident.schema';
import { DatabaseStatementEnum } from '@database/statement';

export class CachetService extends Service<any> {
    public async start(): Promise<void> {
        return this.execute();
    }

    public async execute(): Promise<void> {
        const incident = await this.getLastIncident();
        if (incident) {
            const row = await this.manager.database.find<IncidentSchema>(
                DatabaseStatementEnum.FIND_INCIDENT,
                incident.id,
                this.id
            );

            const newImportantIncident = !row && incident.status !== CachetIncidentStatusEnum.FIXED;

            if (newImportantIncident || incident.updatedAt.getTime() > row?.updated_at) {
                const newMessageId = await this.manager.client.updateIncident({
                    channelId: this.manager.alertChannels[0],
                    messageId: row?.message_id,
                    incident: {
                        title: incident.name,
                        status: CachetIncidentStatusEnum[incident.status],
                        content: incident.message,
                        updatedAt: incident.updatedAt
                    }
                });
                await this.updateIncident(incident, newMessageId);
            }
        }
    }

    private async updateIncident(incident: CachetIncident, newMessageId?: string): Promise<void> {
        if (newMessageId) {
            await this.manager.database.run(
                DatabaseStatementEnum.INSERT_INCIDENT,
                incident.id,
                this.id,
                newMessageId,
                incident.updatedAt.getTime()
            );
        } else {
            await this.manager.database.run(
                DatabaseStatementEnum.UPDATE_INCIDENT,
                incident.updatedAt.getTime(),
                incident.id,
                this.id
            );
        }
    }

    private async getLastIncident(): Promise<CachetIncident | undefined> {
        const incidents = (
            await Util.fetch(
                `${this.options.endpoint}/api/v1/incidents?sort=id&order=desc&per_page=1`
            )
        )?.data;
        return incidents.length > 0 ? new CachetIncident(incidents[0]) : undefined;
    }
}
