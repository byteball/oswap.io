<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <template v-if="selectedPool.x_asset">
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount_x" class="d-block">
              Deposit
              <LabelBalance :asset="selectedPool.x_asset" @select="setAmountX" />
            </label>
            <InputAmount
              id="amount_x"
              v-model="amount_x"
              :asset="selectedPool.x_asset"
              @change="updateAmountY"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selectedPool.x_asset" class="btn-mktg">
              <Ticker :asset="selectedPool.x_asset" :showIcon="true" />
            </router-link>
          </div>
        </Box>
        <Box class="d-flex">
          <div class="flex-auto">
            <label for="amount_y" class="d-block">
              Deposit
              <LabelBalance :asset="selectedPool.y_asset" @select="setAmountY" />
            </label>
            <InputAmount
              id="amount_y"
              v-model="amount_y"
              :asset="selectedPool.y_asset"
              @change="updateAmountX"
            />
          </div>
          <div class="text-right mt-4 ml-4">
            <router-link :to="'/asset/' + selectedPool.y_asset" class="btn-mktg">
              <Ticker :asset="selectedPool.y_asset" :showIcon="true" />
            </router-link>
          </div>
        </Box>
        <Box v-if="isOldFactory">
          <p class="m-0">
            This is a buggy pool, adding liquidity is disabled.
          </p>
        </Box>
      </template>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!selectedPool || !amount_x || !amount_y || isOldFactory || redundantAsset === null"
        >
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { generateUri } from '@/helpers/_oswap';
import config from '@/helpers/config';

export const FACTORY_ADDRESSES = config.factoryAddresses;

export default {
  data() {
    return {
      selectedPool: false,
      amount_x: '',
      amount_y: '',
      poolAddress: this.$route.params.poolAddress
    };
  },
  computed: {
    isOldFactory(){
      return this.selectedPool && this.settings.pools[this.selectedPool.address].factoryAddress !== FACTORY_ADDRESSES[0];
    },
  },
  watch: {
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.amount_x = '';
        this.amount_y = '';
      }
    }
  },
  computed: {
    redundantAsset: function() {
      const pool_leverage = this.selectedPool?.params?.pool_leverage;
      const x_asset = this.selectedPool?.params?.x_asset;
      const y_asset = this.selectedPool?.params?.y_asset;

      const {x, xn} = this.selectedPool?.balances || {};

      if (x_asset && y_asset && pool_leverage !== undefined) {
        if (x / pool_leverage < xn) {
          return x_asset;
        } else {
          return y_asset;
        }
      } else {
        return null;
      }
    }
  },
  methods: {
    setAmountX(amount) {
      this.amount_x = amount;
      this.updateAmountY();
    },
    setAmountY(amount) {
      this.amount_y = amount;
      this.updateAmountX();
    },
    updateAmountX() {
      const pool = this.selectedPool;
      if (!this.amount_y || !pool || !pool.hasLiquidity() && !pool.info.mid_price) return;
      const k = !pool.hasLiquidity() && pool.info.mid_price
        ? 1/pool.info.mid_price * (1-pool.info.alpha) / pool.info.alpha
        : pool.balances.xn / pool.balances.yn;
      this.amount_x = (k * this.amount_y).toFixed();
    },
    updateAmountY() {
      const pool = this.selectedPool;
      if (!this.amount_x || !pool || !pool.hasLiquidity() && !pool.info.mid_price) return;
      const k = !pool.hasLiquidity() && pool.info.mid_price
        ? 1/pool.info.mid_price * (1-pool.info.alpha) / pool.info.alpha
        : pool.balances.xn / pool.balances.yn;
      this.amount_y = (this.amount_x / k).toFixed();
    },
    handleSubmit() {
      const address = this.selectedPool.address;
      const x_asset = this.selectedPool.x_asset;
      const y_asset = this.selectedPool.y_asset;

      const floor_amount_x = parseFloat(this.amount_x);
      const floor_amount_y = parseFloat(this.amount_y);
      
      const firstAsset = this.redundantAsset;
      const firstAmount = this.redundantAsset === x_asset ? floor_amount_x : floor_amount_y;

      const secondAsset = this.redundantAsset === x_asset ? y_asset : x_asset;
      const secondAmount = this.redundantAsset === x_asset ? floor_amount_y : floor_amount_x;

      const url = generateUri(address, {}, firstAmount, firstAsset, secondAmount, secondAsset);

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
    track() {
      this.$gtag.event('adding liquidity', {
        event_category: 'liquidity page',
        event_label: 'assets',
        value: `${this.selectedPool.x_asset}_${this.selectedPool.y_asset}`
      });
    }
  }
};
</script>
