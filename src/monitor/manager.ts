import { EventBus, EventBusTopic } from '@bot/event-bus';
import { Service } from '@monitor/service';
import { CachetService } from '@monitor/services/cachet-service';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export class MonitoringManager {
    private services: Service[];

    constructor(eventBus: EventBus) {
        this.services = [new CachetService(eventBus, 'https://demo.cachethq.io')];
        eventBus.subscribe(EventBusTopic.BOT_CONNECTED, this.start.bind(this));
    }

    public start(): void {
        this.services.forEach(service => service.start());
        setInterval(this.update.bind(this), 60000);
    }

    private update(): void {
        this.services.forEach(service => service.execute());
    }
}
