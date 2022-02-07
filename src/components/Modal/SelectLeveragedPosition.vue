<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="m0 p-4">
      Positions
    </div>
    <div class="modal-body flex-auto mb-5">
      <a
        class="d-block py-2 px-4 highlight"
        @click="selectPosition(position_id)"
        v-for="(position, position_id) in positions"
        :key="position_id"
      >
        <div class="d-block">
          <label class="text-gray">Entry price</label>
          <span class="text-white ml-2" v-text="`${+position.price.toPrecision(6)}`" /> <Ticker :asset="asset" />
        </div>
        <div class="d-block">
          <label class="text-gray">Leveraged tokens</label>
          <Amount class="text-white ml-2" :asset="asset" :value="position.shares" />
        </div>
        <div class="d-block">
          <label class="text-gray">Opened</label>
          <span class="text-white ml-2" v-text="`${new Date(position.ts * 1000).toLocaleString()}`" />
        </div>
      </a>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open', 'positions', 'asset'],
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
    selectPosition(position_id) {
      this.$emit('position_id', position_id);
      this.$emit('close');
    },

  }
};
</script>
