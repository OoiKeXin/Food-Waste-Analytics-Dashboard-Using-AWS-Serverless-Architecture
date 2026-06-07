/**
 * CSV Loader Utility
 * Loads and parses the food waste CSV file
 */

/**
 * Load CSV file and parse into data array
 * @returns {Promise<Array>} Parsed food waste data
 */
export let foodWasteData = [];
export let GLOBAL_AVG = 120;

export async function loadCSVData() {
    try {
        console.log("CSV LOADER FILE LOADED");
        
        const response = await fetch('https://rpymqbayaa.execute-api.ap-southeast-2.amazonaws.com/prod/data');
        const result = await response.json();

        const rawData = result.data;

        const data = rawData.map(item => {
            const coords = getCountryCoordinates(item.country);
            const code = getCountryCode(item.country);

            return {
                country: item.country,
                combined: Number(item.combined),
                household: Number(item.household || 0),
                retail: Number(item.retail || 0),
                foodService: Number(item.foodService || 0),

                // 🔥 ADD BACK MISSING FIELDS
                lat: coords.lat,
                lon: coords.lon,
                code: code,
                flagUrl: `https://flagcdn.com/w80/${code}.png`,
                region: getRegion(item.country)
            };
        });

        GLOBAL_AVG = Math.round(
            data.reduce((s, d) => s + d.combined, 0) / data.length
        );

        foodWasteData = data;

        console.log("[OK] Data loaded:", data.length);

        return data;

    } catch (err) {
        console.error(err);
        return [];
    }
}

/**
 * Parse CSV row with quoted values
 */
function parseCSVRow(row) {
    const result = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    result.push(currentValue);
    return result;
}

/**
 * Get country coordinates (latitude, longitude)
 */
function getCountryCoordinates(countryName) {
    const coordsMap = {
        'Afghanistan': { lat: 33.9, lon: 66.0 },
        'Albania': { lat: 41.2, lon: 20.2 },
        'Algeria': { lat: 28.0, lon: 3.0 },
        'Argentina': { lat: -38.4, lon: -63.6 },
        'Australia': { lat: -25.3, lon: 133.8 },
        'Austria': { lat: 47.5, lon: 14.5 },
        'Bangladesh': { lat: 23.7, lon: 90.4 },
        'Belgium': { lat: 50.5, lon: 4.5 },
        'Brazil': { lat: -14.2, lon: -51.9 },
        'Canada': { lat: 56.1, lon: -106.3 },
        'Chile': { lat: -35.7, lon: -71.5 },
        'China': { lat: 35.0, lon: 105.0 },
        'Colombia': { lat: 4.6, lon: -74.1 },
        'Denmark': { lat: 56.2, lon: 9.5 },
        'Egypt': { lat: 26.8, lon: 30.8 },
        'France': { lat: 46.6, lon: 2.3 },
        'Germany': { lat: 51.1, lon: 10.4 },
        'Greece': { lat: 39.0, lon: 21.8 },
        'India': { lat: 20.5, lon: 78.9 },
        'Indonesia': { lat: -0.8, lon: 113.2 },
        'Italy': { lat: 41.9, lon: 12.6 },
        'Japan': { lat: 36.2, lon: 138.2 },
        'Malaysia': { lat: 4.2, lon: 101.9 },
        'Mexico': { lat: 23.6, lon: -102.5 },
        'Netherlands': { lat: 52.1, lon: 5.3 },
        'Nigeria': { lat: 9.6, lon: 8.0 },
        'Pakistan': { lat: 30.4, lon: 69.3 },
        'Poland': { lat: 51.9, lon: 19.1 },
        'Portugal': { lat: 39.4, lon: -8.2 },
        'Russia': { lat: 61.5, lon: 105.3 },
        'Saudi Arabia': { lat: 23.9, lon: 45.0 },
        'South Africa': { lat: -30.6, lon: 24.9 },
        'South Korea': { lat: 35.9, lon: 127.8 },
        'Spain': { lat: 40.4, lon: -3.7 },
        'Sweden': { lat: 60.1, lon: 18.6 },
        'Thailand': { lat: 15.8, lon: 100.9 },
        'Turkey': { lat: 38.9, lon: 35.0 },
        'United Kingdom': { lat: 55.3, lon: -3.4 },
        'United States': { lat: 39.8, lon: -98.5 },
        'Vietnam': { lat: 14.0, lon: 108.0 }
    };
    
    const normalized = countryName.trim();
    if (coordsMap[normalized]) return coordsMap[normalized];
    
    return { lat: (Math.random() * 140 - 70), lon: (Math.random() * 360 - 180) };
}

/**
 * Get country code (ISO 2-letter)
 */
function getCountryCode(countryName) {
    const codeMap = {
        'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Argentina': 'ar',
        'Australia': 'au', 'Austria': 'at', 'Bangladesh': 'bd', 'Belgium': 'be',
        'Brazil': 'br', 'Canada': 'ca', 'Chile': 'cl', 'China': 'cn', 'Colombia': 'co',
        'Denmark': 'dk', 'Egypt': 'eg', 'France': 'fr', 'Germany': 'de', 'Greece': 'gr',
        'India': 'in', 'Indonesia': 'id', 'Italy': 'it', 'Japan': 'jp', 'Malaysia': 'my',
        'Mexico': 'mx', 'Netherlands': 'nl', 'Nigeria': 'ng', 'Pakistan': 'pk',
        'Poland': 'pl', 'Portugal': 'pt', 'Russia': 'ru', 'Saudi Arabia': 'sa',
        'South Africa': 'za', 'South Korea': 'kr', 'Spain': 'es', 'Sweden': 'se',
        'Thailand': 'th', 'Turkey': 'tr', 'United Kingdom': 'gb', 'United States': 'us',
        'Vietnam': 'vn'
    };
    return codeMap[countryName] || countryName.slice(0, 2).toLowerCase();
}

/**
 * Get region for country
 */
function getRegion(countryName) {
    const regionMap = {
        'Brazil': 'Latin America', 'Argentina': 'Latin America', 'Mexico': 'Latin America',
        'Canada': 'North America', 'United States': 'North America',
        'China': 'Asia', 'India': 'Asia', 'Japan': 'Asia', 'Malaysia': 'Asia', 
        'Thailand': 'Asia', 'Vietnam': 'Asia', 'South Korea': 'Asia', 'Indonesia': 'Asia',
        'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe',
        'United Kingdom': 'Europe', 'Sweden': 'Europe', 'Poland': 'Europe', 'Netherlands': 'Europe',
        'Turkey': 'Eurasia', 'Russia': 'Eurasia',
        'Egypt': 'Africa', 'Nigeria': 'Africa', 'South Africa': 'Africa',
        'Australia': 'Oceania', 'Saudi Arabia': 'Middle East'
    };
    return regionMap[countryName] || 'Other';
}

/**
 * Fallback data if CSV fails to load
 */
function getFallbackData() {
    return [
        { country: "United States", combined: 139, household: 59, retail: 16, foodService: 64, lat: 39.8, lon: -98.5, code: "us", flagUrl: "https://flagcdn.com/w80/us.png", region: "North America" },
        { country: "China", combined: 126, household: 64, retail: 16, foodService: 46, lat: 35.0, lon: 105.0, code: "cn", flagUrl: "https://flagcdn.com/w80/cn.png", region: "Asia" },
        { country: "India", combined: 94, household: 50, retail: 16, foodService: 28, lat: 20.5, lon: 78.9, code: "in", flagUrl: "https://flagcdn.com/w80/in.png", region: "Asia" },
        { country: "Brazil", combined: 104, household: 60, retail: 16, foodService: 28, lat: -14.2, lon: -51.9, code: "br", flagUrl: "https://flagcdn.com/w80/br.png", region: "Latin America" },
        { country: "Germany", combined: 102, household: 75, retail: 6, foodService: 21, lat: 51.1, lon: 10.4, code: "de", flagUrl: "https://flagcdn.com/w80/de.png", region: "Europe" }
    ];
}