import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useDataStore = defineStore("dataStore", () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchData(url) {
    loading.value = true;
    try {
      const response = await axios.get(url);
      data.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetchData };
});
