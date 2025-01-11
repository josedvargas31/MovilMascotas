import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Modal as RNModal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '../client/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Tooltip } from 'react-native-elements';

const ListPet = ({ visible, onClose, pet, refreshPets }) => {
  const navigation = useNavigation();

  const [vacunas, setVacunas] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const user = AsyncStorage.getItem('user');
  // const parsedUser = user ? JSON.parse(user) : null;
  // Convertir las imágenes a un array
  const imagesArray = pet && pet.imagenes ? pet.imagenes.split(',') : [];

  // Estado para la imagen principal
  const [mainImage, setMainImage] = useState(
    imagesArray.length > 0
      ? `${axiosClient.defaults.baseURL}/uploads/${imagesArray[0]}`
      : 'https://nextui.org/images/hero-card-complete.jpeg'
  );

  useEffect(() => {
    if (pet && pet.imagenes) {
      // Convertir las imágenes a un array si es necesario
      const imagesArray = typeof pet.imagenes === 'string' ? pet.imagenes.split(',') : pet.imagenes;

      // Asegurarse de que el array tenga elementos
      if (Array.isArray(imagesArray) && imagesArray.length > 0) {
        setMainImage(`${axiosClient.defaults.baseURL}/uploads/${imagesArray[0]}`);
      } else {
        setMainImage('https://nextui.org/images/hero-card-complete.jpeg');
      }
    } else {
      setMainImage('https://nextui.org/images/hero-card-complete.jpeg');
    }
  }, [pet]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;
        if (!parsedUser || parsedUser.rol === 'invitado') {
          setIsGuest(true);
        }
      } catch (error) {
        console.error('Error al verificar el rol del usuario:', error);
      }
    };
    checkUserRole();
  }, []);

  useEffect(() => {
    if (pet && pet.id_mascota) {
      const fetchVacunas = async () => {
        try {
          // Limpia el estado de vacunas antes de hacer la nueva solicitud
          setVacunas([]);

          const response = await axiosClient.get(`/vacunas/listarVacunasAsociadaAMascota/${pet.id_mascota}`);
          setVacunas(response.data);
          console.log("Datos de la mascota y vacuna: ", response.data);
          console.log("Datos de la mascota: ", pet);
        } catch (error) {
          // console.error('Error al listar vacunas:', error);
        }
      };
      fetchVacunas();
    } else {
      // Si no hay una mascota seleccionada, limpia las vacunas
      setVacunas([]);
    }
  }, [pet]);


  const handleAdoptar = async () => {
    if (isGuest) {
      Alert.alert(
        'Advertencia',
        'Debes Iniciar sesión para adoptar una mascota.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ok', onPress: () => navigation.navigate('Inicio') }
        ]
      );
      return;
    }
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const id_usuario = parsedUser ? parsedUser.id_usuario : null;

      const response = await axiosClient.post(`/adopciones/iniciar/${pet.id_mascota}`, { id_usuario });
      if (response.status === 200) {
        Alert.alert('Éxito', 'Mascota puesta en proceso de adopción');
        if (refreshPets) refreshPets();
        onClose();
      } else {
        Alert.alert('Error', 'Error al poner en proceso de adopción');
      }
    } catch (error) {
      console.error('Error al iniciar adopción:', error);
      Alert.alert('Error', 'Error al poner en proceso de adopción');
    }
  };

  // Verifica si pet es null o undefined
  if (!pet) {
    return;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();

    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }

    if (today.getDate() < birth.getDate()) {
      ageMonths--;
      if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
      }
    }

    return { years: ageYears, months: ageMonths };
  };
  const peso = parseFloat(pet.peso);

  // Calcula la edad
  const { years, months } = calculateAge(pet.fecha_nacimiento);
  return (
    <RNModal visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Información detallada de la mascota */}
            <View style={styles.header}>
              <Image
                source={{ uri: mainImage }}
                style={styles.petImage}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.petName}>{pet ? pet.nombre_mascota : 'Nombre desconocido'}</Text>
                <View style={styles.adoptionStatusContainer}>
                  <Text style={styles.adoptionStatus}>
                    {pet && (pet.estado === 'En Adopcion' || pet.estado === 'Urgente')
                      ? 'En Adopción'
                      : 'Estado no disponible'}
                  </Text>
                  <Icon name="star" size={20} color="#FFD700" style={styles.adoptionIcon} />
                </View>
                <Text style={styles.location}>
                  <Icon name="place" size={16} color="#FF6347" /> {pet ? pet.municipio || 'Ubicación desconocida' : 'Ubicación desconocida'}
                </Text>
              </View>
            </View>

            {/* Fotos adicionales */}
            {imagesArray.length > 0 && (
              <View style={styles.photosContainer}>
                <Text style={styles.morePhotosText}>Fotos</Text>
                <View style={styles.photosRow}>
                  {imagesArray.map((image, index) => (
                    <TouchableOpacity key={index} onPress={() => setMainImage(`${axiosClient.defaults.baseURL}/uploads/${image}`)}>
                      <Image
                        source={{ uri: `${axiosClient.defaults.baseURL}/uploads/${image}` }}
                        style={styles.smallImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}


            {/* Detalles */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Mis datos</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailsColumn}>
                  <Tooltip
                    popover={<Text>Raza del mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="pets" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{pet.raza}</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Edad de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="calendar-today" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{years} Años y {months} Meses</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Peso de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="fitness-center" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{peso} kg</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Departamento de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="place" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{pet.departamento}</Text>
                    </View>
                  </Tooltip>
                </View>

                <View style={styles.detailsColumn}>
                  <Tooltip
                    popover={<Text>Sexo de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon
                        name={pet.sexo === 'Macho' ? 'male' : 'female'}
                        size={20}
                        color={pet.sexo === 'Macho' ? '#00BFFF' : '#FF69B4'}
                        style={styles.genderIcon}
                      />
                      <Text style={styles.dataText}>{pet.sexo}</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Estado de esterilización de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="add-box" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{pet.esterilizado}</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Tamaño de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="filter-tilt-shift" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{pet.tamano}</Text>
                    </View>
                  </Tooltip>

                  <Tooltip
                    popover={<Text>Categoría de la mascota</Text>}
                    containerStyle={styles.tooltipContainer}
                    pointerColor="#f0f3f4"
                  >
                    <View style={styles.dataRow}>
                      <Icon name="pets" size={20} color="#FFA500" />
                      <Text style={styles.dataText}>{pet.categoria}</Text>
                    </View>
                  </Tooltip>
                </View>
              </View>
            </View>

            {/* Descripción */}
            <Text style={styles.sectionTitle}>Descripción:</Text>
            <Text style={styles.modalDescription}>{pet.descripcion}</Text>

            {/* Sección de vacunas */}
            <Text style={styles.sectionTitle}>Vacunas:</Text>
            {vacunas.length > 0 ? (
              <View style={styles.vacunaRowContainer}>
                {vacunas.map((vacuna) => (
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

            {/* Botón para adoptar */}
            {user && user.rol !== 'superusuario' && (
              <>
                {(pet.estado !== 'Adoptado' && pet.estado !== 'Reservado') && (
                  <TouchableOpacity style={[styles.button, styles.adoptButton]} onPress={handleAdoptar}>
                    <Text style={styles.buttonText}>¡Adóptame!</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Botón para cerrar */}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    padding: 5,
    height: 50,
    width: 200,
    borderRadius: 5,
    backgroundColor: "#f0f3f4"
  },
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
    width: '95%',
    maxHeight: '95%',
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
  header: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  /*  */
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  adoptionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  adoptionStatus: {
    fontSize: 18,
    color: '#32CD32',
    marginRight: 5,
  },
  adoptionIcon: {
    marginLeft: 5,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
    marginBottom: 10,
  },

  photosContainer: {
    marginBottom: 15,

  },
  photosRow: {
    flexDirection: 'row',
    marginRight: 40,
  },
  smallImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  morePhotosText: {
    fontSize: 18,
    paddingBottom: 5,
    color: '#1E90FF',
  },
  /*  */
  detailsContainer: {
    marginTop: 15,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailsColumn: {
    width: '48%',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  vacunaRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  vacunaContainer: {
    marginBottom: 15,
    width: '50%',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  noVacunasText: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#cd6155',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  adoptButton: {
    backgroundColor: '#32CD32',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ListPet;
