import { ref, computed, type Ref } from 'vue';
import type { Sensor, DisplaySensor } from '../types';
import { UNKNOWN_SENSOR_NAME } from '../utils';

export const useSensorFiltering = (
  sensors: Ref<Sensor[]>,
  uniqueSensorTypes: Ref<string[]>
) => {
  const searchQuery = ref('');
  const selectedType = ref('');

  const sensorTypeOptions = computed(() =>
    uniqueSensorTypes.value.map((type: string) => ({
      value: type,
      label: type || 'All types',
    }))
  );

  const displaySensors = computed<DisplaySensor[]>(() =>
    sensors.value.map((sensor: Sensor) => {
      const isUnknownName = !sensor.name || sensor.name === UNKNOWN_SENSOR_NAME;
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
    if (query) {
      list = list.filter((sensor) => (sensor.name || '').toLowerCase().includes(query));
    }
    if (selectedType.value) {
      list = list.filter((sensor) => sensor.type === selectedType.value);
    }
    return list;
  });

  return {
    searchQuery,
    selectedType,
    sensorTypeOptions,
    displaySensors,
    filteredSensors,
  };
};
