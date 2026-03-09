<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSensorsData } from '../composables/useSensorsData';
import { useColumnManagement } from '../composables/useColumnManagement';
import { useSensorFiltering } from '../composables/useSensorFiltering';
import type { DisplaySensor } from '../types';
import MobileMenu from './MobileMenu.vue';
import SensorsTableNavbar from './SensorsTableNavbar.vue';

const { sensors, loading, error, fetchSensors, uniqueSensorTypes } = useSensorsData();

const {
  filteredColumnKeys,
  visibleColumns,
  checkBoxColumnsOptions,
  scrollX,
  metricKeys,
  setVisibleColumns,
  loadFilterStateFromLocalStorage,
  clearFilters,
  handleResizeColumn,
} = useColumnManagement(sensors);

const { searchQuery, selectedType, sensorTypeOptions, filteredSensors } = useSensorFiltering(
  sensors,
  uniqueSensorTypes
);

const rowHighlightEnabled = ref(true);
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => (mobileMenuOpen.value = !mobileMenuOpen.value);

const getRowClassName = (sensor: DisplaySensor) => {
  if (!rowHighlightEnabled.value) return '';
  const sensorMetrics = sensor.metrics;
  const hasSensorMetrics = Object.values(sensorMetrics).some((value) => value != null);
  if (!hasSensorMetrics) {
    // Will help to identify if the sensor has no metrics (possibly sensor is not working?)
    return 'bg-red-100/70';
  }
  if (sensor.isUnknownName) {
    // Will help to identify if the sensor has a missing name
    return 'bg-yellow-50/70';
  }
  else {
    return '';
  }
};

onMounted(async () => {
  try {
    await fetchSensors();
    setVisibleColumns(metricKeys.value);
    loadFilterStateFromLocalStorage();
  } catch (error) {
    console.error('Error fetching sensors:', error);
  }
});
</script>

<template>
  <div v-if="error">
    <div class="flex items-center justify-center h-screen">
      <div class="text-red-500 text-2xl font-bold">{{ error }}</div>
    </div>
  </div>
  <div v-else>
    <!-- NAVBAR -->
    <SensorsTableNavbar
      v-model:search-query="searchQuery"
      v-model:selected-type="selectedType"
      v-model:filtered-column-keys="filteredColumnKeys"
      v-model:row-highlight-enabled="rowHighlightEnabled"
      :sensor-type-options="sensorTypeOptions"
      :check-box-columns-options="checkBoxColumnsOptions"
      @clear-filters="clearFilters"
      @toggle-mobile-menu="toggleMobileMenu"
    />

    <!-- Mobile menu -->
    <MobileMenu
      v-model:open="mobileMenuOpen"
      v-model:selectedType="selectedType"
      v-model:filteredColumnKeys="filteredColumnKeys"
      v-model:rowHighlightEnabled="rowHighlightEnabled"
      :sensorTypeOptions="sensorTypeOptions"
      :checkBoxColumnsOptions="checkBoxColumnsOptions"
      @clearFilters="clearFilters"
    />

    <!-- Table -->
    <a-spin v-if="loading" :spinning="loading" tip="Loading data..." class="min-h-screen min-w-full flex items-center justify-center gap-3"/>
      <a-table v-else
        :columns="visibleColumns"
        :data-source="filteredSensors"
        :row-class-name="getRowClassName"
        :pagination="{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: ['50', '100', '150'],
      }"
        :scroll="{ x: scrollX, y: 'calc(100vh - 260px)' }"
        @resizeColumn="handleResizeColumn"
      />
    </div>
</template>