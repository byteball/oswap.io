<template>
  <div v-if="pool">
    <div>
      <div class="mb-2">
        <div class="d-block">
          <label class="label-padding">Swap fee</label>
          <div
            style="display: inline-block"
            class="tooltipped tooltipped-n tooltipped-no-delay"
            aria-label="Swapping fee, percentage of traded amount."
          >
            <TooltipIcon />
          </div>
          <span class="text-white ml-2" v-text="`${pool.swapFee * 100}%`" />
          <span v-if="!details"> ...</span>
          <a class="d-flex float-right" @click="details = !details">
            <span class="flex-auto text-gray" v-text="detailsText" />
            <Icon
              class="text-gray"
              :class="{ 'mt-1': details }"
              :name="details ? 'arrow-up' : 'arrow-down'"
            />
          </a>
        </div>
        <div v-if="details">
          <div class="d-block">
            <label class="label-padding">Exit fee</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Fee charged when removing liquidity from the pool."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.exit_fee * 100}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Arb tax</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Additional fee that is charged as a percentage of arbitrageur profit. It is assumed that arbitrageurs buy from the pool in order to sell elsewhere and make a profit from the difference in prices."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.arb_profit_tax * 100}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Leverage profit tax</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Percentage of profit charged from a leveraged position when it is closed (if the close price is higher than the open price)."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.leverage_profit_tax * 100}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Leverage token tax</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Percentage of the redeemed amount charged when redeeming a leveraged token."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.leverage_token_tax * 100}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Base interest rate</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Base interest rate charged from leveraged positions. If there are many leveraged positions, the rate can increase depending on utilization."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.base_interest_rate * 100}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Utilization ratio</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="What share of the pool's capacity is used for borrowing by leverage traders."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${(this.utilizationRatio * 100).toFixed(2)}%`" />
          </div>
          <div class="d-block">
            <label class="label-padding">Actual interest rate</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Actual interest rate paid by leverage traders, it grows with utilization."
            >
              <TooltipIcon />
            </div>
            <span
              class="text-white ml-2"
              v-text="`${(this.actualInterestRate * 100).toFixed(2)}%`"
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Borrowed amounts</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Amounts borrowed by leverage traders from the pool to finance their leveraged positions."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2">
              <Amount :value="borrowedAmounts.x" :asset="pool.x_asset" />
              <Ticker :asset="pool.x_asset" /> +
              <Amount :value="borrowedAmounts.y" :asset="pool.y_asset" />
              <Ticker :asset="pool.y_asset" />
            </span>
          </div>
          <div class="d-block">
            <label class="label-padding">Return on capital from lending alone</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Earnings from providing capital to leverage traders alone."
            >
              <TooltipIcon />
            </div>
            <span
              class="text-white ml-2"
              v-text="
                `${(
                  this.borrowedAmounts.borrowed_to_assets *
                  this.actualInterestRate *
                  100
                ).toFixed(2)}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Token weights</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Relative weights of the two tokens in the pool."
            >
              <TooltipIcon />
            </div>
            <span
              class="text-white ml-2"
              v-text="`${pool.info.alpha * 100}% / ${(1 - pool.info.alpha) * 100}%`"
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Pool leverage</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="A multiplier that makes the pool behave like it has more liquidity than it really has. The full multiplier is applied when the pool is balanced and it decreases as the pool goes out of balance."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.pool_leverage}`" />
          </div>
          <div class="d-block" v-if="pool.info.mid_price">
            <label class="label-padding">Mid-price</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="Mid-price for stablecoin pools."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.mid_price * priceMultiplier}`" />
          </div>
          <div class="d-block" v-if="pool.info.mid_price">
            <label class="label-padding">Price deviation</label>
            <div
              style="display: inline-block"
              class="tooltipped tooltipped-n tooltipped-no-delay"
              aria-label="This factor indicates how far the price is allowed to deviate from the mid-price."
            >
              <TooltipIcon />
            </div>
            <span class="text-white ml-2" v-text="`${pool.info.price_deviation}`" />
          </div>
          <div class="d-block">
            <label>Price range</label>
            <span
              class="text-white ml-2"
              v-text="
                `${pool.p_min && (pool.p_min * priceMultiplier).toPrecision(6)} to ${(
                  pool.p_max * priceMultiplier
                ).toPrecision(6)}`
              "
            />
          </div>
          <div class="d-block">
            <label>LP shares symbol</label>
            <span v-if="sharesSymbol" class="text-white ml-2" v-text="sharesSymbol" />
            <a v-else :href="registerSymbolHref" class="text-white ml-2"
              >Register symbol {{ proposedSharesSymbol }}</a
            >
          </div>
          <div class="d-block">
            <a
              :href="_governanceLink(pool.address)"
              target="_blank"
              title="Go to governance website"
            >
              Change these parameters in governance
              <Icon name="external-link" class="ml-1" size="18" />
            </a>
          </div>
        </div>
      </div>
      <!--div>
        <div class="d-inline-block">
          <label class="d-block">Swap fee</label>
          <span class="text-white" v-text="`${pool.swapFee * 100}%`" />
        </div>
        <div class="d-inline-block ml-4">
          <label class="d-block">Exit fee</label>
          <span class="text-white" v-text="`${pool.info.exit_fee * 100}%`" />
        </div>
        <div class="d-inline-block ml-4">
          <label class="d-block">Arb tax</label>
          <span class="text-white" v-text="`${pool.info.arb_profit_tax * 100}%`" />
        </div>
      </div>
      <div>
        <div class="d-inline-block">
          <label class="d-block">Leverage profit tax</label>
          <span class="text-white" v-text="`${pool.info.leverage_profit_tax * 100}%`" />
        </div>
        <div class="d-inline-block ml-4">
          <label class="d-block">Leverage token tax</label>
          <span class="text-white" v-text="`${pool.info.leverage_token_tax * 100}%`" />
        </div>
        <div class="d-inline-block ml-4">
          <label class="d-block">Base interest rate</label>
          <span class="text-white" v-text="`${pool.info.base_interest_rate * 100}%`" />
        </div>
      </div>
      <div>
        <div class="d-inline-block">
          <label class="d-block">Token weights</label>
          <span class="text-white" v-text="`${pool.info.alpha * 100}% / ${(1 - pool.info.alpha) * 100}%`" />
        </div>
        <div class="d-inline-block ml-4">
          <label class="d-block">Pool leverage</label>
          <span class="text-white" v-text="`${pool.info.pool_leverage}`" />
        </div>
      </div-->
      <div v-if="pool.hasLiquidity()">
        <label class="d-block">Prices</label>
        <div class="text-white">
          1 <Ticker :asset="pool.x_asset" /> ≈
          <Amount :value="pool.getPrice(pool.x_asset, this.settings)" :asset="pool.y_asset" />
          &nbsp;<Ticker :asset="pool.y_asset" />
        </div>
        <div class="text-white">
          1 <Ticker :asset="pool.y_asset" /> ≈
          <Amount :value="pool.getPrice(pool.y_asset, this.settings)" :asset="pool.x_asset" />
          &nbsp;<Ticker :asset="pool.x_asset" />
        </div>
      </div>
      <label class="d-block">Pool size</label>
      <a :href="_explorerLink(pool.address)" target="_blank">
        <Amount :value="pool.balances.xn" :asset="pool.x_asset" />
        <Ticker :asset="pool.x_asset" /> +
        <Amount :value="pool.balances.yn" :asset="pool.y_asset" /> <Ticker :asset="pool.y_asset" />
        <span
          v-if="pool.hasLiquidity() && pool.marketcap"
          v-text="` ≈ $${pool.marketcap.toFixed(2)}`"
        />
        <Icon name="external-link" class="ml-1" size="18" />
      </a>
    </div>
    <div v-if="share">
      <label class="d-block">Your pool share</label>
      <span class="text-white">
        <Pie v-if="share > 1" class="mr-2" :percent="share" />
        {{ share }}%
      </span>
    </div>
    <div v-if="apy">
      <label class="d-block">APY</label>
      <a :href="_statsLink(pool.address)" target="_blank" title="Go to stats website">
        {{ apy }}%
        <Icon name="external-link" class="ml-1" size="18" />
      </a>
    </div>
  </div>
</template>

<script>
import { generateUri, getBalance, TOKEN_REGISTRY_ADDRESS } from '@/helpers/_oswap';
import TooltipIcon from '@/components/TooltipIcon';

export default {
  components: { TooltipIcon },
  props: ['pool'],
  data() {
    return {
      details: false,
      share: 0
    };
  },
  created() {
    const balance = getBalance(this.auth.balances, this.pool.asset);
    this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
  },
  computed: {
    priceMultiplier() {
      const x_asset = this.settings.assets[this.pool.x_asset];
      const y_asset = this.settings.assets[this.pool.y_asset];
      const x_decimals = x_asset ? x_asset.decimals : 0;
      const y_decimals = y_asset ? y_asset.decimals : 0;
      return 10 ** (x_decimals - y_decimals);
    },
    detailsText() {
      return this.details ? 'hide details' : 'show all details';
    },
    utilizationRatio() {
      return this.pool.getCurrentUtilizationRatio();
    },
    actualInterestRate() {
      return this.pool.info.base_interest_rate / (1 - this.utilizationRatio);
    },
    borrowedAmounts() {
      return this.pool.getBorrowedAmounts();
    },
    apy() {
      if (this.settings.apy7d && this.settings.apy7d[this.pool.address])
        return this.settings.apy7d[this.pool.address].apy;
      return null;
    },
    sharesSymbol() {
      return this.settings.assetToSymbol[this.pool.asset];
    },
    poolName() {
      const x_asset = this.settings.assets[this.pool.x_asset];
      const y_asset = this.settings.assets[this.pool.y_asset];
      const x_symbol = x_asset.symbol || this.pool.x_asset.slice(0, 4);
      const y_symbol = y_asset.symbol || this.pool.y_asset.slice(0, 4);
      return `${x_symbol}-${y_symbol}`;
    },
    proposedSharesSymbol() {
      const symbol = `O-${this.poolName}`;
      if (!this.settings.symbolToAsset[symbol]) return symbol;
      for (let i = 2; true; i++) {
        const symboln = `${symbol}-${i}`;
        if (!this.settings.symbolToAsset[symboln]) return symboln;
      }
    },
    registerSymbolHref() {
      return generateUri(
        TOKEN_REGISTRY_ADDRESS,
        {
          asset: this.pool.asset,
          symbol: this.proposedSharesSymbol,
          decimals: 0,
          description: `Oswap v2 LP shares for ${this.poolName}`
        },
        0.1e9
      );
    }
  },
  watch: {
    async pool(value, oldValue) {
      if (value !== oldValue) {
        const balance = getBalance(this.auth.balances, this.pool.asset);
        this.share = parseFloat(((100 / this.pool.supply) * balance).toFixed(3));
      }
    }
  }
};
</script>
