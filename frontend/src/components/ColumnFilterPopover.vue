<script setup lang="ts">
import { InsertRowRightOutlined } from '@ant-design/icons-vue';

interface Props {
  filteredColumnKeys: string[];
  checkBoxColumnsOptions: { label: string; value: string }[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:filteredColumnKeys', value: string[]): void;
  (e: 'clearFilters'): void;
}>();
</script>

<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
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
          class="flex flex-col gap-1 max-h-64"
        />
      </div>
    </template>
    <a-button class="whitespace-nowrap flex items-center justify-center">
      <InsertRowRightOutlined />
      Filter Columns
    </a-button>
  </a-popover>
</template>
