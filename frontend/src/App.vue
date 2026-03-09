<script setup>
import SensorsTable from './components/SensorsTable.vue';
import { themeColors } from './utils';

const { colorPrimary, colorLink, colorLinkHover, colorLinkActive } = themeColors;
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary,
        colorLink,
        colorLinkHover,
        colorLinkActive,
      },
    }"
  >
    <SensorsTable />
  </a-config-provider>
</template>