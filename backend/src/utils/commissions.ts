/**
 * Marketplace Commission Rates by Category
 * Rates are in percentages (e.g., 10 = 10%)
 */
export const COMMISSION_RATES: Record<string, number> = {
    'Clothing': 10,
    'Apparel': 10,
    'Ethnic Wear': 10,
    'Footwear': 12,
    'Accessories': 15,
    'Jewelry': 15,
    'Watches': 15,
    'Beauty': 8,
    'Personal Care': 8,
};

export const DEFAULT_COMMISSION = 5;

/**
 * Returns the commission rate for a given category string.
 * Performs a case-insensitive partial match.
 */
export const getCommissionRate = (category: string = ''): number => {
    const cat = category.trim();
    if (!cat) return DEFAULT_COMMISSION;

    // Check for exact or partial matches in the map
    for (const [key, rate] of Object.entries(COMMISSION_RATES)) {
        if (cat.toLowerCase().includes(key.toLowerCase())) {
            return rate;
        }
    }

    return DEFAULT_COMMISSION;
};
