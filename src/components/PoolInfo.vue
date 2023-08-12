<template>
  <div v-if="pool">
    <div>
      <div class="mb-2">
        <div class="d-block">
          <label class="label-padding">Swap fee</label>
          <Tooltip
            style="display: inline-block"
            tooltip-description="Swapping fee, percentage of traded amount."
          />
          <span
            class="text-white ml-2"
            v-text="
              `${(pool.swapFee * 100).toLocaleString(undefined, { maximumFractionDigits: 18 })}%`
            "
          />
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
            <Tooltip
              style="display: inline-block"
              tooltip-description="Fee charged when removing liquidity from the pool."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.exit_fee * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Arb tax</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Additional fee that is charged as a percentage of arbitrageur profit. It is assumed that arbitrageurs buy from the pool in order to sell elsewhere and make a profit from the difference in prices."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.arb_profit_tax * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Leverage profit tax</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Percentage of profit charged from a leveraged position when it is closed (if the close price is higher than the open price)."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.leverage_profit_tax * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Leverage token tax</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Percentage of the redeemed amount charged when redeeming a leveraged token."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.leverage_token_tax * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Base interest rate</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Base interest rate charged from leveraged positions. If there are many leveraged positions, the rate can increase depending on utilization."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.base_interest_rate * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Utilization ratio</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="What share of the pool's capacity is used for borrowing by leverage traders."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(+(this.utilizationRatio * 100).toFixed(2)).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Actual interest rate</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Actual interest rate paid by leverage traders, it grows with utilization."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(+(this.actualInterestRate * 100).toFixed(2)).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Borrowed amounts</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Amounts borrowed by leverage traders from the pool to finance their leveraged positions."
            />
            <span class="text-white ml-2">
              <Amount :value="borrowedAmounts.x" :asset="pool.x_asset" />
              <Ticker :asset="pool.x_asset" /> +
              <Amount :value="borrowedAmounts.y" :asset="pool.y_asset" />
              <Ticker :asset="pool.y_asset" />
            </span>
          </div>
          <div class="d-block">
            <label class="label-padding">Return on capital from lending alone</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Earnings from providing capital to leverage traders alone."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(+(
                  this.borrowedAmounts.borrowed_to_assets *
                  this.actualInterestRate *
                  100
                ).toFixed(2)).toLocaleString(undefined, { maximumFractionDigits: 18 })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Token weights</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Relative weights of the two tokens in the pool."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.alpha * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}% / ${((1 - pool.info.alpha) * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}%`
              "
            />
          </div>
          <div class="d-block">
            <label class="label-padding">Pool leverage</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="A multiplier that makes the pool behave like it has more liquidity than it really has. The full multiplier is applied when the pool is balanced and it decreases as the pool goes out of balance."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${pool.info.pool_leverage.toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}`
              "
            />
          </div>
          <div class="d-block" v-if="pool.info.mid_price">
            <label class="label-padding">Mid-price</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="Mid-price for stablecoin pools."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(pool.info.mid_price * priceMultiplier).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}`
              "
            />
          </div>
          <div class="d-block" v-if="pool.info.mid_price">
            <label class="label-padding">Price deviation</label>
            <Tooltip
              style="display: inline-block"
              tooltip-description="This factor indicates how far the price is allowed to deviate from the mid-price."
            />
            <span
              class="text-white ml-2"
              v-text="
                `${(+pool.info.price_deviation).toLocaleString(undefined, {
                  maximumFractionDigits: 18
                })}`
              "
            />
          </div>
          <div class="d-block">
            <label>Price range</label>
            <span
              class="text-white ml-2"
              v-text="
                `${pool.p_min &&
                  (+(pool.p_min * priceMultiplier).toPrecision(6)).toLocaleString(undefined, {
                    maximumFractionDigits: 18
                  })} to ${(+(pool.p_max * priceMultiplier).toPrecision(
                  6
                )).toLocaleString(undefined, { maximumFractionDigits: 18 })}`
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
          <Ticker :asset="pool.y_asset" />
        </div>
        <div class="text-white">
          1 <Ticker :asset="pool.y_asset" /> ≈
          <Amount :value="pool.getPrice(pool.y_asset, this.settings)" :asset="pool.x_asset" />
          <Ticker :asset="pool.x_asset" />
        </div>
      </div>
      <label class="d-block">Pool size</label>
      <a :href="_explorerLink(pool.address)" target="_blank">
        <Amount :value="pool.balances.xn" :asset="pool.x_asset" />
        <Ticker :asset="pool.x_asset" /> +
        <Amount :value="pool.balances.yn" :asset="pool.y_asset" /> <Ticker :asset="pool.y_asset" />
        <span
          v-if="pool.hasLiquidity() && pool.marketcap"
          v-text="
            ` ≈ $${(+pool.marketcap.toFixed(2)).toLocaleString(undefined, {
              maximumFractionDigits: 18
            })}`
          "
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
    <div>
      <label class="d-block">APY</label>
      <div style="display: flex; align-items: center;">
        <div>
          <a :href="_statsLink(pool.address)" target="_blank" title="Go to stats website">
            {{ apy }}%
            <Icon name="external-link" class="ml-1" size="18" />
          </a>
        </div>

        <div v-if="farmingAPY" class="ml-2 text-white flex" style="font-size: 16px;">
          <span
            style="display: inline-block; margin-bottom: 4px;"
            class="tooltipped tooltipped-n tooltipped-no-delay ml-1"
            aria-label="Farming rewards from token.oswap.io. Click to go."
          >
            <a :href="config.tokenFrontendUrl + '/farming'" target="_blank">
              <span> +{{ farmingAPY }}% </span>

              <TooltipIcon style="margin-bottom: 1px;" />
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { generateUri, getBalance, TOKEN_REGISTRY_ADDRESS } from '@/helpers/_oswap';
import TooltipIcon from '@/components/TooltipIcon';
import config from '@/helpers/config';
import Tooltip from '@/components/Tooltip.vue';

export default {
  components: { Tooltip, TooltipIcon },
  props: ['pool'],
  data() {
    return {
      details: false,
      share: 0,
      config
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
        return (
          this.settings.apy7d[this.pool.address].apy?.toLocaleString(undefined, {
            maximumFractionDigits: 18
          }) || 0
        );
      return 0;
    },
    farmingAPY() {
      if (this.settings.farmingAPY && this.pool.address) {
        const poolInfo = this.settings.farmingAPY.find(p => p.address === this.pool.address);

        if (poolInfo && Number(poolInfo.apy)) {
          return Number(poolInfo.apy).toLocaleString(undefined, { maximumFractionDigits: 18 });
        }
      }

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
