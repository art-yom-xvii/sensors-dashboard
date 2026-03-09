import { ref, computed } from 'vue';
import type { Sensor } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useSensorsData = () => {
  const sensors = ref<Sensor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSensors = async () => {
    error.value = null;
    loading.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sensors`);
      sensors.value = await response.json();
    } catch (fetchError) {
      console.error(fetchError);
      error.value = "Error fetching sensor data";
    } finally {
      loading.value = false;
    }
  };

  const uniqueSensorTypes = computed(() => {
    const sensorTypesSet = new Set(
      sensors.value.map((sensor) => sensor.type).filter(Boolean),
    );
    return ['', ...Array.from(sensorTypesSet).sort()];
  });

  return {
    sensors,
    loading,
    error,
    fetchSensors,
    uniqueSensorTypes,
  };
};