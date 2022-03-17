import store from '@/store';
import { mapState } from 'vuex';
import { explorerLink, statsLink } from '@/helpers/utils';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  computed: {
    ...mapState(modules)
  },
  methods: {
    _explorerLink(str: string): string {
      return explorerLink(str);
    },
    _statsLink(address: string): string {
      return statsLink(address);
    }
  }
};
