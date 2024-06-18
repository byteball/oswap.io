<template>
  <div class="container-sm px-3">
    <Box>
      <h1 v-if="id.length === 44 || id === 'base'">
        <template v-if="id !== 'base'">{{ id | shorten }}</template>
        <template v-else><Ticker class="h2" :asset="`${id}`"/></template>
      </h1>
      <h1 v-else>Invalid asset ID</h1>
      <div v-if="symbol" class="mt-2">
        <label>Symbol</label>
        <p v-text="symbol" class="text-white" />
        <label>Decimals</label>
        <p v-text="decimals" class="text-white" />
      </div>
      <div v-if="id.length === 44 && id !== 'base'">
        <router-link :to="'/create-pool/' + id" class="btn-mktg">
          Create new pool
        </router-link>
        <a
          v-if="!symbol"
          :href="`https://${config.testnet ? 'testnet.' : ''}tokens.ooo/`"
          class="btn-mktg ml-2"
        >
          Register token symbol
        </a>
      </div>
    </Box>
    <Box v-for="(pool, i) in pools" :key="i">
      <label class="d-block">Pool</label>
      <router-link class="d-block" :to="{ name: 'mint1', params: { poolAddress: pool.address } }">
        <Ticker class="h2" :asset="`${pool.x_asset}_${pool.y_asset}`" :showIcon="true" />
      </router-link>
      <PoolInfo :pool="pool" />
    </Box>
  </div>
</template>

<script>
import { b64UriDec } from '@/helpers/utils';
import Pool from '@/helpers/_oswap/pool';
import config from '@/helpers/config';

export default {
  data() {
    return {
      id: b64UriDec(this.$route.params[0] || this.$route.params.pathMatch || ''),
      pools: {},
      config
    };
  },
  async created() {
    const pools = [];
    const promises = [];
    Object.entries(this.settings.pools)
      .filter(([address, pool]) => pool.x_asset === this.id || pool.y_asset === this.id)
      .forEach(([address, pool]) => {
        const p = new Pool(address, [pool.x_asset, pool.y_asset]);
        promises.push(p.init());
        pools.push(p);
      });
    await Promise.all(promises);
    this.pools = pools
      .map(pool => {
        pool.marketcap = pool.getMarketcap(this.settings);
        pool.old = this.settings.pools[pool.address].old;
        return pool;
      })
      .sort((a, b) => a.old === b.old ? (a.marketcap == b.marketcap ? 0 : a.marketcap > b.marketcap ? -1 : 1) : (b.old ? -1 : 1))
  },
  computed: {
    symbol() {
      return this.settings.assetToSymbol[this.id] || '';
    },
    decimals() {
      return this.settings.decimals[this.id] || 0;
    }
  }
};
</script>
