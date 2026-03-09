<script setup lang="ts">
import { MenuOutlined } from '@ant-design/icons-vue';
import HelpPopover from './HelpPopover.vue';
import ColumnFilterPopover from './ColumnFilterPopover.vue';

interface Props {
  searchQuery: string;
  selectedType: string;
  sensorTypeOptions: { value: string; label: string }[];
  filteredColumnKeys: string[];
  checkBoxColumnsOptions: { label: string; value: string }[];
  rowHighlightEnabled: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedType', value: string): void;
  (e: 'update:filteredColumnKeys', value: string[]): void;
  (e: 'update:rowHighlightEnabled', value: boolean): void;
  (e: 'clearFilters'): void;
  (e: 'toggleMobileMenu'): void;
}>();
</script>

<template>
  <nav class="flex items-center justify-between p-4 gap-3 bg-gray-700">
    <div class="flex items-center gap-3">
      <img src="../assets/logo.png" alt="Logo" class="h-8 md:h-10 object-contain" />
      <h1
        class="hidden md:flex items-center justify-center text-2xl text-white font-bold md:whitespace-nowrap"
      >
        Sensors Dashboard
      </h1>
    </div>

    <!-- Search -->
    <a-input-search
      :value="searchQuery"
      @update:value="(value: string) => emit('update:searchQuery', value)"
      placeholder="Search by name..."
      allow-clear
      class="flex-1 max-w-full"
    />

    <!-- Desktop filters -->
    <div class="hidden lg:flex items-center gap-3">
      <!-- Filter by type -->
      <a-select
        :value="selectedType"
        @update:value="(value: string) => emit('update:selectedType', value)"
        placeholder="Filter by type"
        allow-clear
        class="min-w-80"
        :options="sensorTypeOptions"
      />
      <!-- Filter columns -->
      <ColumnFilterPopover
        :filtered-column-keys="filteredColumnKeys"
        :check-box-columns-options="checkBoxColumnsOptions"
        @update:filtered-column-keys="(value: string[]) => emit('update:filteredColumnKeys', value)"
        @clear-filters="emit('clearFilters')"
      />

      <!-- Help -->
      <HelpPopover
        show-row-highlight-toggle
        :row-highlight-enabled="rowHighlightEnabled"
        @update:row-highlight-enabled="(value: boolean) => emit('update:rowHighlightEnabled', value)"
      />
    </div>

    <!-- Mobile menu button -->
    <button
      type="button"
      class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-white"
      @click="emit('toggleMobileMenu')"
      aria-label="Toggle navigation menu"
    >
      <MenuOutlined class="text-xl" />
    </button>
  </nav>
</template>
