import { EventBusTopic } from '@bot/event-bus';
import { MonitoringManager } from '@monitor/manager';
import { CachetIncident, CachetIncidentStatusEnum } from '@monitor/models/cachet';
import { Service } from '@monitor/service';
import { Util } from '@monitor/util';

export class CachetService extends Service {
    private readonly endpoint: string;

    private lastId?: number;

    constructor(manager: MonitoringManager, endpoint: string) {
        super(manager);
        this.endpoint = endpoint;
    }

    public async start(): Promise<void> {
        const incident = await this.getLastIncident();
        this.lastId = incident?.id;
        await this.execute();
    }

    public async execute(): Promise<void> {
        const incident = await this.getLastIncident();
        if (incident && this.lastId !== incident.id) {
            this.lastId = incident.id;
            this.manager.eventBus.publish(EventBusTopic.INCIDENT_UPDATE, {
                channels: this.manager.alertChannels,
                incident: {
                    title: incident.name,
                    status: CachetIncidentStatusEnum[incident.status],
                    content: incident.message,
                    updatedAt: incident.updatedAt
                }
            });
        }
    }

    private async getLastIncident(): Promise<CachetIncident | undefined> {
        const incidents = (
            await Util.fetch(`${this.endpoint}/api/v1/incidents?sort=id&order=desc&per_page=1`)
        )?.data;
        return incidents.length > 0 ? new CachetIncident(incidents[0]) : undefined;
    }
}
