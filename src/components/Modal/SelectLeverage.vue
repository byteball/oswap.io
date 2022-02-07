<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="m0 p-4">
      Leverage
    </div>
    <div class="modal-body flex-auto mb-5">
      <a
        class="d-block py-2 px-4 text-white highlight"
        @click="selectLeverage(leverage)"
        v-for="leverage in leverages"
        :key="leverage"
      >
        {{leverage}}
      </a>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open'],
  data() {
    return {
      leverages: [2, 5, 10, 20, 50, 100]
    };
  },
  methods: {
    selectLeverage(leverage) {
      this.$emit('leverage', leverage);
      this.$emit('close');
    },
  }
};
</script>
