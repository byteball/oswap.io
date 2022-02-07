<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <PoolNav :default="2" />
      <Box class="d-flex">
        <div class="flex-auto">
          <label for="inputAmount" class="d-block">
            Pool tokens
            <LabelBalance :asset="asset" @select="selectAmount" />
          </label>
          <InputAmount id="inputAmount" v-model="inputAmount" />
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectPool :default="poolAddress" v-model="selectedPool" />
        </div>
      </Box>
      <Box
        v-if="pool && pool.Lambda > 1"
        class="d-flex"
      >
        <div class="flex-auto">
          <label class="d-block">
            Preferred token (for asymmetric removal)
          </label>
        </div>
        <div class="text-right mt-4 ml-4">
          <ButtonSelectToken
            :values="[pool.x_asset, pool.y_asset]"
            v-model="preferredAsset"
          />
        </div>
      </Box>
      <Box>
        <label for="outputAmounts" class="d-block">Output</label>
        <input
          readonly
          id="outputAmounts"
          type="text"
          autocomplete="off"
          class="form-control input-amount border-0 p-0"
          :style="'font-size:' + fontSize + 'px'"
          :value="outputAmounts"
        />
      </Box>
      <Box v-if="tooMuch">
        <p class="m-0">
          The remaining liquidity would be too small, try a smaller withdrawal.
        </p>
      </Box>
      <div class="text-center">
        <button
          class="btn-submit px-6 rounded-2 mb-3"
          type="submit"
          :disabled="!selectedPool || !inputAmount || tooMuch"
        >
          Remove liquidity
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { getInfo, toString, generateUri } from '@/helpers/_oswap';
import { shorten } from '@/helpers/utils';
import Pool from '@/helpers/_oswap/pool';

export default {
  data() {
    return {
      inputAmount: 0,
      selectedPool: null,
      asset: null,
      supply: 0,
      poolAddress: this.$route.params.poolAddress,
      x_asset: null,
      y_asset: null,
      balances: {x:0, y:0, xn:0, yn:0},
      pool: null,
      preferredAsset: null,
      tooMuch: false,
    };
  },
  watch: {
    async selectedPool(value, oldValue) {
      if (value && value !== oldValue) {
        this.reset();
        const {info} = await getInfo(value);
        this.asset = info.lp_shares.asset;
        this.supply = info.lp_shares.issued;
        this.x_asset = info.x_asset;
        this.y_asset = info.y_asset;
        this.balances = info.balances;
        this.pool = new Pool(this.selectedPool, [this.x_asset, this.y_asset]);
        await this.pool.init();
      }
    }
  },
  computed: {
    fontSize() {
      // console.log(this.outputAmounts.length);
      return 28 * (34 / this.outputAmounts.length);
    },
    outputAmounts() {
      if (
        !this.selectedPool ||
        !this.inputAmount ||
        isNaN(this.inputAmount) ||
        !this.balances.xn ||
        !this.balances.yn
      )
        return '';
      const { assets } = this.settings;
      const assetXStr = assets[this.x_asset].symbol || shorten(this.x_asset);
      const assetYStr = assets[this.y_asset].symbol || shorten(this.y_asset);
      try{
        const {xn_amount, yn_amount} = this.pool.getRedemptionAmounts(this.inputAmount, this.preferredAsset);
        const redeemed_x = toString(xn_amount, assets[this.x_asset].decimals);
        const redeemed_y = toString(yn_amount, assets[this.y_asset].decimals);
        this.tooMuch = false;
        return `${redeemed_x} ${assetXStr} + ${redeemed_y} ${assetYStr}`;
      }
      catch(e){
        console.log('getRedemptionAmounts failed', e)
        this.tooMuch = true;
        return '';
      }
    },
  },
  methods: {
    selectAmount(amount) {
      this.inputAmount = amount;
    },
    reset() {
      this.asset = null;
      this.supply = 0;
      this.x_asset = null;
      this.y_asset = null;
      this.balances = {x:0, y:0, xn:0, yn:0};
    },
    handleSubmit() {
      const data = this.preferredAsset ? {preferred_asset: this.preferredAsset} : null;
      const url = generateUri(this.selectedPool, data, this.inputAmount, this.asset);
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
