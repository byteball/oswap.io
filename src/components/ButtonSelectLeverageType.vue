<template>
  <span>
    <a :class="customClass || 'btn-mktg'" @click="modalOpen = true">
      <span v-if="input">{{desc}}</span>
      <template v-else>Select<span class="hide-sm"> leverage type</span></template>
    </a>
    <ModalSelectLeverageType :open="modalOpen" :default="initial" @close="modalOpen = false" @leverageType="onChosen" />
  </span>
</template>

<script>
export default {
  props: ['value', 'default', 'customClass'],
  data() {
    return {
      input: null,
      desc: null,
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
  methods: {
	  onChosen(leverageType, desc){
      this.input = leverageType;
      this.desc = desc;
    },
  },
  computed: {
    initial(){
      return this.default;
    },
  },
  mounted() {
    if (this.default) this.input = this.default;
  }
};
</script>
