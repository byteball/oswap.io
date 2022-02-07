<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <LeverageNav :default="1" />
      <BoxSelectPool :poolAddress="poolAddress" v-model="selectedPool" />
      <Box
        v-if="selectedPool.x_asset && selectedPool.balances.xn && selectedPool.balances.yn"
        class="d-flex"
      >
        <div class="flex-auto">
          <label for="input" class="d-block">
            Input
            <LabelBalance :asset="inputAssetInfo.leveragedAsset" :decimals_asset="inputAssetInfo.asset" @select="selectAmount" />
          </label>
          <InputAmount
            id="input"
            v-model="inputAmount"
            @change="onUpdatedInputAmount"
            :asset="inputAssetInfo.asset"
          />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectLeveragedToken
            :pool="selectedPool"
            v-model="inputAssetInfo"
          />
        </div>
      </Box>
      <Box v-else-if="selectedPool">
        <p class="text-white m-0">
          Add liquidity first.
        </p>
      </Box>
      <BoxSelectLeverageType :leverageType="leverageType" v-model="leverageType" />
      <BoxSelectLeveragedPosition v-if="leverageType === 'position' && !needLogin && inputAssetInfo.asset" :positions="positions" :asset="inputAssetInfo.asset" v-model="position_id" />
      <Box v-if="needLogin">
        <p class="m-0">
          <a :href="invite">Log in</a> to see your positions.
        </p>
      </Box>
      <Box v-if="final_price">
        <label>Average price</label>
        <div class="text-white">
          1 <Ticker :asset="inputAssetInfo.asset" />/<Ticker :asset="oppositeAsset" /> {{inputAssetInfo.leverage}}x = {{avg_share_price.toPrecision(6)}} <Ticker :asset="inputAssetInfo.asset" />
        </div>
        <label for="input">Final prices</label>
        <div class="text-white">
          1 <Ticker :asset="inputAssetInfo.asset" /> =
          {{ +final_price.toFixed(this.getDecimals(oppositeAsset)) }}
          <Ticker :asset="oppositeAsset" />
        </div>
        <div class="text-white">
          1 <Ticker :asset="oppositeAsset" /> =
          {{ +(1/final_price).toFixed(this.getDecimals(inputAssetInfo.asset)) }}
          <Ticker :asset="inputAssetInfo.asset" />
        </div>
      </Box>
      <Box v-else-if="tooMuch">
        <p class="m-0">
          The price would change too much, try a smaller amount.
        </p>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!inputAssetInfo || !inputAssetInfo.asset || !inputAmount || !final_price || !inputIsValid"
        >
          Deleverage
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
      inputAssetInfo: {},
      oppositeAsset: '',
      leverageType: 'position',
      position_id: null,
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
    async inputAssetInfo(value, oldValue) {
      if (value !== oldValue) {
	      const pool = this.selectedPool;
		    this.oppositeAsset = this.inputAssetInfo.asset === pool.x_asset ? pool.y_asset : pool.x_asset;
        this.updateFinalPrice();
      }
    },
    async selectedPool(value, oldValue) {
      if (value !== oldValue) {
        this.inputAmount = '';
      }
    },
    position_id(value, oldValue){
      if (value !== oldValue && value)
        this.inputAmount = this.positions[value].shares;
    },
  },
  computed: {
    needLogin: function(){
      return this.leverageType === 'position' && this.inputAssetInfo.asset && !this.auth.address;
    },
    invite: function(){
      return `${this.auth.invite}#login`;
    },
    sign() {
      if (!this.selectedPool || !this.inputAssetInfo.asset)
        return null;
      return this.inputAssetInfo.asset === this.selectedPool.x_asset ? +1 : -1;
    },
    inputIsValid(){
      if (!this.selectedPool || !this.inputAssetInfo.asset)
        return false;
      if (this.leverageType === 'tokens')
        return !!this.inputAssetInfo.leveragedAsset;
      else
        return !!this.position_id;
    },
    positions(){
      if (!this.selectedPool || !this.inputAssetInfo.asset || !this.auth.address || this.leverageType === 'tokens')
        return null;
      const {signedLeverage} = this.inputAssetInfo;
      let positions = {};
      const {stateVars} = this.selectedPool;
      for (let var_name in stateVars){
        if (var_name.startsWith('position_' + signedLeverage + '_')){
          const position = stateVars[var_name];
          if (position.owner === this.auth.address)
            positions[var_name] = position;
        }
      }
      return positions;
    }
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
    },
    getDecimals(assetId) {
      return this.settings.decimals[assetId] || 0;
    },
    updateFinalPrice() {
      if (!this.inputAssetInfo.asset) return;
      if (!this.inputAmount) return;
      if (!this.selectedPool) return;
      const {leverage, asset} = this.inputAssetInfo;
      const pool = this.selectedPool;
      const x_asset = this.settings.assets[pool.x_asset];
      const y_asset = this.settings.assets[pool.y_asset];
      const x_decimals = x_asset ? x_asset.decimals : 0;
      const y_decimals = y_asset ? y_asset.decimals : 0;
      const priceMultiplier = asset === pool.x_asset ? 10**(x_decimals-y_decimals) : 10**(y_decimals-x_decimals);
      const entry_price = this.position_id ? pool.stateVars[this.position_id].price : 0;
      try{
        const { res, delta } = pool.getLeveragedSellParams(this.inputAmount, asset, leverage, entry_price);
        console.log('updateFinalPrice res', res)
        this.final_price = res.final_price * priceMultiplier;
        this.avg_share_price = res.avg_share_price;
        this.tooMuch = false;
      }
      catch(e){
        console.log('getLeveragedSellParams failed', e)
        this.final_price = null;
        this.tooMuch = true;
      }
    },
    handleSubmit() {
      const pool = this.selectedPool;
      const address = pool.address;
      const {leverage, asset} = this.inputAssetInfo;
      const entry_price = this.position_id ? pool.stateVars[this.position_id].price : 0;
      const { res, delta } = pool.getLeveragedSellParams(this.inputAmount, asset, leverage, entry_price);
      console.log('handleSubmit res', res)
      const data = {
        L: leverage,
        asset,
        sell: 1,
        delta,
      };
      if (this.leverageType === 'position')
        data.position = this.position_id;
      const url = this.leverageType === 'position' 
        ? generateUri(address, data)
        : generateUri(address, data, this.inputAmount, this.inputAssetInfo.leveragedAsset);
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
      if (!this.inputAssetInfo) return;
    },
  }
};
</script>
