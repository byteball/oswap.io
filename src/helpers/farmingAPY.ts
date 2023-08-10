import axios from 'axios';
import config from '@/helpers/config';

export default async function fetchFarmingAPY(): Promise<[string?]> {
  try {
    const response = await axios.get(`${config.tokenBackendUrl}/lp_apy`);

    return response.data.data;
  } catch (e) {
    return [];
  }
}
