import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axiosClient from '../client/axiosClient'; // Asegúrate de tener tu cliente axios configurado
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de instalar y configurar AsyncStorage
import Header from '../organisms/Header';

const MyListPetU = ({ route, navigation }) => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Agregar estado para manejar errores

  useEffect(() => {
    fetchAdoptedPets();
    return () => {
      // Limpieza al desmontar el componente
      setPets([]);
      setFilteredPets([]);
      setFilterValue('');
      setIsLoading(true);
      setError(null);
    };
  }, []);

  useEffect(() => {
    filterPets();
    fetchAdoptedPets();
  }, [filterValue, pets]);

  const fetchAdoptedPets = async () => {
    try {
      const user = await AsyncStorage.getItem('user'); // Obtener el usuario de AsyncStorage
      const parsedUser = user ? JSON.parse(user) : null;
      const identificacion = parsedUser ? parsedUser.identificacion : null; // Asegúrate de que el ID del usuario esté disponible

      if (identificacion) {
        const response = await axiosClient.get(`/mascota/procesoAdopcion/${identificacion}`);
        if (response.data && response.data.mascotas) {
          setPets(response.data.mascotas); // Ajuste aquí para acceder a la propiedad 'mascotas' en la respuesta
          setFilteredPets(response.data.mascotas); // Inicializa también filteredPets
        }
      }
    } catch (error) {
      /*       console.error('Error fetching adopted pets:', error); */
      setError('No tienes mascotas en proceso de adopción.');
      setIsLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = pets;

    if (filterValue) {
      filtered = filtered.filter(pet =>
        pet.nombre.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.raza.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.genero.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    setFilteredPets(filtered);
  };

  const denyAdoption = async (id_mascota) => {
    try {
      const response = await axiosClient.post(`/mascota/administrar/${id_mascota}`, {
        accion: 'denegar'
      });

      if (response.status === 200) {
        Alert.alert('Éxito', response.data.message);
        fetchAdoptedPets(); // Refresca la lista de mascotas
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error denying adoption:', error);
      Alert.alert('Error', 'Hubo un problema al denegar la adopción.');
    }
  };

  const renderPetCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Nombre: {item.nombre}</Text>
      <Text style={styles.subtitle}>Género: {item.genero}</Text>
      <Text style={styles.subtitle}>Raza: {item.raza}</Text>
      <Text style={styles.subtitle}>Edad: {item.edad}</Text>
      <Text style={styles.subtitle}>Estado: {item.estado}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => denyAdoption(item.id_mascota)}
      >
        <Text style={styles.buttonText}>Denegar Adopción</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Mis mascotas..." />
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        value={filterValue}
        onChangeText={setFilterValue}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredPets}
          renderItem={renderPetCard}
          keyExtractor={item => item.id_mascota.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyListPetU;
