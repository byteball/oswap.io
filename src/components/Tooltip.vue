<template>
  <VTooltip>
    <div style="font-size: 20px" class="d-block">
      <TooltipIcon />
    </div>
    <template #popper>
      <div>
        {{ tooltipDescription }}
      </div>
    </template>
  </VTooltip>
</template>

<script>
import TooltipIcon from '@/components/TooltipIcon.vue';

export default {
  components: { TooltipIcon },
  props: ['tooltipDescription']
};
</script>

<style>
.v-popper--theme-tooltip {
  font: 16px 'Calibre-Medium', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: subpixel-antialiased;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: normal;
  max-width: 250px;
}

.v-popper--theme-tooltip .v-popper__inner {
  background: #1c2024;
}

.v-popper--theme-tooltip .v-popper__arrow-inner {
  visibility: visible;
  border-color: #1c2024;
}

.v-popper--theme-tooltip .v-popper__arrow-outer {
  border-color: #1c2024;
}
</style>
