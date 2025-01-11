import axios from "axios";
// import { IP } from "./IP";
import AsyncStorage from '@react-native-async-storage/async-storage';

// const ip = IP;

const axiosClient = axios.create({
  baseURL: `https://shimmering-gentleness-production.up.railway.app`,
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      // Obtener el token de AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['token'] = token;
      }

      // Verificar si los datos que envías son de tipo FormData
      if (config.data instanceof FormData) {
        // Si es FormData, cambiar el 'Content-Type' a 'multipart/form-data'
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        // Si no es FormData, usar 'application/json' por defecto
        config.headers['Content-Type'] = 'application/json';
      }
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;


  // https://shimmering-gentleness-production.up.railway.app/ 