export interface CollectorConfig {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    enabled: boolean;
    category: string;
    source: string;
    frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
}

export interface CollectorSettings {
    defaultFrequency: string;
    requestDelay: number;
    timeout: number;
    retries: number;
}

export interface CollectorsConfigFile {
    collectors: CollectorConfig[];
    settings: CollectorSettings;
}

export interface CollectionResult {
    success: boolean;
    collectorId: string;
    name: string;
    timestamp: string;
    value?: number;
    score?: number;
    label?: string;
    count?: number;
    error?: string;
    duration?: number;
}
