export interface IncidentSchema {
    id: string;
    service_id: number;
    message_id: string;
    last_state: string;
    updated_at: number;
}
