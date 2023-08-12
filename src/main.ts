import Vue from 'vue';
import VueUi from '@vue/ui';
import VueI18n from 'vue-i18n';
import VueGtag from 'vue-gtag';
import { upperFirst, camelCase } from 'lodash';
import makeBlockie from 'ethereum-blockies-base64';
import FloatingVue from 'floating-vue';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import config from '@/helpers/config';
import { shorten } from '@/helpers/utils';
import messages from '@/helpers/messages.json';
import numberFormats from '@/helpers/number.json';
import '@/style.scss';

import 'floating-vue/dist/style.css';

FloatingVue.options.themes.tooltip.triggers = ['click', 'hover', 'focus', 'touch'];

Vue.use(VueUi);
Vue.use(VueI18n);
Vue.use(FloatingVue);

const i18n = new VueI18n({ locale: 'en', messages, numberFormats });

Vue.use(
  VueGtag,
  {
    config: { id: config.gtag_id }
  },
  router
);

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.filter('blockie', value => makeBlockie(value));
Vue.filter('shorten', value => shorten(value));
Vue.mixin(mixins);

Vue.config.productionTip = false;

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
