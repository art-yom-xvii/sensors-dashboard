<script setup lang="ts">
import { computed } from 'vue';
 import { QuestionCircleOutlined, ColumnWidthOutlined, WarningOutlined, FontColorsOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons-vue';

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

      <!-- Mobile Filter columns - Render directly, no button or popover -->
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
          class="flex flex-col gap-1"
        />
      </div>

      <!-- Mobile Help -->
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
            </ul>
          </div>
        </template>
        <a-button class="w-full whitespace-nowrap flex items-center justify-center">
          <QuestionCircleOutlined />
          Help
        </a-button>
      </a-popover>
    </div>
  </a-drawer>
</template>
