<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getSensors } from '../api/sensorsApi';

const sensors = ref([]);
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
    sensors.value = await getSensors();
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
    width: 200,
    minWidth: 120,
  },
];

const metricKeys = computed(() => {
  if (!sensors.value.length) return [];
  const keys = new Set();
  sensors.value.forEach((s) => {
    if (s.metrics && typeof s.metrics === 'object') {
      Object.keys(s.metrics).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys);
});

const columns = ref([]);

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
    columns.value = [...baseColumns, ...metricCols];
  },
  { immediate: true }
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
  </div>
  <a-table
    :columns="columns"
    :data-source="filteredSensors"
    :pagination="true"
    :scroll="{ x: '50vw', y: 'calc(100vh - 250px)' }"
    @resizeColumn="handleResizeColumn"
  />
</template>