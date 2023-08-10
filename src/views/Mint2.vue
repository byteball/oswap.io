<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="1" />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <Box
        v-if="selectedPool.x_asset && selectedPool.balances.xn && selectedPool.balances.yn"
        class="d-flex"
      >
        <div class="flex-auto">
          <label for="input" class="d-block">
            Deposit
            <LabelBalance :asset="inputAsset" @select="selectAmount" />
          </label>
          <InputAmount
            id="input"
            v-model="inputAmount"
            @change="onUpdatedInputAmount"
            :asset="inputAsset"
          />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken
            :values="[selectedPool.x_asset, selectedPool.y_asset]"
            v-model="inputAsset"
          />
        </div>
      </Box>
      <Box v-else-if="selectedPool">
        <p class="text-white m-0">
          Add liquidity with both tokens first.
        </p>
      </Box>
      <Box v-if="inputAsset">
        <p class="text-white m-0">
          You can add up to {{maxAmountInDisplayUnits}} <Ticker :asset="inputAsset" />, the pool's price won't change.
        </p>
      </Box>
      <Box v-if="isOldFactory">
        <p class="m-0">
          This is a buggy pool, adding liquidity is disabled.
        </p>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!inputAsset || !inputAmount || isOldFactory || this.maxAmount === 0"
        >
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { generateUri, toString } from '@/helpers/_oswap';
import config from '@/helpers/config';

export const FACTORY_ADDRESSES = config.factoryAddresses;

export default {
  data() {
    return {
      selectedPool: false,
      trade: false,
      maxAmount: 0,
      inputAmount: '',
      inputAsset: '',
      poolAddress: this.$route.params.poolAddress,
    };
  },
  watch: {
    async inputAmount(value, oldValue) {
      if (value !== oldValue) {
      }
    },
    async inputAsset(value, oldValue) {
      if (value !== oldValue) {
        await this.init();
      }
    },
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.inputAmount = '';
      }
    }
  },
  computed: {
    maxAmountInDisplayUnits: function(){
      return +toString(this.maxAmount, this.getDecimals(this.inputAsset));
    },
    isOldFactory(){
      return this.selectedPool && this.settings.pools[this.selectedPool.address].factoryAddress !== FACTORY_ADDRESSES[0];
    },
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
    },
    getDecimals(assetId) {
      return this.settings.decimals[assetId] || 0;
    },
    async init() {
      if (!this.inputAsset) return;
      if (!this.selectedPool) return;
      const pool = this.selectedPool;
      const {x_asset, Lambda, balances, stateVars: {profits}} = pool;
      const assetLabel = this.inputAsset === x_asset ? 'x' : 'y';
      const oppositeAssetLabel = assetLabel === 'x' ? 'y' : 'x';
      if (Lambda > 1){
        const x_leverage = balances.x/balances.xn;
        const y_leverage = balances.y/balances.yn;
        const underleveragedAssetLabel = x_leverage < y_leverage ? 'x' : 'y';
        if (assetLabel === underleveragedAssetLabel){
          this.maxAmount = 0;
        }
        else{
          const maxOppositeAmount = Math.floor(balances[oppositeAssetLabel+'n'] * Lambda - balances[oppositeAssetLabel]);
          this.maxAmount = Math.floor(maxOppositeAmount/balances[oppositeAssetLabel] * balances[assetLabel+'n']);
        }
      }
      else{
        const profitToProportional = profits[oppositeAssetLabel] / balances[oppositeAssetLabel] * balances[assetLabel] - profits[assetLabel];
        this.maxAmount = profitToProportional > 0 ? Math.floor(profitToProportional) : 0;
      }
    },
    handleSubmit() {
      const address = this.selectedPool.address;
      const url = generateUri(address, null, this.inputAmount, this.inputAsset);

      this.track();

      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    },
    onUpdatedInputAmount() {
      if (!this.inputAsset) return;
    },
    track() {
      this.$gtag.event('adding liquidity (one token)', {
        event_category: 'liquidity page',
        event_label: this.selectedPool.address,
        value: `${this.inputAsset}`
      });
    }
  }
};
</script>
