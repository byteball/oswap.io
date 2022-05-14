import axios from 'axios';
import config from '@/helpers/config';

export default async function fetchIconsList(): Promise<[string?]> {
  try {
    const response = await axios.get(`${config.assetIconCdnUrl}/list.json`);

    return response.data;
  } catch (e) {
    return [];
  }
}
