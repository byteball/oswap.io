<template>
  <Box>
    <label class="d-block">Leverage type</label>
    <ButtonSelectLeverageType customClass="h2 d-block" :default="leverageType" v-model="id" />
  </Box>
</template>

<script>
export default {
  props: ['leverageType'],
  data() {
    return {
      id: false,
    };
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        this.$emit('input', value);
      }
    }
  }
};
</script>
