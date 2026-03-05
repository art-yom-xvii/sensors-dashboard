<script setup>
import SensorsTable from './components/SensorsTable.vue';
</script>

<template>
  <SensorsTable :data="sensors" :loading="loading" />
</template>