<template>
  <Modal :open="open" @close="$emit('close')">
    <div>
      <input
        ref="query"
        id="query"
        autofocus
        autocomplete="off"
        class="form-control input-amount border-0 m-0 p-4 width-full"
        placeholder="Search"
        v-model="query"
      />
    </div>
    <div class="modal-body flex-auto mb-5">
      <a
        class="d-block py-2 px-4 text-white highlight"
        @click="selectAsset(assetInfo)"
        v-for="assetInfo in assets"
        :key="assetInfo.asset + assetInfo.leverage"
      >
        <Ticker :asset="assetInfo.asset" />/<Ticker :asset="assetInfo.opposite_asset" /> {{assetInfo.leverage}}x
        <Amount
          class="float-right"
          v-if="balances && getBalance(assetInfo) > 0"
          :asset="assetInfo.asset"
          :value="getBalance(assetInfo)"
        />
      </a>
    </div>
  </Modal>
</template>

<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['open', 'pool'],
  data() {
    return {
      query: ''
    };
  },
  computed: {
    assets() {
      const assets = [];
      const {x_asset, y_asset} = this.pool;
      for (let asset of [x_asset, y_asset]){
        const info = this.settings.assets[asset];
        const symbol = info.symbol;
        const sign = asset === x_asset ? +1 : -1;
        const opposite_asset = asset === x_asset ? y_asset : x_asset;
        for (let leverage of [2, 5, 10, 20, 50, 100]){
          const signedLeverage = sign * leverage;
          const leveragedAsset = this.pool.stateVars['leveraged_asset' + signedLeverage];
          const str = `${symbol} ${leverage}x`;
          if (str.toLowerCase().includes(this.query.toLowerCase()))
            assets.push({asset, opposite_asset, leverage, signedLeverage, symbol, leveragedAsset});
        }
      }
      return assets;
    },
    balances() {
      return this.auth.balances;
    }
  },
  methods: {
    selectAsset(assetInfo) {
      this.$emit('asset', assetInfo);
      this.$emit('close');
    },
    getBalance({signedLeverage, leveragedAsset}){
      let balance = leveragedAsset ? getBalance(this.balances, leveragedAsset) : 0;
      if (!this.auth.address)
        return balance;
      for (let var_name in this.pool.stateVars){
        if (var_name.startsWith('position_' + signedLeverage + '_')){
          const position = this.pool.stateVars[var_name];
          if (position.owner === this.auth.address)
            balance += position.shares;
        }
      }
      return balance;
    }
  }
};
</script>
