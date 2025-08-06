'use client';

import { IndicatorDetailView } from '@/components/dashboard/indicator-detail-view';
import type { Indicator, IndicatorData } from '@/types';

interface IndicatorDetailModalProps {
    indicator: Indicator | null;
    data: IndicatorData[] | null;
    onClose: () => void;
}

export function IndicatorDetailModal({
    indicator,
    data,
    onClose
}: IndicatorDetailModalProps) {
    if (!indicator || !data) {
        return null;
    }

    return (
        <IndicatorDetailView
            indicator={indicator}
            data={data}
            onClose={onClose}
        />
    );
}
