<template>
  <span v-if="balance">
    (max
    <a class="color-gray-6" @click="select"> <Amount :asset="decimals_asset || asset" :value="balance" /> </a>)
  </span>
  <span v-else-if="!balance && this.asset === 'base'">
    (get GBYTEs at
    <a :href="getLinkToGetMeIn" target="_blank"
      >GetMeIn<Icon name="external-link" class="ml-1" size="18"/></a
    >)
  </span>
</template>



<script>
import { getBalance } from '@/helpers/_oswap';

export default {
  props: ['asset', 'decimals_asset'],
  computed: {
    balance() {
      const { balances } = this.auth;
      return this.asset ? getBalance(balances, this.asset) : 0;
    },
    getLinkToGetMeIn() {
      const { address } = this.auth;
      let link = 'https://getmein.ooo/';

      if (address) {
        link += `?recipient=${address}`;
      }

      return link;
    }
  },
  methods: {
    select() {
      this.$emit('select', this.balance);
    }
  }
};
</script>
