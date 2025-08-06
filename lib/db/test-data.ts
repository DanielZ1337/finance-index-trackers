import { IndicatorDataService } from '@/lib/db/queries';

async function insertTestData() {
    console.log('🧪 Inserting test data...');

    try {
        // Insert some test data for CNN FGI
        await IndicatorDataService.insertIndicatorData({
            indicatorId: 'cnn-fgi',
            tsUtc: new Date(),
            value: '72',
            label: 'Greed',
        });

        // Insert some test data for Crypto FGI
        await IndicatorDataService.insertIndicatorData({
            indicatorId: 'crypto-fgi',
            tsUtc: new Date(),
            value: '35',
            label: 'Fear',
        });

        // Insert some test data for VIX
        await IndicatorDataService.insertIndicatorData({
            indicatorId: 'vix',
            tsUtc: new Date(),
            value: '18.5',
            label: 'Low Volatility',
        });

        console.log('✅ Test data inserted successfully!');
    } catch (error) {
        console.error('❌ Error inserting test data:', error);
    }
}

if (require.main === module) {
    insertTestData()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { insertTestData };
