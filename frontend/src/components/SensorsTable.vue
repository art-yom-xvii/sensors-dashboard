<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useSensorsData } from '../composables/useSensorsData';

const { sensors, loading, error, fetchSensors } = useSensorsData();
const searchQuery = ref('');
const selectedType = ref('');

const typeOptions = computed(() => {
  const set = new Set(sensors.value.map((s) => s.type).filter(Boolean));
  return ['', ...Array.from(set).sort()];
});

const filteredSensors = computed(() => {
  let list = sensors.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) list = list.filter((s) => (s.name || '').toLowerCase().includes(q));
  if (selectedType.value) list = list.filter((s) => s.type === selectedType.value);
  return list;
});

onMounted(async () => {
  try {
    await fetchSensors();
  } catch (error) {
    console.error('Error fetching sensors:', error);
  }
});

const baseColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    defaultSortOrder: 'ascend',
    sortDirections: ['ascend', 'descend'],
    resizable: true,
    fixed: 'left',
    width: 200,
    minWidth: 120,
  },
];

const metricKeys = computed(() => {
  if (!sensors.value?.length) return [];
  const keys = new Set();
  sensors.value.forEach((s) => {
    if (s.metrics && typeof s.metrics === 'object') {
      Object.keys(s.metrics).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys);
});

const COLUMNS_STORAGE_KEY = 'sensors-dashboard-visible-column-keys';

const columns = ref([]);

const visibleColumnKeys = ref([]);

const visibleColumns = computed(() => {
  const all = columns.value;
  const keys = visibleColumnKeys.value;
  if (!keys.length) return all;
  return all.filter((col) => keys.includes(col.key));
});

const scrollX = computed(() => {
  return visibleColumns.value.reduce((sum, col) => sum + (col.width || 0), 0);
});

watch(
  metricKeys,
  (keys) => {
    const metricCols = keys.map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: ['metrics', key],
      key,
      sorter: (a, b) => (a.metrics?.[key] ?? 0) - (b.metrics?.[key] ?? 0),
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend'],
      resizable: true,
      width: 140,
      minWidth: 100,
    }));
    const nextColumns = [...baseColumns, ...metricCols];
    columns.value = nextColumns;
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = Array.isArray(parsed)
          ? parsed.filter((k) => nextColumns.some((c) => c.key === k))
          : [];
        visibleColumnKeys.value = valid;
      }
    } catch {
      // ignore invalid stored value
    }
  },
  { immediate: true }
);

watch(
  visibleColumnKeys,
  (val) => {
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(val ?? []));
    } catch {
      console.error('Error saving visible column keys:', error);
    }
  },
  { deep: true }
);

const handleResizeColumn = (w, col) => {
  col.width = w;
};
</script>

<template>
  <div class="p-2 flex justify-between gap-3 bg-gray-600">
    <img src="../assets/logo.png" alt="Logo" class="h-10 mr-4" style="object-fit: contain;" />
      <div class="flex w-full justify-between items-center gap-3">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="Search by name..."
          allow-clear
          class="max-w-[300px]"
        />
        <a-select
          v-model:value="selectedType"
          placeholder="Filter by type"
          allow-clear
          class="min-w-[200px]"
          :options="typeOptions.map((t) => ({ value: t, label: t || 'All types' }))"
        />
      </div>
      <a-popover placement="bottomRight" trigger="click">
        <template #content>
          <div class="flex flex-col gap-2 min-w-[220px]">
            <span class="text-xs font-medium text-gray-500">Visible columns</span>
            <a-checkbox-group
              v-model:value="visibleColumnKeys"
              :options="columns.map((c) => ({ label: c.title, value: c.key }))"
              class="flex flex-col gap-1 max-h-64 overflow-y-auto"
            />
          </div>
        </template>
        <a-button size="small" class="whitespace-nowrap">
          Columns
        </a-button>
      </a-popover>
  </div>
  <a-spin :spinning="loading" tip="Loading data...">
    <a-table
      :columns="visibleColumns"
      :data-source="filteredSensors"
      :pagination="true"
      :scroll="{ x: scrollX, y: 'calc(100vh - 250px)' }"
      @resizeColumn="handleResizeColumn"
    />
  </a-spin>
</template>