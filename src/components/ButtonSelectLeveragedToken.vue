<template>
  <span>
    <a class="btn-mktg" @click="modalOpen = true">
      <span v-if="input"><Ticker :asset="input.asset" />/<Ticker :asset="input.opposite_asset" /> {{input.leverage}}x</span>
      <template v-else>Select<span class="hide-sm"> leveraged token</span></template>
    </a>
    <ModalSelectLeveragedToken
      :pool="pool"
      :open="modalOpen"
      @close="modalOpen = false"
      @asset="input = $event"
    />
  </span>
</template>

<script>
export default {
  props: ['value', 'default', 'pool'],
  data() {
    return {
      input: null,
      modalOpen: false
    };
  },
  watch: {
    input(value) {
      this.$emit('input', value);
    },
    value(value) {
      this.input = value;
    }
  },
  mounted() {
    if (this.default) this.input = this.default;
  }
};
</script>
