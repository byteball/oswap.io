<template>
  <span v-text="str" />
</template>

<script>
import { toString } from '@/helpers/_oswap';

export default {
  props: ['value', 'asset'],
  computed: {
    str() {
      const asset = this.settings.assets[this.asset];
      const decimals = asset ? asset.decimals : 0;
      const multiplier = 10 ** decimals;

      const str = parseFloat((this.value / multiplier).toFixed(decimals));

      return isNaN(str) || str < 0 ? '' : Number(str).toLocaleString(undefined, {maximumFractionDigits: 18});
    }
  }
};
</script>
