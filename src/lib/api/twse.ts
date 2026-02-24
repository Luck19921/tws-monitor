import axios from 'axios';
import NodeCache from 'node-cache';

// Shared Cache for TWSE Open APIs (live for 1 hour to avoid excessive hits)
// TWSE end of day data doesn't update frequently intraday via these open endpoints
export const twseCache = new NodeCache({ stdTTL: 3600 });

export async function fetchTWSESnapshot(datasetKey: string, endpointUrl: string) {
    let data = twseCache.get<any[]>(datasetKey);
    if (!data) {
        console.log(`📡 Fetching TWSE ${datasetKey} from OpenAPI...`);
        const res = await axios.get(endpointUrl, { timeout: 8000 });
        if (res.data && Array.isArray(res.data)) {
            data = res.data;
            twseCache.set(datasetKey, data);
        } else {
            throw new Error(`Failed to parse TWSE dataset: ${datasetKey}`);
        }
    }
    return data;
}
