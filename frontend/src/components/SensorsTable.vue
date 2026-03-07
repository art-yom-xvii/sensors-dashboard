<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useSensorsData } from '../composables/useSensorsData';
import { InsertRowRightOutlined } from '@ant-design/icons-vue';
import { COLUMNS_STORAGE_KEY, UNKNOWN_SENSOR_NAME } from '../utils';
import type { Sensor, SensorTableColumn, DisplaySensor } from '../types';

const { sensors, loading, error, fetchSensors, uniqueSensorTypes } = useSensorsData();
const searchQuery = ref('');
const selectedType = ref('');
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

const columns = ref<SensorTableColumn[]>([]);

const filteredColumnKeys = ref<string[]>([]);

const visibleColumns = computed(() => {
  const allColumns = columns.value;
  const keys = filteredColumnKeys.value;
  if (!keys.length) return allColumns;
  return allColumns.filter((column) => keys.includes(column.key));
});

const clearFilters = () => {
    filteredColumnKeys.value = [];
};

const scrollX = computed(() => {
  return visibleColumns.value.reduce((sum, col) => sum + (col.width || 0), 0);
});

const setVisibleColumns = (keys: string[]) => {
  const metricCols: SensorTableColumn[] = keys.map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: ['metrics', key],
      key,
      sorter: (a, b) => (a.metrics?.[key] ?? 0) - (b.metrics?.[key] ?? 0),
      defaultSortOrder: 'ascend',
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
  return columns.value.map((column) => ({ label: column.title, value: column.key }));
});

watch(
  filteredColumnKeys,
  (columnKeys) => {
    saveFilterStateToLocalStorage(columnKeys);
  },
  { deep: true }
);

const handleResizeColumn = (width: number, column: SensorTableColumn) => {
  column.width = width;
};

const getRowClassName = (sensor: DisplaySensor) => {
  const sensorMetrics = sensor.metrics;
  const hasSensorMetrics = Object.values(sensorMetrics).some((value) => value != null);
  if (!hasSensorMetrics) {
    // Will help to identify if the sensor has no metrics (possibly sensor is not working?)
    return 'bg-red-100';
  }
  if (sensor.isUnknownName) {
    // Will help to identify if the sensor has a missing name
    return 'bg-yellow-100/50';
  }
  else {
    return '';
  }
  }

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
    <!-- Navbar -->
    <div class="flex items-center justify-between p-4 gap-3 bg-gray-700">
      <img src="../assets/logo.png" alt="Logo" class="h-10 object-contain" />
      <h1 class="hidden md:flex items-center justify-center text-2xl text-white font-bold md:whitespace-nowrap">Sensors Dashboard</h1>

        <div class="flex w-full justify-between items-center gap-3">
          <!-- Search -->
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Search by name..."
            allow-clear
            class="min-w-40 max-w-full"
          />

          <div class="flex items-center gap-3">
            <!-- Filter by type -->
            <a-select
              v-model:value="selectedType"
              placeholder="Filter by type"
              allow-clear
              class="min-w-80"
              :options="sensorTypeOptions"
            />
            <!-- Filter by columns -->

            <a-popover placement="bottomRight" trigger="click">
              <template #content>
                <div class="flex flex-col gap-2 min-w-55">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-gray-500">Visible columns</span>
                    <a-button
                      type="link"
                      size="small"
                      class="text-xs"
                      @click="clearFilters"
                      :disabled="!filteredColumnKeys.length"
                    >
                      Clear filters
                    </a-button>
                  </div>
                  <a-checkbox-group
                    v-model:value="filteredColumnKeys"
                    :options="checkBoxColumnsOptions"
                    class="flex flex-col gap-1 max-h-64"
                  />
                </div>
              </template>
              <a-button class="whitespace-nowrap flex items-center justify-center">
                <InsertRowRightOutlined />
                Filter Columns
              </a-button>
            </a-popover>
          </div>
        </div>
    </div>

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