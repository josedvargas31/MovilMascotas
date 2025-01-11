import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../client/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../organismos/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

const MyAdopts = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [mainImage, setMainImage] = useState('');

  const fetchAdoptedPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const id_usuario = parsedUser ? parsedUser.id_usuario : null;

      if (id_usuario) {
        const response = await axiosClient.get(`/adopciones/listaraceptadas/${id_usuario}`);
        
        if (response.data && response.data.length > 0) {
          const updatedPets = response.data.map(pet => {
            const imagenesArray = pet.imagenes ? pet.imagenes.split(',') : [];
            const mainImage = imagenesArray.length > 0 ? `${axiosClient.defaults.baseURL}/uploads/${imagenesArray[0]}` : '';
            return { ...pet, mainImage };
          });

          setPets(updatedPets);
          setFilteredPets(updatedPets);
        } else {
          setError('No tienes mascotas adoptadas');
          setPets([]);
          setFilteredPets([]);
        }
      } else {
        setError('Usuario no registrado');
      }
    } catch (error) {
      setError('No se pudo obtener la lista de mascotas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAdoptedPets();
    }, [fetchAdoptedPets])
  );

  useEffect(() => {
    filterPets();
  }, [filterValue, pets]);

  const filterPets = () => {
    let filtered = pets;

    if (filterValue) {
      filtered = filtered.filter(pet =>
        pet.nombre_mascota.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.raza.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.sexo.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    setFilteredPets(filtered);
  };

  const handleImagePress = (petId, imageUri) => {
    if (selectedPetId === petId) {
      setMainImage(imageUri);
    } else {
      setSelectedPetId(petId);
      setMainImage(imageUri);
    }
  };

  const PetCard = ({ item, mainImage, onImagePress }) => {
    const imagenesArray = item.imagenes ? item.imagenes.split(',') : [];
    const additionalImages = imagenesArray.map(image => `${axiosClient.defaults.baseURL}/uploads/${image}`);

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <Image
            source={{ uri: mainImage || item.mainImage }}
            style={styles.mainImage}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Nombre: {item.nombre_mascota}</Text>
            <Text style={styles.subtitle}>Género: {item.sexo}</Text>
            <Text style={styles.subtitle}>Raza: {item.raza}</Text>
            <Text style={styles.subtitle}>Fecha de Adopción: {new Date(item.fecha_adopcion_aceptada).toLocaleDateString()}</Text>
            <Text style={styles.subtitle}>Estado: {item.estado}</Text>
            <Text style={styles.subtitle}>Descripción: {item.descripcion}</Text>
          </View>
        </View>
        {additionalImages.length > 0 && (
          <View style={styles.imagesContainer}>
            {additionalImages.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(item.id_mascota, image)}>
                <Image
                  source={{ uri: image }}
                  style={styles.smallImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Mis Adopciones" />
      <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="orange" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        value={filterValue}
        onChangeText={setFilterValue}
        placeholderTextColor="#666" 
      />
        </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        filteredPets.length > 0 ? (
          <FlatList
            data={filteredPets}
            renderItem={({ item }) => (
              <PetCard
                item={item}
                mainImage={selectedPetId === item.id_mascota ? mainImage : item.mainImage}
                onImagePress={handleImagePress}
              />
            )}
            keyExtractor={item => item.id_mascota ? item.id_mascota.toString() : Math.random().toString()}
          />
        ) : (
          <Text style={styles.errorText}>No hay mascotas adoptadas</Text>
        )
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    // color: 'orange',
    paddingVertical: 0,
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
  cardContent: {
    flexDirection: 'row', // Coloca la imagen y la información textual en una fila
    marginBottom: 10,
  },
  mainImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666'
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  smallImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 14,
    color: '#888',
    alignSelf: 'center',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyAdopts;
