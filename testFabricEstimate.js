const axios = require('axios');

async function testEstimate() {
    try {
        const payload = {
            garmentType: 'mens-kurta',
            measurements: {
                chest: 50,
                waist: 36
                // Others will be defaulted by backend
            }
        };

        console.log('Sending payload:', payload);

        const response = await axios.post('http://localhost:3007/api/fabric/estimate', payload); // Admin service port 3007
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testEstimate();
