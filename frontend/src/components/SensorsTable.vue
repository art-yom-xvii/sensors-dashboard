<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useSensorsData } from '../composables/useSensorsData';
import { InsertRowRightOutlined, QuestionCircleOutlined, ColumnWidthOutlined, WarningOutlined, FontColorsOutlined, SaveOutlined, MenuOutlined } from '@ant-design/icons-vue';
import { COLUMNS_STORAGE_KEY, UNKNOWN_SENSOR_NAME } from '../utils';
import type { Sensor, SensorTableColumn, DisplaySensor } from '../types';
import MobileMenu from './MobileMenu.vue';

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
const closeMobileMenu = () => mobileMenuOpen.value = false;

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
    <nav class="flex items-center justify-between p-4 gap-3 bg-gray-700">
      <div class="flex items-center gap-3">
        <img src="../assets/logo.png" alt="Logo" class="h-8 md:h-10 object-contain" />
        <h1 class="hidden md:flex items-center justify-center text-2xl text-white font-bold md:whitespace-nowrap">Sensors Dashboard</h1>
      </div>

      <!-- Search - always visible -->
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search by name..."
        allow-clear
        class="flex-1 max-w-full"
      />

      <!-- Desktop filters -->
      <div class="hidden lg:flex items-center gap-3">
          <!-- Filter by type -->
          <a-select
            v-model:value="selectedType"
            placeholder="Filter by type"
            allow-clear
            class="min-w-80"
            :options="sensorTypeOptions"
          />
          <!-- Filter columns -->
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

          <!-- Help -->
          <a-popover placement="bottomRight" trigger="click">
            <template #content>
              <div class="min-w-64 p-0">
                <div class="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 rounded-t-lg">
                  <span class="text-sm font-semibold text-slate-700 tracking-tight">Help</span>
                </div>
                <ul class="m-0 list-none px-4 py-3 pb-4 divide-y divide-slate-100">
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600 first:pt-0">
                    <WarningOutlined class="shrink-0 mt-0.5 text-sm text-red-600" />
                    <span>Rows in <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded lowercase bg-red-50 text-red-800 border border-red-200">red</span> have no metrics.</span>
                  </li>
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
                    <WarningOutlined class="shrink-0 mt-0.5 text-sm text-yellow-600" />
                    <span>Rows in <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded lowercase bg-yellow-50 text-yellow-800 border border-yellow-200">yellow</span> have a missing name.</span>
                  </li>
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
                    <FontColorsOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
                    <span>Sensors without a name appear as <em class="italic text-slate-500">"Unnamed Sensor (ID …)"</em>.</span>
                  </li>
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
                    <SaveOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
                    <span>Your column filters are saved and restored on the next visit or refresh.</span>
                  </li>
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
                    <ColumnWidthOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
                    <span>Drag column borders to resize columns.</span>
                  </li>
                  <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
                    <a-tooltip title="Toggle row highlighting to help identify sensors with no metrics or missing names">
                      <div class="flex items-center gap-2">
                        <a-switch v-model:checked="rowHighlightEnabled" />
                        <span>Toggle row highlight</span>
                      </div>
                    </a-tooltip>
                  </li>
                </ul>
              </div>
            </template>
            <a-button class="whitespace-nowrap flex items-center justify-center">
              <QuestionCircleOutlined />
              Help
            </a-button>
          </a-popover>
      </div>

      <!-- Mobile menu button -->
      <button
        type="button"
        class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-white"
        @click="toggleMobileMenu"
        aria-label="Toggle navigation menu"
      >
        <MenuOutlined class="text-xl" />
      </button>
    </nav>

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