export interface ManagerClient {
    updateIncident(state: IncidentUpdateState): Promise<string | undefined>;
}

export interface IncidentUpdateState {
    channelId: string;
    messageId: string;
    incident: any;
}
