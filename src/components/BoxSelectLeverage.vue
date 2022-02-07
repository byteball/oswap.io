<template>
  <Box>
    <label class="d-block">Leverage</label>
    <ButtonSelectLeverage customClass="h2 d-inline-block" :default="leverage" v-model="id" />
    <a
      v-if="needAsset"
      class="btn-submit px-6 rounded-2 mb-3 d-inline-block float-right"
      style="width: auto"
      :href="createTokenUri"
    >
      Create token
    </a>
  </Box>
</template>

<script>
import { generateUri } from '@/helpers/_oswap';

export default {
  props: ['leverage', 'sign', 'leverageType', 'pool'],
  data() {
    return {
      id: false,
    };
  },
  computed: {
    needAsset(){
      if (!this.sign || !this.id)
        return false;
      const signedLeverage = this.sign > 0 ? +this.id : -this.id;
      return this.leverageType === 'tokens' && !this.pool.stateVars['leveraged_asset' + signedLeverage];
    },
    createTokenUri(){
      const data = {
        define_leverage: 1,
        leverage: this.sign * this.id,
      };
      return generateUri(this.pool.address, data);
    },
  },
  watch: {
    async id(value, oldValue) {
      if (value !== oldValue) {
        this.$emit('input', value);
      }
    }
  },
  methods: {
    createToken(){

    }
  }
};
</script>
