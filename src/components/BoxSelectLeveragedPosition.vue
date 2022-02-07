<template>
  <Box>
    <span v-if="number_of_positions">
      <label class="d-block">Leveraged position</label>
      <span v-if="input">
        <div class="d-block">
          <label>Entry price</label>
          <span class="text-white ml-2" v-text="`${+positions[input].price.toPrecision(6)}`" /> <Ticker class="text-white" :asset="asset" />
        </div>
        <div class="d-block">
          <label>Leveraged tokens</label>
          <Amount class="text-white ml-2" :asset="asset" :value="positions[input].shares" />
        </div>
        <div class="d-block">
          <label>Opened</label>
          <span class="text-white ml-2" v-text="`${new Date(positions[input].ts * 1000).toLocaleString()}`" />
        </div>
      </span>
      <a class="btn-mktg mt-2" v-if="!input || number_of_positions > 1" @click="modalOpen = true">Select <span v-if="input">another</span> leveraged position ({{number_of_positions}} total)</a>
    </span>
    <span v-else>
      No open positions
    </span>
    <ModalSelectLeveragedPosition
      :positions="positions"
      :asset="asset"
      :open="modalOpen"
      @close="modalOpen = false"
      @position_id="input = $event"
    />
  </Box>
</template>

<script>
export default {
  props: ['value', 'default', 'positions', 'asset'],
  data() {
    return {
      input: null,
      modalOpen: false
    };
  },
  computed: {
    number_of_positions(){
      return this.positions ? Object.keys(this.positions).length : 0;
    },
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
