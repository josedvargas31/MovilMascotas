import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import axiosClient from '../client/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import FormMascotas from '../moleculas/FormMascota';
import FormVacunas from '../moleculas/FormVacuna';
import Header from '../organismos/Header';
import MascotasContext from '../../context/MascotasContext.jsx';
import Icon from 'react-native-vector-icons/FontAwesome';
import ListPet from '../moleculas/ListPet';
import EstadoModal from '../organismos/EstadoModal';

const statusColorMap = {
  'En Adopcion': "#28a745",
  Urgente: "#FF0000",
  Reservado: "#ffc107",
  Adoptado: "#6c757d",
  Todos: "#007bff",
};

const statusOptions = [
  { name: "Todos", uid: "todos" },
  { name: "En Adopcion", uid: "En Adopcion" },
  { name: "Urgente", uid: "Urgente" },
  { name: "Reservado", uid: "Reservado" },
  { name: "Adoptado", uid: "Adoptado" },
];

const ListsPetsA = () => {
  const { mascotas, getMascotas } = useContext(MascotasContext);
  const [filterValue, setFilterValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [filteredPets, setFilteredPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisiblePet, setModalVisiblePet] = useState(false);
  const [modalVacunaVisible, setModalVacunaVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('create'); // Modo del modal de mascotas

  const [estadoModalVisible, setEstadoModalVisible] = useState(false); // Estado para controlar la visibilidad del EstadoModal
  const [selectedTitle, setSelectedTitle] = useState(''); // Estado para controlar el título del modal

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  useEffect(() => {
    filterPets();
  }, [filterValue, selectedStatus, mascotas]);

  const fetchPets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await getMascotas(); // Llama al contexto para obtener las mascotas
      setFilteredPets(mascotas);
    } catch (error) {
      setError('No se pudieron cargar las mascotas. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPets = () => {
    let filtered = mascotas;

    if (filterValue) {
      filtered = filtered.filter(pet =>
        pet.nombre_mascota.toLowerCase().includes(filterValue.toLowerCase()) ||
        pet.raza.toLowerCase().includes(filterValue.toLowerCase()) 
      );
    }

    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(pet => pet.estado === selectedStatus);
    }
    setFilteredPets(filtered);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalVisiblePet(false);
    setSelectedPet(null);
    fetchPets(); // Refresca la lista después de cerrar el modal
    console.log("Modal closed, selectedPet reset.");
  };

  const handleModalVacunaClose = () => {
    setModalVacunaVisible(false);
  };

  const handleSubmitMascota = async (formData) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        const response = await axiosClient.post('/mascotas/registrar', formData);
        if (response.status === 200) {
          Alert.alert('Exito', "Se registro con exito la mascota")
          fetchPets();
        } else {
          Alert.alert('Error', 'Error en el registro');
        }
      } else if (mode === 'update') {
        const response = await axiosClient.put(`/mascotas/actualizar/${selectedPet.id_mascota}`, formData);
        if (response.status === 200) {
          Alert.alert('Exito', "Se actualizo con exito la mascota")
          fetchPets();
        } else {
          Alert.alert('Error', 'Error al actualizar');
        }
      }
     
      // fetchPets();
      // Alert.alert('Éxito', `Mascota ${mode === 'create' ? 'registrada' : 'actualizada'} correctamente.`);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al registrar o actualizar la mascota.');
      console.log("Error al registrar mascota: ", error);
      
    } finally {
      setIsLoading(false);
      handleModalClose();
    }
  };

  const handleSubmitVacuna = async (formData) => {
    try {
      await axiosClient.post('/vacunas/registrar', formData);
      Alert.alert('Vacuna registrada con éxito.');
      fetchPets();
    } catch (error) {
      Alert.alert('Error', 'Error en el registro');
    }
    handleModalVacunaClose();
  };

  const handleDeletePet = async (id_mascota) => {
    try {
      await axiosClient.delete(`/mascotas/eliminar/${id_mascota}`);
      Alert.alert('Éxito', 'Mascota eliminada correctamente.');
      /* fetchPets(); */
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al eliminar la mascota.');
    }
    /* filterPets(); */
    handleModalClose();
    fetchPets();
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
          onPress={() => handleEstadoChipPress(item.estado)} 
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
        <Text style={styles.description}>Descripción: {item.descripcion}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedPet(item);
              setMode('update');
              setModalVisible(true);
            }}
            style={styles.iconButton}
          >
            <Icon name="edit" size={25} color="orange"  />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Confirmación',
                '¿Estás seguro de que deseas eliminar esta mascota?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', onPress: () => handleDeletePet(item.id_mascota) },
                ]
              );
            }}
            style={styles.iconButton}
          >
            <Icon name="trash" size={25} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.iconButton}
          onPress={() => { setSelectedPet(item); setModalVisiblePet(true); }}
        >
          <Icon name="eye" size={25} color="purple" />
        </TouchableOpacity>
        </View>
      </View>
       <ListPet visible={modalVisiblePet} onClose={handleModalClose} pet={selectedPet} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Lista de mascotas" />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar..."
        value={filterValue}
        onChangeText={setFilterValue}
        placeholderTextColor="#666" 
      />
      <View style={styles.dropdownContainer}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.uid}
            style={styles.dropdownOption}
            onPress={() => setSelectedStatus(option.uid)}
          >
            <Text style={styles.dropdownText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => {
            setMode('create');
            setModalVisible(true);
          }}
        >
          <Text style={styles.registerButtonText}>Registrar Mascota</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonV}
          onPress={() => setModalVacunaVisible(true)}
        >
          <Text style={styles.registerButtonText}>Registrar Vacuna</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredPets.length === 0 ? (
        <Text style={styles.noDataText}>No hay mascotas para mostrar.</Text>
      ) : (
        <FlatList
          data={filteredPets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item.id_mascota.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          key={`${selectedStatus}-${filterValue}`}
        />
      )}
  
      {/* Modal para Registrar/Actualizar Mascota */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentM}>
            <Text style={styles.modalTitle}>
              {mode === 'create' ? 'Registrar Mascota' : 'Actualizar Mascota'}
            </Text>
            <FormMascotas
              initialData={selectedPet} // Pasa los datos iniciales de la mascota
              mode={mode}
              handleSubmit={handleSubmitMascota}
              onClose={handleModalClose}
              actionLabel={mode === 'create' ? 'Registrar' : 'Actualizar'}
            />
          </View>
        </View>
      </Modal>
  
      {/* Modal para Registrar Vacuna */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVacunaVisible}
        onRequestClose={handleModalVacunaClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentV}>
            <Text style={styles.modalTitle}>Registrar Vacuna</Text>
            <FormVacunas
              initialData={selectedPet}
              mode="create"
              handleSubmit={handleSubmitVacuna}
              onClose={handleModalVacunaClose}
              actionLabel="Registrar"
            />
          </View>
        </View>
      </Modal>
  
      {/* Modal para Estado */}
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
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  dropdownOption: {
    padding: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  dropdownText: {
    color: '#007bff',
  },
  registerButton: {
    padding: 10,
    margin: 5,
    backgroundColor: 'orange',
    borderRadius: 4,
    marginVertical: 4,
  },
  registerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between', // Espacio entre tarjetas
    marginBottom: 12,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    flex: 1,
    margin: 4,
    width: 175, // Asegúrate de que el ancho de las tarjetas permita dos columnas
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
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
    height: 80, // Ajusta la altura según sea necesario
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12, // Espacio entre la descripción y los íconos
  },
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
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 8, // Espacio entre los íconos
  },
  buttonM: {
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 4,
    marginVertical: 4,
  },
  buttonV: {
    padding: 10,
    backgroundColor: 'purple',
    borderRadius: 4,
    marginVertical: 4,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentM: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalContentV: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ListsPetsA;