import client from '@/helpers/client';
import config from '@/helpers/config';

export const FACTORY_ADDRESSES = config.factoryAddresses;
export const BASE_ADDRESS = config.baseAddress;
export const TOKEN_REGISTRY_ADDRESS = config.tokenRegistryAddress;

let definitions = {};
let cachedStateVars = {};

export function fromString(str: string, decimals: number = 0) {
  const multiplier = 10 ** decimals;
  // @ts-ignore
  return Math.round(parseFloat(str).toFixed(decimals) * multiplier);
}

export function toString(amount: number, decimals: number = 0) {
  const multiplier = 10 ** decimals;
  const str = parseFloat((amount / multiplier).toFixed(decimals));
  return isNaN(str) || str < 0 ? '' : Number(str).toLocaleString();
}


export async function getInfo(address) {
  try {
    const stateVars = await getAAState(address);
    const definition = await getAADefinition(address);
    const params = definition[1].params;
    const defaults = { swap_fee: 0.003, exit_fee: 0.005, arb_profit_tax: 0, leverage_profit_tax: 0, leverage_token_tax: 0, mid_price: 0, price_deviation: 0, base_interest_rate: 0.2, pool_leverage: 1, alpha: 0.5, period_length: 3600 };
    const info = { ...defaults, ...params, ...stateVars };

    // synonyms
    info.Lambda = info.pool_leverage;
    info.gamma = info.price_deviation;

    return { info, stateVars, params };
  } catch (e) {
    return {};
  }
}

export async function getAADefinition(address: string) {
  if (!definitions[address])
    definitions[address] = await client.requestAsync('light/get_definition', address);
  return definitions[address];
}

export async function getAAState(address: string, delimiter?: string) {
  if (cachedStateVars[address] && cachedStateVars[address].ts > Date.now() - 3000)
    return cachedStateVars[address].state;
  const state = await client.requestAsync('light/get_aa_state_vars', { address });
  cachedStateVars[address] = { state, ts: Date.now() };
  return state;
}

export async function getAAStates(addresses: string[]) {
  let states = {};
  const arrStates = await Promise.all(addresses.map(address => getAAState(address)));
  for (let i = 0; i < addresses.length; i++)
    states[addresses[i]] = arrStates[i];
  return states;
}

export async function getAAStateVars(address: string, var_prefix: string, delimiter?: string) {
  const state = await client.requestAsync('light/get_aa_state_vars', { address, var_prefix });
  return state;
}

export async function getAAsByBaseAAs(aa: string | string[], aaParams?: object) {
  let params = { params: aaParams };
  if (typeof aa === 'string') {
    params['base_aa'] = aa;
  } else {
    params['base_aas'] = aa;
  }
  return await client.requestAsync('light/get_aas_by_base_aas', params);
}


export function generateUri(address, data, amount = 1e4, asset?) {
  let uri = `${config.uri}:${address}`;
  uri += `?amount=${Math.floor(amount)}`;
  if (asset) uri += `&asset=${encodeURIComponent(asset)}`;
  if (data && Object.keys(data).length > 0) {
    const json = JSON.stringify(data);
    const b64 = encodeURIComponent(Buffer.from(json).toString('base64'));
    uri += `&base64data=${b64}`;
  }
  return uri;
}

export function generatePaymentMessage(objPaymentRequest) {
  const paymentJson = JSON.stringify(objPaymentRequest);
  return Buffer.from(paymentJson).toString('base64');
}

export function getBalance(balances, asset, pending = true) {
  if (!balances || !balances[asset]) return 0;
  return balances[asset].stable + (pending ? balances[asset].pending : 0);
}
