<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <LeverageNav />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <Box
        v-if="selectedPool.x_asset && selectedPool.balances.xn && selectedPool.balances.yn"
        class="d-flex"
      >
        <div class="flex-auto">
          <label for="input" class="d-block">
            Input
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
          Add liquidity first.
        </p>
      </Box>
      <BoxSelectLeverage v-if="selectedPool" v-model="leverage" :leverageType="leverageType" :sign="sign" :pool="selectedPool" />
      <BoxSelectLeverageType :leverageType="leverageType" v-model="leverageType" />
      <Box v-if="final_price">
        <label>Average price</label>
        <div class="text-white">
          1 <Ticker :asset="inputAsset" />/<Ticker :asset="oppositeAsset" /> {{leverage}}x = {{avg_share_price.toPrecision(6)}} <Ticker :asset="inputAsset" />
        </div>
        <label for="input">Final prices</label>
        <div class="text-white">
          1 <Ticker :asset="inputAsset" /> =
          {{ +final_price.toFixed(this.getDecimals(oppositeAsset)) }}
          <Ticker :asset="oppositeAsset" />
        </div>
        <div class="text-white">
          1 <Ticker :asset="oppositeAsset" /> =
          {{ +(1/final_price).toFixed(this.getDecimals(inputAsset)) }}
          <Ticker :asset="inputAsset" />
        </div>
      </Box>
      <Box v-else-if="tooMuch">
        <p class="m-0">
          The price would change too much, try a smaller amount.
        </p>
      </Box>
      <Box>
        <p class="m-0">
          Your position is never liquidated. If the price goes against you, your position automatically scales down so as to keep it solvent. The position automatically scales up as the price changes in your favor.
        </p>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!inputAsset || !inputAmount || !leverage || !final_price || needAsset"
        >
          Get leverage
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { generateUri, toString } from '@/helpers/_oswap';

export default {
  data() {
    return {
      poolAddress: this.$route.params.poolAddress,
      selectedPool: false,
      inputAmount: '',
      inputAsset: '',
      oppositeAsset: '',
	  leverage: null,
	  leverageType: 'position',
	  final_price: null,
	  avg_share_price: null,
	  tooMuch: false,
    };
  },
  watch: {
    async inputAmount(value, oldValue) {
      if (value !== oldValue) {
        this.updateFinalPrice();
      }
    },
    async inputAsset(value, oldValue) {
      if (value !== oldValue) {
	      const pool = this.selectedPool;
		    this.oppositeAsset = this.inputAsset === pool.x_asset ? pool.y_asset : pool.x_asset;
        this.updateFinalPrice();
      }
    },
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.inputAmount = '';
      }
    },
	leverage(value, oldValue) {
      if (value !== oldValue) {
        this.updateFinalPrice();
      }
	},
  },
  computed: {
    sign() {
      if (!this.selectedPool || !this.inputAsset)
        return null;
      return this.inputAsset === this.selectedPool.x_asset ? +1 : -1;
    },
    needAsset(){
      if (!this.sign || !this.leverage)
        return false;
      const signedLeverage = this.sign > 0 ? +this.leverage : -this.leverage;
      return this.leverageType === 'tokens' && !this.selectedPool.stateVars['leveraged_asset' + signedLeverage];
    },
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
    },
    getDecimals(assetId) {
      return this.settings.decimals[assetId] || 0;
    },
    updateFinalPrice() {
      if (!this.inputAsset) return;
      if (!this.inputAmount) return;
      if (!this.selectedPool) return;
      if (!this.leverage) return;
      const pool = this.selectedPool;
      const x_asset = this.settings.assets[pool.x_asset];
      const y_asset = this.settings.assets[pool.y_asset];
      const x_decimals = x_asset ? x_asset.decimals : 0;
      const y_decimals = y_asset ? y_asset.decimals : 0;
      const priceMultiplier = this.inputAsset === pool.x_asset ? 10**(x_decimals-y_decimals) : 10**(y_decimals-x_decimals);
      const netAmount = Math.round(this.inputAmount*0.99);
      try{
        const { res, delta } = pool.getLeveragedBuyParams(netAmount, this.inputAsset, this.leverage);
        console.log('updateFinalPrice', delta, 'res', res)
        this.final_price = res.final_price * priceMultiplier;
        this.avg_share_price = res.avg_share_price;
        this.tooMuch = false;
      }
      catch(e){
        console.log('getLeveragedBuyParams failed', e)
        this.final_price = null;
        this.tooMuch = true;
      }
    },
    handleSubmit() {
      const pool = this.selectedPool;
      const address = pool.address;
      const netAmount = Math.round(this.inputAmount*0.99);
      const { res, delta } = pool.getLeveragedBuyParams(netAmount, this.inputAsset, this.leverage);
      console.log('handleSubmit res', res)
      const data = {
        L: this.leverage,
        asset: this.inputAsset,
        buy: 1,
        delta,
      };
      if (this.leverageType === 'tokens')
        data.tokens = 1;
      const url = generateUri(address, data, this.inputAmount, this.inputAsset);
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
  }
};
</script>
