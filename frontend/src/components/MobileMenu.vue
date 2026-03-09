<script setup lang="ts">
import { computed } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue';
import HelpPopover from './HelpPopover.vue';

interface Props {
  open: boolean;
  selectedType: string;
  filteredColumnKeys: string[];
  sensorTypeOptions: { value: string; label: string }[];
  checkBoxColumnsOptions: { label: string; value: string }[];
  rowHighlightEnabled: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'update:selectedType', value: string): void;
  (e: 'update:filteredColumnKeys', value: string[]): void;
  (e: 'update:rowHighlightEnabled', value: boolean): void;
  (e: 'clearFilters'): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const handleClose = () => emit('update:open', false);

const isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 768);
</script>

<template>
  <a-drawer
    :open="open"
    placement="right"
    title="Sensors Dashboard"
    :width="isMobile ? '100%' : 320"
    :maskClosable="true"
    :closable="false"
    @close="handleClose"
    class="lg:hidden"
  >
    <template #extra>
      <a-button
        class="border-0 absolute right-0 top-2"
        @click="handleClose"
      >
        <CloseOutlined />
      </a-button>
    </template>
    <div class="flex flex-col gap-4">
      <!-- Mobile Filter by type -->
      <a-select
        :value="selectedType"
        @update:value="(value: string) => emit('update:selectedType', value)"
        placeholder="Filter by type"
        allow-clear
        class="w-full"
        :options="sensorTypeOptions"
      />

      <!-- Mobile Row Highlight toggle -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-gray-500">Row highlight</span>
        <a-tooltip title="Toggle row highlighting to help identify sensors with no metrics or missing names">
          <div class="flex items-center gap-2">
            <a-switch 
              :checked="rowHighlightEnabled"
              @update:checked="(value: boolean) => emit('update:rowHighlightEnabled', value)"
            />
          </div>
        </a-tooltip>
      </div>

      <!-- Mobile Filter columns -->
      <div class="flex flex-col gap-2 min-w-55">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">Visible columns</span>
          <a-button
            type="link"
            size="small"
            class="text-xs"
            @click="emit('clearFilters')"
            :disabled="!filteredColumnKeys.length"
          >
            Clear filters
          </a-button>
        </div>
        <a-checkbox-group
          :value="filteredColumnKeys"
          @update:value="(value: string[]) => emit('update:filteredColumnKeys', value)"
          :options="checkBoxColumnsOptions"
          class="flex flex-col gap-3 w-full text-lg"
        >
          <template #label="{ label }">
            <span class="text-xl">{{ label }}</span>
          </template>
        </a-checkbox-group>
      </div>

      <!-- Mobile Help -->
      <HelpPopover full-width />
    </div>
  </a-drawer>
</template>
