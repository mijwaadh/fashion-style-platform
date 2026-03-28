import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function test() {
    console.log('Testing Shiprocket Serviceability...');
    console.log('Email:', SHIPROCKET_EMAIL);
    
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
        console.log('Response Data:', JSON.stringify(res.data, null, 2));
        
        const couriers = res.data?.data?.available_courier_companies || [];
        console.log('Available Couriers Count:', couriers.length);
        
    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message);
    }
}

test();
