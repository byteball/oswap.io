import Vue from 'vue';
import store from '@/store';
import client from '@/helpers/client';
import {
  getAAState,
  getAAStateVars,
  FACTORY_ADDRESS,
  TOKEN_REGISTRY_ADDRESS
} from '@/helpers/_oswap';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';
import units from '@/helpers/units.json';

const state = {
  isLoading: false,
  assets: {},
  assetToSymbol: {},
  symbolToAsset: {},
  decimals: {},
  exchangeRates: {},
  pools: {},
  pairs: {},
  count: 0
};

client.subscribe(result => {
  const [command, { subject, body }] = result;
  if (command === 'justsaying' && subject === 'exchange_rates') {
    store.commit('exchangeRates', body);
  }
});

const mutations = {
  isLoading(_state, payload) {
    Vue.set(_state, 'isLoading', payload);
  },
  init(_state, { factory, a2sRegistry, s2aRegistry, descriptionRegistry, decimalsRegistry }) {
    const lSUnit = localStorage.getItem(`${LOCALSTORAGE_KEY}.unit`);
    const assets = { base: lSUnit ? JSON.parse(lSUnit) : units[0] };
    Vue.set(_state, 'assetToSymbol', a2sRegistry);
    Vue.set(_state, 'symbolToAsset', s2aRegistry);
    const decimals = { base: assets.base.decimals };
    Object.entries(descriptionRegistry).forEach((current: any) => {
      const asset = current[0].replace('current_desc_', '');
      decimals[asset] = parseInt(decimalsRegistry['decimals_' + current[1]]) || 0;
    });
    Vue.set(_state, 'decimals', decimals);
    if (factory.pools) {
      Vue.set(_state, 'pools', factory.pools); 
      Vue.set(_state, 'pairs', factory.pairs);
    //  Vue.set(_state, 'count', factory.count);
      Object.entries(factory.pools).forEach((pool: any) => {
        if (pool[1].asset) {
          [pool[1].x_asset, pool[1].y_asset].forEach(asset => {
            if (asset !== 'base')
              assets[asset] = { symbol: a2sRegistry[asset], decimals: decimals[asset] || 0 };
          });
        }
      });
    }
    Vue.set(_state, 'assets', assets);
  },
  unit(_state, payload) {
    Vue.set(_state.assets, 'base', payload);
    Vue.set(_state.decimals, 'base', payload.decimals);
  },
  exchangeRates(_state, payload) {
    Vue.set(_state, 'exchangeRates', payload);
  }
};

const actions = {
  init: async ({ commit }) => {
    commit('isLoading', true);
    const address = localStorage.getItem(`${LOCALSTORAGE_KEY}.address`);
    if (address) store.dispatch('login', address);
    const factoryVars = await getAAState(FACTORY_ADDRESS);
    let factory = { pools: {}, pairs: {} };
    for (let var_name in factoryVars) {
      const aa = var_name.replace('pool_', '');
      const pool = factoryVars[var_name];
      pool.asset = pool.pool_asset;
      factory.pools[aa] = pool;
      const { x_asset, y_asset } = pool;
      const pair = (x_asset < y_asset) ? (x_asset + '_' + y_asset) : (y_asset + '_' + x_asset);
      if (!factory.pairs[pair])
        factory.pairs[pair] = { pools: [], i: 0 };
      factory.pairs[pair].pools.push(aa);
      factory.pairs[pair].i++;
    }
    const a2sRegistryVars = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'a2s_', '_');
    let a2sRegistry = {};
    let s2aRegistry = {};
    for (let var_name in a2sRegistryVars) {
      const asset = var_name.replace('a2s_', '');
      const symbol = a2sRegistryVars[var_name];
      a2sRegistry[asset] = symbol;
      s2aRegistry[symbol] = asset;
    }
    const descriptionRegistry = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'current_desc_', '_');
    const decimalsRegistry = await getAAStateVars(TOKEN_REGISTRY_ADDRESS, 'decimals_', '_');
    commit('init', { factory, a2sRegistry, s2aRegistry, descriptionRegistry, decimalsRegistry });
    commit('isLoading', false);
  },
  unit: ({ commit }, unit) => {
    localStorage.setItem(`${LOCALSTORAGE_KEY}.unit`, JSON.stringify(unit));
    commit('unit', unit);
  }
};

export default {
  state,
  mutations,
  actions
};
