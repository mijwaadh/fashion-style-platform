import axios from 'axios';

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Authenticate with Shiprocket and get a Bearer token
 */
export const getShiprocketToken = async (): Promise<string> => {
    // Return cached token if still valid (tokens usually last 10 days, we'll refresh every 9)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD
        });

        cachedToken = res.data.token;
        // Set expiry to 9 days from now
        tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
        return cachedToken!;
    } catch (error: any) {
        console.error('Shiprocket Auth Error:', error.response?.data || error.message);
        throw new Error('Logistics authentication failed');
    }
};

/**
 * Create a custom order in Shiprocket
 */
export const createShiprocketOrder = async (orderData: any) => {
    const token = await getShiprocketToken();
    try {
        const res = await axios.post(`${BASE_URL}/orders/create/adhoc`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error: any) {
        console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Generate AWB (Air Waybill) for a shipment
 */
export const assignAWB = async (shipmentId: number) => {
    const token = await getShiprocketToken();
    try {
        const res = await axios.post(`${BASE_URL}/courier/assign/awb`, { shipment_id: shipmentId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error: any) {
        console.error('Shiprocket AWB Assignment Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get Shipping Label URL
 */
export const getShippingLabel = async (shipmentIds: number[]) => {
    const token = await getShiprocketToken();
    try {
        const res = await axios.post(`${BASE_URL}/shipping/label`, { shipment_id: shipmentIds }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error: any) {
        console.error('Shiprocket Label Generation Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Track order state
 */
export const trackShipment = async (awb: string) => {
    const token = await getShiprocketToken();
    try {
        const res = await axios.get(`${BASE_URL}/courier/track/awb/${awb}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error: any) {
        console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Add a new pickup location to Shiprocket
 */
export const addPickupLocation = async (locationData: {
    pickup_location: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    address_2?: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
}) => {
    const token = await getShiprocketToken();
    try {
        const res = await axios.post(`${BASE_URL}/settings/register/pickup`, locationData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error: any) {
        // If location already exists, Shiprocket might return a 422 or 400. 
        // We log it and continue if it's already there.
        console.error('Shiprocket Pickup Location Registration Error:', error.response?.data || error.message);
        if (error.response?.status === 422 || error.response?.data?.message?.includes('already exists')) {
            return { success: true, message: 'Location potentially already exists' };
        }
        throw error;
    }
};
