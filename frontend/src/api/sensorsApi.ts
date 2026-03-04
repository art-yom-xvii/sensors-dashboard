export const getSensors = async () => {
  const response = await fetch('http://localhost:8000/api/sensors');
  return response.json();
};