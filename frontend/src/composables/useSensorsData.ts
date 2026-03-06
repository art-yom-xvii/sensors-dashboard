import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useSensorsData = () => {
  const sensors = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchSensors = async () => {
    loading.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sensors`);
      sensors.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    sensors,
    loading,
    error,
    fetchSensors,
  };
};