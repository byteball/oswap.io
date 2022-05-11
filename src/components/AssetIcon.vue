<script>
import plug from '@/assets/asset-plug.svg';
import config from '@/helpers/config';

export default {
  props: {
    symbol: String,
    size: String
  },
  data() {
    return {
      formattedSymbol: '',
      srcLink: '',
      config
    };
  },
  watch: {
    symbol() {
      this.setIcon();
    }
  },
  methods: {
    setAltImg(e) {
      if (e.target.src !== plug) {
        e.target.src = plug;
      }
    },
    setIcon() {
      const icons = this.settings.assetIcons;
      const cryptoIconsLink = 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.17.2/svg/color';

      this.formattedSymbol = this.symbol.replace(/[0-9]/g, '');

      if (icons.includes(this.symbol.toUpperCase())) {
        this.srcLink = `${this.config.assetIconCdnUrl}/${this.symbol.toUpperCase()}-INV.svg`;
        return;
      }

      this.srcLink = `${cryptoIconsLink}/${this.formattedSymbol.toLowerCase()}.svg`;
    }
  },
  created() {
    this.setIcon();
  }
};
</script>

<template>
  <img
    :src="srcLink"
    :key="formattedSymbol"
    :alt="formattedSymbol"
    class="icon-small"
    @error="setAltImg"
  />
</template>

<style scoped>
.icon-small {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-bottom: -3px;
  margin-right: 4px;
}
.icon svg {
  height: auto;
  width: auto;
  display: inline-block;
}

.icon svg g .white {
  fill: #fff !important;
  stroke: #fff !important;
}
</style>
