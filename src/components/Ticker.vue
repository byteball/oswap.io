<template>
  <div style="display: inline-block">
    <AssetIcon v-if="showIcon" :symbol="assetX" size="small" />
    <AssetIcon v-if="assetY && showIcon" :symbol="assetY" size="small" />
    <div style="display: inline-block; margin-right: 4px">{{ ticker }}</div>
  </div>
</template>

<script>
import { shorten } from '@/helpers/utils';
import AssetIcon from '@/components/AssetIcon';

export default {
  components: { AssetIcon },
  props: {
    asset: String,
    showIcon: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      assetX: '',
      assetY: ''
    };
  },
  watch: {
    asset: function() {
      this.setAssets();
    }
  },
  computed: {
    ticker: function() {
      const assets = this.settings.assets;
      let ticker = '';
      this.asset.split('_').forEach((asset, i) => {
        ticker += assets[asset] && assets[asset].symbol ? assets[asset].symbol : shorten(asset);
        if (this.asset.split('_').length === 2 && i === 0) ticker += '-';
      });
      return ticker;
    }
  },
  methods: {
    setAssets() {
      const tickers = this.ticker.split('-');

      this.assetX = tickers[0];

      if (tickers.length === 2) {
        this.assetY = tickers[1];
      }
    }
  },
  created() {
    this.setAssets();
  }
};
</script>
