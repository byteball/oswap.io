<template>
  <span>
    <a :class="customClass || 'btn-mktg'" @click="modalOpen = true">
      <span v-if="input">{{input}}</span>
      <template v-else>Select<span class="hide-sm"> leverage</span></template>
    </a>
    <ModalSelectLeverage :open="modalOpen" @close="modalOpen = false" @leverage="input = $event" />
  </span>
</template>

<script>
export default {
  props: ['value', 'default', 'customClass'],
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
