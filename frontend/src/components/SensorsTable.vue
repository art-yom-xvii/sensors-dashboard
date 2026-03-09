<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useSensorsData } from '../composables/useSensorsData';
import { COLUMNS_STORAGE_KEY, UNKNOWN_SENSOR_NAME } from '../utils';
import type { Sensor, SensorTableColumn, DisplaySensor } from '../types';
import MobileMenu from './MobileMenu.vue';
import SensorsTableNavbar from './SensorsTableNavbar.vue';

const { sensors, loading, error, fetchSensors, uniqueSensorTypes } = useSensorsData();
const searchQuery = ref('');
const selectedType = ref('');
const rowHighlightEnabled = ref(true);
const mobileMenuOpen = ref(false);
const sensorTypeOptions = computed(() => 
  uniqueSensorTypes.value.map((type: string) => ({ value: type, label: type || 'All types' }))
)

const displaySensors = computed<DisplaySensor[]>(() =>
  sensors.value.map((sensor: Sensor) => {
    const isUnknownName =
      !sensor.name || sensor.name === UNKNOWN_SENSOR_NAME;
    return {
      ...sensor,
      name:
        isUnknownName && sensor.id != null
          ? `Unnamed Sensor (ID ${sensor.id})`
          : sensor.name || 'Unnamed Sensor',
          isUnknownName: isUnknownName,
    };
  })
);

const filteredSensors = computed(() => {
  let list = displaySensors.value;
  const query = searchQuery.value.trim().toLowerCase();
  if (query) list = list.filter((sensor) => (sensor.name || '').toLowerCase().includes(query));
  if (selectedType.value) list = list.filter((sensor) => sensor.type === selectedType.value);
  return list;
});

const nameColumn: SensorTableColumn[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: Sensor, b: Sensor) => a.name.localeCompare(b.name),
    sortDirections: ['ascend', 'descend'],
    resizable: true,
    fixed: 'left',
    width: 250,
    minWidth: 100,
  },
];

const metricKeys = computed(() => {
  if (!sensors.value?.length) return [];
  const keys = new Set<string>();
  sensors.value.forEach((s) => {
    if (s.metrics && typeof s.metrics === 'object') {
      Object.keys(s.metrics).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys);
});

const FIXED_COLUMN_KEYS = ['name'];

const columns = ref<SensorTableColumn[]>([]);

const filteredColumnKeys = ref<string[]>([]);

const visibleColumns = computed(() => {
  const allColumns = columns.value;
  const keys = filteredColumnKeys.value;
  const fixed = allColumns.filter((column) => FIXED_COLUMN_KEYS.includes(column.key));
  const nonFixed = allColumns.filter((column) => !FIXED_COLUMN_KEYS.includes(column.key));
  if (!keys.length) return allColumns;
  return [...fixed, ...nonFixed.filter((column) => keys.includes(column.key))];
});

const clearFilters = () => (filteredColumnKeys.value = []);

const scrollX = computed(() => visibleColumns.value.reduce((sum, col) => sum + (col.width || 0), 0));

const setVisibleColumns = (keys: string[]) => {
  const metricCols: SensorTableColumn[] = keys.map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: ['metrics', key],
      key,
      sorter: (a, b) => (a.metrics?.[key] ?? 0) - (b.metrics?.[key] ?? 0),
      sortDirections: ['ascend', 'descend'],
      resizable: true,
      width: 90,
      minWidth: 90,
    }));
    const nextColumns = [...nameColumn, ...metricCols];
    columns.value = nextColumns;
};

const loadFilterStateFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = Array.isArray(parsed)
          ? parsed.filter((key) => columns.value.some((column) => column.key === key))
          : [];
        filteredColumnKeys.value = valid;
      }
    } catch(error) {
      console.error('Error saving filter state to localStorage:', error);
    }
};

const saveFilterStateToLocalStorage = (columnKeys: string[] | null) => {
  try {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnKeys ?? []));
  } catch(error) {
    console.error('Error saving filter state to localStorage:', error);
  }
};

const checkBoxColumnsOptions = computed(() => {
  return columns.value
    .filter((column) => !FIXED_COLUMN_KEYS.includes(column.key))
    .map((column) => ({ label: column.title, value: column.key }));
});

watch(
  filteredColumnKeys,
  (columnKeys) => {
    saveFilterStateToLocalStorage(columnKeys);
  },
  { deep: true }
);

const toggleMobileMenu = () => mobileMenuOpen.value = !mobileMenuOpen.value;

const handleResizeColumn = (width: number, column: SensorTableColumn) => {
  column.width = width;
};

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