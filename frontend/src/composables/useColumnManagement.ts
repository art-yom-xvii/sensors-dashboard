import { ref, computed, watch, type Ref } from 'vue';
import type { Sensor, SensorTableColumn } from '../types';
import { COLUMNS_STORAGE_KEY } from '../utils';

const FIXED_COLUMN_KEYS = ['name'];

const nameColumn: SensorTableColumn[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: Sensor, b: Sensor) => (a.name || '').localeCompare(b.name || ''),
    sortDirections: ['ascend', 'descend'],
    resizable: true,
    fixed: 'left',
    width: 250,
    minWidth: 100,
  },
];

export const useColumnManagement = (sensors: Ref<Sensor[]>) => {
  const columns = ref<SensorTableColumn[]>([]);
  const filteredColumnKeys = ref<string[]>([]);

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

  const visibleColumns = computed(() => {
    const allColumns = columns.value;
    const keys = filteredColumnKeys.value;
    const fixed = allColumns.filter((column) => FIXED_COLUMN_KEYS.includes(column.key));
    const nonFixed = allColumns.filter((column) => !FIXED_COLUMN_KEYS.includes(column.key));
    if (!keys.length) return allColumns;
    return [...fixed, ...nonFixed.filter((column) => keys.includes(column.key))];
  });

  const checkBoxColumnsOptions = computed(() => {
    return columns.value
      .filter((column) => !FIXED_COLUMN_KEYS.includes(column.key))
      .map((column) => ({ label: column.title, value: column.key }));
  });

  const scrollX = computed(() =>
    visibleColumns.value.reduce((sum, col) => sum + (col.width || 0), 0)
  );

  const setVisibleColumns = (keys: string[]) => {
    const metricCols: SensorTableColumn[] = keys.map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: ['metrics', key],
      key,
      sorter: (a, b) => {
        const aVal = a.metrics?.[key];
        const bVal = b.metrics?.[key];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return aVal - bVal;
      },
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
    } catch (error) {
      console.error('Error loading filter state from localStorage:', error);
    }
  };

  const saveFilterStateToLocalStorage = (columnKeys: string[] | null) => {
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnKeys ?? []));
    } catch (error) {
      console.error('Error saving filter state to localStorage:', error);
    }
  };

  const clearFilters = () => {
    filteredColumnKeys.value = [];
  };

  const handleResizeColumn = (width: number, column: SensorTableColumn) => {
    column.width = width;
  };

  watch(
    filteredColumnKeys,
    (columnKeys) => {
      saveFilterStateToLocalStorage(columnKeys);
    },
    { deep: true }
  );

  return {
    columns,
    filteredColumnKeys,
    metricKeys,
    visibleColumns,
    checkBoxColumnsOptions,
    scrollX,
    setVisibleColumns,
    loadFilterStateFromLocalStorage,
    clearFilters,
    handleResizeColumn,
  };
};