const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, 'backend/.env') });

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function test() {
    console.log('Testing Shiprocket Serviceability (JS)...');
    
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Token obtained.');

        const pickup = '110001';
        const delivery = '400001';
        const weight = 0.5;

        const res = await axios.get(`${BASE_URL}/courier/serviceability/`, {
            params: {
                pickup_postcode: pickup,
                delivery_postcode: delivery,
                weight,
                cod: 0
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response Status:', res.status);
        console.log('RAW DATA:', JSON.stringify(res.data, null, 2));
        
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

test();
