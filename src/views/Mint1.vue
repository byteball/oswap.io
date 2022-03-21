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
              <Ticker :asset="selectedPool.x_asset" />
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
              <Ticker :asset="selectedPool.y_asset" />
            </router-link>
          </div>
        </Box>
      </template>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!selectedPool || !amount_x || !amount_y"
        >
          Add liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { randomBytes } from 'crypto';
import texto from '@/helpers/texto';
import { generatePaymentMessage } from '@/helpers/_oswap';
import { shorten } from '@/helpers/utils';

export default {
  data() {
    return {
      selectedPool: false,
      amount_x: '',
      amount_y: '',
      poolAddress: this.$route.params.poolAddress
    };
  },
  watch: {
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.amount_x = '';
        this.amount_y = '';
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
      const assets = this.settings.assets;
      const address = this.selectedPool.address;
      let amount_x = this.amount_x;
      let amount_y = this.amount_y;
      const payments = [
        { address, amount: Math.floor(parseFloat(amount_x)), asset: this.selectedPool.x_asset },
        { address, amount: Math.floor(parseFloat(amount_y)), asset: this.selectedPool.y_asset }
      ];
      if (this.selectedPool.x_asset !== 'base' && this.selectedPool.y_asset !== 'base')
        payments.push({ address, amount: 1e4 });
      const paymentJsonBase64 = generatePaymentMessage({ payments });
      const assetXStr = assets[this.selectedPool.x_asset].symbol || shorten(this.selectedPool.x_asset);
      const assetYStr = assets[this.selectedPool.y_asset].symbol || shorten(this.selectedPool.y_asset);
      const pool = `${assetXStr}-${assetYStr}`;
      const message = `Add liquidity ${pool}\n[add-liquidity](payment:${paymentJsonBase64})`;
      const requestId = randomBytes(32).toString('base64');
      texto.on('pairing', msg => {
        if (msg.body.pairing_secret === requestId) msg.reply(message);
      });
      const url = `${this.auth.invite}#${requestId}`;
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    }
  }
};
</script>
