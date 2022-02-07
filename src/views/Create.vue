<template>
  <form @submit.prevent="handleSubmit">
    <div class="container-sm px-3">
      <Box>
        <label for="assetOrSymbolA" class="d-block">Token A</label>
        <input
          id="assetOrSymbolA"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="Symbol or base64 asset ID"
          v-model="assetOrSymbolA"
        />
        <div v-if="symbolA" class="mt-2">
          <label>Symbol</label>
          <p v-text="symbolA" class="text-white" />
          <label>Asset</label>
          <p v-text="assetA" class="text-white" />
          <label>Decimals</label>
          <p v-text="decimalsA" class="text-white" />
        </div>
      </Box>
      <Box>
        <label for="assetOrSymbolB" class="d-block">Token B</label>
        <input
          id="assetOrSymbolB"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="Symbol or base64 asset ID"
          v-model="assetOrSymbolB"
        />
        <div v-if="symbolB" class="mt-2">
          <label>Symbol</label>
          <p v-text="symbolB" class="text-white" />
          <label>Asset</label>
          <p v-text="assetB" class="text-white" />
          <label>Decimals</label>
          <p v-text="decimalsB" class="text-white" />
        </div>
      </Box>
      <Box>
        <label for="swapFee" class="d-block">Swap fee (%)</label>
        <input
          id="swapFee"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="swapFee"
          type="number"
          step="0.0001"
          min="0.0001"
          max="10"
        />
      </Box>
      <Box>
        <label for="exitFee" class="d-block">Exit fee (%)</label>
        <input
          id="exitFee"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="exitFee"
          type="number"
          step="0.01"
          min="0"
          max="90"
        />
      </Box>
      <Box>
        <label for="arbProfitTax" class="d-block">Arbitrageur profit tax (%)</label>
        <input
          id="arbProfitTax"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="arbProfitTax"
          type="number"
          step="0.1"
          min="0"
          max="200"
        />
      </Box>
      <Box>
        <label for="leverageProfitTax" class="d-block">Tax on profit from leveraged positions (%)</label>
        <input
          id="leverageProfitTax"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="leverageProfitTax"
          type="number"
          step="0.1"
          min="0"
          max="90"
        />
      </Box>
      <Box>
        <label for="leverageTokenTax" class="d-block">Tax on selling leveraged tokens (%)</label>
        <input
          id="leverageTokenTax"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="leverageTokenTax"
          type="number"
          step="0.1"
          min="0"
          max="90"
        />
      </Box>
      <Box>
        <label for="baseInterestRate" class="d-block">Base interest rate on borrowed funds used for leverage (%)</label>
        <input
          id="baseInterestRate"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="baseInterestRate"
          type="number"
          step="0.1"
          min="0"
          max="200"
        />
      </Box>
      <Box>
        <label for="midPrice" class="d-block">Mid-price for stable pairs</label>
        <input
          id="midPrice"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="midPrice"
          type="number"
          min="0"
        />
      </Box>
      <Box>
        <label for="priceDeviation" class="d-block">Price deviation for stable pairs</label>
        <input
          id="priceDeviation"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="priceDeviation"
          type="number"
          min="0"
        />
      </Box>
      <Box>
        <label for="poolLeverage" class="d-block">Pool leverage</label>
        <input
          id="poolLeverage"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="poolLeverage"
          type="number"
          min="1"
          max="100"
          step="0.1"
        />
      </Box>
      <Box>
        <label for="alpha" class="d-block">Weight of the first token</label>
        <input
          id="alpha"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="alpha"
          type="number"
          min="0.05"
          max="0.95"
          step="0.01"
        />
      </Box>
      <Box>
        <label for="periodLength" class="d-block">Period to track min and max prices for one-sided liquidity adds/removals</label>
        <input
          id="periodLength"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="periodLength"
          type="number"
          min="0"
          max="86400"
          step="1"
        />
      </Box>
      <Box>
        <label for="shares_bonding_curve" class="d-block">Bonding curve for shares (the default is linear)</label>
        <input
          id="shares_bonding_curve"
          class="form-control input-amount border-0 p-0"
          autocomplete="off"
          placeholder="0.0000"
          v-model="shares_bonding_curve"
          type="text"
        />
      </Box>
      <div class="text-center mb-4">
        <button class="btn-submit px-6 rounded-2 mb-3" type="submit" :disabled="!assetA || !assetB || +poolLeverage === 1/alpha || +poolLeverage === 1/(1-alpha)">
          Create a pool
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { b64UriDec } from '@/helpers/utils';
import { generateUri, FACTORY_ADDRESS } from '@/helpers/_oswap';

const linear_bonding_curve = 'IXBHF6T4IKMYAFGRM54F5FVMXGKCTFNT';

export default {
  data() {
    return {
      assetOrSymbolA: 'GBYTE',
      assetOrSymbolB: '',
      assetA: 'base',
      assetB: '',
      swapFee: '0.1',
      exitFee: '1.0',
      arbProfitTax: '90.0',
      leverageProfitTax: '25.0',
      leverageTokenTax: '10.0',
      baseInterestRate: '10.0',
      midPrice: '0',
      priceDeviation: '0',
      poolLeverage: 1,
      alpha: 0.5,
      periodLength: '3600',
      linear_bonding_curve: linear_bonding_curve,
      shares_bonding_curve: linear_bonding_curve,
      symbolA: 'GBYTE',
      symbolB: false,
      decimalsA: 9,
      decimalsB: 0
    };
  },
  watch: {
    assetOrSymbolA(value, oldValue) {
      if (value !== oldValue) {
        this.assetA = false;
        this.symbolA = false;
        this.decimalsA = 0;
        if (value.length === 44){
          this.assetA = value;
          if (this.assetToSymbol[value]) {
            this.symbolA = this.assetToSymbol[value];
            this.decimalsA = this.decimals[value] || 0;
          }
        }
        else if (this.symbolToAsset[value]) {
          const asset = this.symbolToAsset[value];
          this.assetA = asset;
          this.symbolA = value;
          this.decimalsA = this.decimals[asset] || 0;
        }
      }
    },
    assetOrSymbolB(value, oldValue) {
      if (value !== oldValue) {
        this.assetB = false;
        this.symbolB = false;
        this.decimalsB = 0;
        if (value.length === 44){
          this.assetB = value;
          if (this.assetToSymbol[value]) {
            this.symbolB = this.assetToSymbol[value];
            this.decimalsB = this.decimals[value] || 0;
          }
        }
        else if (this.symbolToAsset[value]) {
          const asset = this.symbolToAsset[value];
          this.assetB = asset;
          this.symbolB = value;
          this.decimalsB = this.decimals[asset] || 0;
        }
      }
    }
  },
  computed: {
    assetToSymbol() {
      return this.settings.assetToSymbol;
    },
    symbolToAsset() {
      return this.settings.symbolToAsset;
    },
    decimals() {
      return this.settings.decimals;
    }
  },
  created() {
    const assetB = this.$route.params[0] || this.$route.params.pathMatch || '';
    if (assetB) this.assetB = b64UriDec(assetB);
  },
  methods: {
    handleSubmit() {
      const data = {
        x_asset: this.assetA,
        y_asset: this.assetB,
        swap_fee: this.swapFee/100,
        exit_fee: this.exitFee/100,
        arb_profit_tax: this.arbProfitTax/100,
        leverage_profit_tax: this.leverageProfitTax/100,
        leverage_token_tax: this.leverageTokenTax/100,
        base_interest_rate: this.baseInterestRate/100,
        ...(+this.midPrice && {mid_price: +this.midPrice}),
        ...(+this.priceDeviation && {price_deviation: +this.priceDeviation}),
        pool_leverage: +this.poolLeverage,
        alpha: +this.alpha,
        period_length: +this.periodLength,
        ...(this.shares_bonding_curve && this.shares_bonding_curve !== linear_bonding_curve && {shares_bonding_curve: this.shares_bonding_curve}),
      };
      const url = generateUri(FACTORY_ADDRESS, data);
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
