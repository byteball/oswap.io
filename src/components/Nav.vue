<template>
  <nav class="text-center mb-4">
    <div v-if="showWarning" class="btn-submit width-fit" style="height: auto">
      <a @click="hideWarning">
        <Icon class="position-absolute right-0 top-0 p-3 m-1" name="close" size="18" />
      </a>
      <div class="p-2">This project is in beta. Use at your own risk.</div>
    </div>
    <div class="position-relative">
      <div
        class="d-flex my-4 px-3 flex-wrap position-static-for-tablet position-absolute flex-justify-between width-full"
      >
        <div>
          <a
            v-text="config.network"
            @click="modalAboutOpen = true"
            class="btn-outline mr-2 hide-for-mob"
          />
          <a
            class="btn-outline"
            target="_blank"
            title="Go to OSWAP token website"
            :href="
              config.network === 'livenet'
                ? 'https://token.oswap.io/'
                : 'https://testnet-token.oswap.io/'
            "
          >
            OSWAP token
          </a>
        </div>

        <div v-if="invite" class="mb-4 hide-for-tablet">
          <a v-if="!address" @click="handleLogin" class="btn-outline">Log in</a>
          <a @click="modalAccountOpen = true" class="btn-outline" v-else>
            <span class="hide-sm hide-md mr-2">{{ address | shorten }}</span>
            <Avatar :address="address" size="18" />
          </a>
          <a
            class="btn-outline ml-2"
            @click="modalSelectUnitOpen = true"
            v-text="unit.short || unit.symbol"
          />
        </div>
        <div
          v-if="shownMobMenu"
          v-click-outside="hideMobMenu"
          class="btn-outline ml-auto pointer position-relative d-none inline-flex-for-tablet ml-2 flex-items-center"
          @click="shownMobMenu = false"
          style="background-color: #24292e !important"
        >
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 8L8 16M8 8L16 16" stroke="white" stroke-width="2" stroke-linecap="round" />
          </svg>

          <div v-if="shownMobMenu" class="position-absolute menu-wrap">
            <!-- Mob menu -->
            <a v-if="!address" @click="handleLogin" class="btn-outline mb-2">Log in</a>
            <a @click="modalAccountOpen = true" class="btn-outline mb-2" v-else>
              <span class="hide-sm mr-2">{{ address | shorten }}</span>
              <Avatar :address="address" size="18" />
            </a>
            <a
              class="btn-outline mb-2"
              @click="modalSelectUnitOpen = true"
              v-text="unit.short || unit.symbol"
            />
            <a
              v-text="config.network"
              @click="modalAboutOpen = true"
              class="btn-outline mr-2 d-none show-for-mob"
            />
          </div>
        </div>

        <div
          class="btn-outline pointer d-none inline-flex-for-tablet ml-2 flex-items-center"
          v-else-if="!shownMobMenu"
          @click="shownMobMenu = true"
        >
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12ZM5 15C6.65685 15 8 13.6569 8 12C8 10.3431 6.65685 9 5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15ZM12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12ZM19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11ZM22 12C22 13.6569 20.6569 15 19 15C17.3431 15 16 13.6569 16 12C16 10.3431 17.3431 9 19 9C20.6569 9 22 10.3431 22 12Z"
              fill="#586069"
            />
          </svg>
        </div>
      </div>

      <h1 class="pt-4 no-padding-for-tablet">
        <router-link :to="{ name: 'home' }" class="text-white" style="font-size: 64px">
          <img src="~/@/assets/logo.svg" class="mt-4 no-margin-for-tablet" height="64" />
        </router-link>
      </h1>
      <div class="container-sm px-3">
        <div id="nav" class="clearfix bg-gray-9 d-flex rounded-2">
          <router-link
            :to="{
              name: this.$route.params.poolAddress ? 'swap' : 'home',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query,
            }"
            class="d-block col-4 rounded-2"
          >
            Swap
          </router-link>
          <router-link
            :to="{
              name: this.$route.name === 'sell-leverage' ? this.$route.name : 'buy-leverage',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query,
            }"
            class="d-block col-4 rounded-2"
          >
            Leverage
          </router-link>
          <router-link
            :to="{
              name: ['mint1', 'mint2', 'burn'].includes(this.$route.name)
                ? this.$route.name
                : 'pools',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query,
            }"
            class="d-block col-4 rounded-2"
          >
            Pools
          </router-link>
        </div>
      </div>
      <ModalAccount :open="modalAccountOpen" @close="modalAccountOpen = false" />
      <ModalSelectUnit :open="modalSelectUnitOpen" @close="modalSelectUnitOpen = false" />
      <ModalAbout :open="modalAboutOpen" @close="modalAboutOpen = false" />
    </div>
  </nav>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';
import config from '@/helpers/config';

export default {
  data() {
    return {
      modalSelectUnitOpen: false,
      modalAccountOpen: false,
      modalAboutOpen: false,
      shownMobMenu: false,
      showWarning: !localStorage.getItem(`${LOCALSTORAGE_KEY}.warning`),
      config,
    };
  },
  computed: {
    address() {
      return this.auth.address;
    },
    invite() {
      return this.auth.invite;
    },
    unit() {
      return this.settings.assets.base;
    },
  },
  methods: {
    hideWarning() {
      localStorage.setItem(`${LOCALSTORAGE_KEY}.warning`, '1');
      this.showWarning = false;
    },
    hideMobMenu() {
      this.shownMobMenu = false;
    },
    handleLogin() {
      const url = `${this.invite}#login`;
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function () {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    },
  },
  directives: {
    ClickOutside,
  },
};
</script>