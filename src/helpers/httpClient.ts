import axios from 'axios';
import config from '@/helpers/config';

export async function request(method: string, payload: any) {
  const { data } = await axios.post(`${config.hub_host}/${method}`, payload);
  return data.data;
}
