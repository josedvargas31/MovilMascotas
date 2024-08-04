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
import Header from '../organisms/Header';
import ListPet from '../molecules/ListPet';
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect

const statusColorMap = {
  adoptar: "#28a745",
  adoptada: "#6c757d",
  'proceso adopcion': "#ffc107",
  todos: "#007bff",
};

const statusOptions = [
  { name: "Todos", uid: "todos" },
  { name: "Adoptar", uid: "adoptar" },
  { name: "Proceso Adopcion", uid: "proceso adopcion" },
  { name: "Adoptada", uid: "adoptada" },
];

const ListsPetsU = ({ navigation }) => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
 // Lógica que se ejecuta cada vez que la pantalla se enfoca (cada vez que se navega hacia esa pantalla)
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
      const response = await axiosClient.get('/mascota/listar');
      setPets(response.data);
      setFilteredPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
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

    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(pet => pet.estado === selectedStatus);
    }

    setFilteredPets(filtered);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedPet(null);
    fetchPets(); // Refresca la lista después de cerrar el modal
  };

  const renderPetCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Nombre: {item.nombre}</Text>
        <Text style={styles.subtitle}>Género: {item.genero}</Text>
        <Text style={styles.subtitle}>Raza: {item.raza}</Text>
        <View style={[styles.statusChip, { backgroundColor: statusColorMap[item.estado] }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
        <Image
          source={{ uri: item.img ? `${axiosClient.defaults.baseURL}/uploads/${item.img}` : 'https://nextui.org/images/hero-card-complete.jpeg' }}
          style={styles.image}
        />
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
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        value={filterValue}
        onChangeText={setFilterValue}
      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
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
  },
  subtitle: {
    fontSize: 16,
  },
  statusChip: {
    padding: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  statusText: {
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
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

export default ListsPetsU;
