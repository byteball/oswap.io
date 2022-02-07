<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="m0 p-4">
      Leverage type
    </div>
    <div class="modal-body flex-auto mb-5">
      <a
        class="d-block py-2 px-4 text-white highlight"
        @click="selectLeverageType(leverageType)"
        v-for="(desc, leverageType) in leverageTypes"
        :key="leverageType"
      >
        {{desc}}
      </a>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open', 'default'],
  data() {
    return {
      leverageTypes: {
        position: 'Leveraged position (non-fungible)', 
        tokens: 'Leveraged tokens (fungible)',
      }
    };
  },
  methods: {
    selectLeverageType(leverageType) {
      this.$emit('leverageType', leverageType, this.leverageTypes[leverageType]);
      this.$emit('close');
    },
  },
  mounted(){
    if (this.default)
      this.$emit('leverageType', this.default, this.leverageTypes[this.default]);
  }
};
</script>
