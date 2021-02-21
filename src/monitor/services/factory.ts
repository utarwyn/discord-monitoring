import { MonitoringManager } from '@monitor/manager';
import { Service, ServiceOptions } from '@monitor/service';
import { CachetService } from '@monitor/services/cachet-service';

export class ServiceFactory {
    public static create(
        manager: MonitoringManager,
        type: string,
        id: number,
        options: ServiceOptions
    ): Service<any> {
        switch (type) {
            case 'cachet':
                return new CachetService(manager, id, options);
            default:
                throw new Error(`Service of type ${type} does not exist`);
        }
    }
}
