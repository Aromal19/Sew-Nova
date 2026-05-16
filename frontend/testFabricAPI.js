// Quick test to verify fabric estimation API from frontend perspective
const testFabricAPI = async () => {
    const apiUrl = 'http://localhost:3007/api/fabric/estimate';

    const testPayload = {
        garmentType: 'mens-kurta',
        measurements: {
            chest: 38,
            waist: 34,
            length: 42,
            sleeve: 25,
            shoulder: 18,
            hip: 40
        }
    };

    console.log('🧪 Testing Fabric Estimation API...');
    console.log('URL:', apiUrl);
    console.log('Payload:', testPayload);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });

        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', data);

        if (data.finalMeters) {
            console.log('✅ API is working! Final meters:', data.finalMeters);
        } else {
            console.log('❌ API response missing finalMeters');
        }
    } catch (error) {
        console.error('❌ API call failed:', error);
    }
};

testFabricAPI();
