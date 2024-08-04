import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Modal as RNModal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axiosClient from '../client/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

const ListPet = ({ visible, onClose, pet, refreshPets }) => { // Añadir refreshPets para actualizar la lista de mascotas
  const [vacunas, setVacunas] = useState([]);
  const [vacunasError, setVacunasError] = useState(null);

  useEffect(() => {
    const fetchVacunas = async () => {
      if (pet && pet.id_mascota) {
        try {
          const response = await axiosClient.get(`/vacuna/listar/${pet.id_mascota}`);
          if (response.status === 200) {
            setVacunas(response.data.data);
            setVacunasError(null);
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            setVacunasError('No hay vacunas asociadas a esta mascota.');
            setVacunas([]);
          } else {
            console.error('Error al listar vacunas:', error);
            setVacunasError('Error al listar vacunas.');
          }
        }
      }
    };

    fetchVacunas();
  }, [pet]);

  const handleAdoptar = async () => {
    try {
      const user = await AsyncStorage.getItem('user'); // Obtener el usuario de AsyncStorage
      const parsedUser = user ? JSON.parse(user) : null;
      const id_usuario = parsedUser ? parsedUser.id_usuario : null;

      const response = await axiosClient.post(`/mascota/iniciar/${pet.id_mascota}`, { id_usuario });
      if (response.status === 200) {
        Alert.alert('Éxito', 'Mascota puesta en proceso de adopción');
        if (refreshPets) refreshPets(); // Llamar a refreshPets si se proporciona para actualizar la lista de mascotas
        onClose(); // Cierra el modal
      } else {
        Alert.alert('Error', 'Error al poner en proceso de adopción');
      }
    } catch (error) {
      console.error('Error al iniciar adopción:', error);
      Alert.alert('Error', 'Error al poner en proceso de adopción');
    }
  };

  if (!pet) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <RNModal visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <Text style={styles.modalTitle}>Nombre: {pet.nombre}</Text>
            <Text style={styles.modalSubtitle}>Sexo: {pet.genero}</Text>
            <Text style={styles.modalSubtitle}>Raza: {pet.raza}</Text>
            <Image
              source={{ uri: pet.img ? `${axiosClient.defaults.baseURL}/uploads/${pet.img}` : 'https://nextui.org/images/hero-card-complete.jpeg' }}
              style={styles.modalImage}
            />
            <Text style={styles.modalSubtitle}>Especie: {pet.especie}</Text>
            <Text style={styles.modalSubtitle}>Edad: {pet.edad}</Text>
            <Text style={styles.modalSubtitle}>Esterilización: {pet.esterilizacion}</Text>
            <Text style={styles.modalDescription}>{pet.descripcion}</Text>
            <Text style={styles.modalTitle}>Vacunas:</Text>
            {vacunasError ? (
              <Text style={styles.noVacunasText}>{vacunasError}</Text>
            ) : vacunas.length > 0 ? (
              <View style={styles.vacunaRowContainer}>
                {vacunas.map((vacuna, index) => (
                  <View key={vacuna.id_vacuna} style={styles.vacunaContainer}>
                    <Text style={styles.modalSubtitle}>Enfermedad: {vacuna.enfermedad}</Text>
                    <Text style={styles.modalSubtitle}>Fecha: {formatDate(vacuna.fecha_vacuna)}</Text>
                    <Text style={styles.modalSubtitle}>Estado: {vacuna.estado}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noVacunasText}>No hay vacunas asociadas a esta mascota.</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={[styles.button, styles.adoptButton]} onPress={handleAdoptar}>
            <Text style={styles.buttonText}>¡Adóptame!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    marginVertical: 5,
  },
  modalImage: {
    width: '100%',
    height: 350,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  vacunaRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vacunaContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    width: '48%', // Ajustar el ancho para filas de dos en dos
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  adoptButton: {
    backgroundColor: 'orange',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noVacunasText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default ListPet;
