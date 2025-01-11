import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal
} from 'react-native';
import axiosClient from '../client/axiosClient';
import Header from '../organismos/Header';
import ListPet from '../moleculas/ListPet';
import EstadoModal from '../organismos/EstadoModal';
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect
import Icon from 'react-native-vector-icons/FontAwesome';

const statusColorMap = {
  'En Adopcion': "#28a745",
  Urgente: "#FF0000",
  Reservado: "#ffc107",
  Adoptado: "#6c757d",
  Todos: "#007bff",
};

const statusOptions = [
  { name: "Todos", uid: "Todos" },
  { name: "En Adopcion", uid: "En Adopcion" },
  { name: "Urgente", uid: "Urgente" },
  /* { name: "Reservado", uid: "Reservado" },
  { name: "Adoptado", uid: "Adoptado" }, */
];

const ListsPets = () => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [estadoModalVisible, setEstadoModalVisible] = useState(false); // Estado para controlar la visibilidad del EstadoModal
  const [selectedTitle, setSelectedTitle] = useState(''); // Estado para controlar el título del modal

  useFocusEffect(
    React.useCallback(() => {
      fetchPets();
    }, [])
  );

  useEffect(() => {
    filterPets();
  }, [filterValue, selectedStatus, pets]);

  const fetchPets = async () => {
    try {
      const response = await axiosClient.get('/mascotas/listar');
      setPets(response.data);
      setFilteredPets(response.data);
    } catch (error) {
      /* console.error('Error fetching pets:', error); */
      alert('No hay mascotas para listar');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = pets;

    // Excluir mascotas en "Reservado" y "Adoptado" siempre
    filtered = filtered.filter(pet => pet.estado !== "Reservado" && pet.estado !== "Adoptado");

    if (filterValue) {
      filtered = filtered.filter(pet =>
        pet.nombre_mascota.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.raza.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.categoria.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.sexo.toLowerCase().includes(filterValue.toLowerCase()) 
      );
    }

    // Filtrar por estado seleccionado
    if (selectedStatus !== 'Todos') {
      filtered = filtered.filter(pet => pet.estado === selectedStatus);
    }

    setFilteredPets(filtered);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedPet(null);
    fetchPets(); // Refresca la lista después de cerrar el modal
  };

  const handleEstadoChipPress = (estado) => {
    setSelectedTitle(estado);
    setEstadoModalVisible(true); // Muestra el EstadoModal
  };

  const renderPetCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Nombre: {item.nombre_mascota}</Text>
        <Text style={styles.subtitle}>Género: {item.sexo}</Text>
        <Text style={styles.subtitle}>Raza: {item.raza}</Text>
        <TouchableOpacity
          style={[styles.statusChip, { backgroundColor: statusColorMap[item.estado] }]}
          onPress={() => handleEstadoChipPress(item.estado)} // Muestra el modal al hacer clic
        >
          <Text style={styles.statusText}>{item.estado}</Text>
        </TouchableOpacity>

        {/* Sección de imágenes */}
        {item.imagenes && item.imagenes.length > 0 ? (
          <View style={[styles.imageGrid, item.imagenes.length === 1 ? styles.singleImageGrid : styles.multiImageGrid]}>
            {item.imagenes.split(',').filter(imagen => imagen).map((imagen, index) => (
              <View key={index} style={[styles.imageWrapper, item.imagenes.length === 1 && index === 0 ? styles.singleImageWrapper : null]}>
                <Image
                  source={{ uri: `${axiosClient.defaults.baseURL}/uploads/${imagen}` }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(error) => console.log(`Error loading image ${index + 1}:`, error.nativeEvent.error)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.defaultImageWrapper}>
            <Image
              source={{ uri: 'https://nextui.org/images/hero-card-complete.jpeg' }}
              style={styles.image}
              resizeMode="cover"
              onError={(error) => console.log('Error loading default image:', error.nativeEvent.error)}
            />
          </View>
        )}

        <Text style={styles.description}>{item.descripcion}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => { setSelectedPet(item); setModalVisible(true); }}
        >
          <Text style={styles.buttonText}>Ver más...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <Header title="Lista de mascotas" />
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
      <View style={styles.dropdown}>
        {statusOptions.map(option => (
          <TouchableOpacity
            key={option.uid}
            style={[styles.dropdownItem, selectedStatus === option.uid && styles.selectedDropdownItem]}
            onPress={() => setSelectedStatus(option.uid)}
          >
            <Text style={styles.dropdownText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredPets}
          renderItem={renderPetCard}
          keyExtractor={item => item.id_mascota.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
      <ListPet visible={modalVisible} onClose={handleModalClose} pet={selectedPet} />
      <EstadoModal
        isVisible={estadoModalVisible}
        onClose={() => setEstadoModalVisible(false)}
        title={selectedTitle}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
  dropdown: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  selectedDropdownItem: {
    backgroundColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
    color: '#666',
  },
  row: {
    flex: 1,
    justifyContent: "space-between", // Space between cards
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    width: 175,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusChip: {
    padding: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  statusText: {
    color: '#fff',
  },
  /*  */
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  singleImageGrid: {
    justifyContent: 'center',
  },
  multiImageGrid: {
    justifyContent: 'space-between',
  },
  imageWrapper: {
    flexBasis: '48%', // Ajusta el tamaño según sea necesario 
    marginBottom: 8,
  },
  singleImageWrapper: {
    flexBasis: '100%',
  },
  defaultImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 80, // Ajusta la altura según sea necesario
    borderRadius: 10,
  },
  /*  */
  description: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: 'orange',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ListsPets;
