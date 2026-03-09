<script setup lang="ts">
import {
  QuestionCircleOutlined,
  ColumnWidthOutlined,
  WarningOutlined,
  FontColorsOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';

interface Props {
  fullWidth?: boolean;
  showRowHighlightToggle?: boolean;
  rowHighlightEnabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  fullWidth: false,
  showRowHighlightToggle: false,
  rowHighlightEnabled: true,
});

const emit = defineEmits<{
  (e: 'update:rowHighlightEnabled', value: boolean): void;
}>();
</script>

<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
      <div class="min-w-64 p-0">
        <div
          class="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 rounded-t-lg"
        >
          <span class="text-sm font-semibold text-slate-700 tracking-tight">Help</span>
        </div>
        <ul class="m-0 list-none px-4 py-3 pb-4 divide-y divide-slate-100">
          <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600 first:pt-0">
            <WarningOutlined class="shrink-0 mt-0.5 text-sm text-red-600" />
            <span
              >Rows in
              <span
                class="inline-block px-2 py-0.5 text-xs font-semibold rounded lowercase bg-red-50 text-red-800 border border-red-200"
                >red</span
              >
              have no metrics.</span
            >
          </li>
          <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
            <WarningOutlined class="shrink-0 mt-0.5 text-sm text-yellow-600" />
            <span
              >Rows in
              <span
                class="inline-block px-2 py-0.5 text-xs font-semibold rounded lowercase bg-yellow-50 text-yellow-800 border border-yellow-200"
                >yellow</span
              >
              have a missing name.</span
            >
          </li>
          <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
            <FontColorsOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
            <span
              >Sensors without a name appear as
              <em class="italic text-slate-500">"Unnamed Sensor (ID …)"</em>.</span
            >
          </li>
          <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
            <SaveOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
            <span>Your column filters are saved and restored on the next visit or refresh.</span>
          </li>
          <li class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600">
            <ColumnWidthOutlined class="shrink-0 mt-0.5 text-sm text-slate-400" />
            <span>Drag column borders to resize columns.</span>
          </li>
          <li
            v-if="showRowHighlightToggle"
            class="flex items-start gap-2.5 py-2 text-md leading-snug text-slate-600"
          >
            <a-tooltip
              title="Toggle row highlighting to help identify sensors with no metrics or missing names"
            >
              <div class="flex items-center gap-2">
                <a-switch
                  :checked="rowHighlightEnabled"
                  @update:checked="(value: boolean) => emit('update:rowHighlightEnabled', value)"
                />
                <span>Toggle row highlight</span>
              </div>
            </a-tooltip>
          </li>
        </ul>
      </div>
    </template>
    <a-button
      :class="fullWidth ? 'w-full' : ''"
      class="whitespace-nowrap flex items-center justify-center"
    >
      <QuestionCircleOutlined />
      Help
    </a-button>
  </a-popover>
</template>
