import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ip } from '../IP.jsx'; // Ajusta la ruta según tu estructura
import { SelectList } from 'react-native-dropdown-select-list';
import { launchImageLibrary } from 'react-native-image-picker';

const FormularioMascota = ({ closeModal }) => {
  const [genero, setGenero] = useState([]);
  const [razas, setRazas] = useState([]);
  const [foto, setFoto] = useState('https://images.unsplash.com/broken');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    raza: '',
    edad: '',
    descripcion: '',
    estado: 'adoptar',
    genero: ''
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const generoResponse = await axios.get(`http://${ip}:3000/generos`);
        const razasResponse = await axios.get(`http://${ip}:3000/razas`);

        setGenero(generoResponse.data.map(item => ({ key: item.value, value: item.label })));
        setRazas(razasResponse.data.map(item => ({ key: item.value, value: item.label })));
      } catch (error) {
        console.error('Error fetching options', error);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    return Object.values(formData).every(field => field !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Por favor complete todos los campos');
      return;
    }

    try {
      const baseURL = `http://${ip}:3000/mascotas/registrar`;
      const token = await AsyncStorage.getItem('token');

      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach(key => formDataToSubmit.append(key, formData[key]));

      if (selectedImage) {
        const uriParts = selectedImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formDataToSubmit.append('img', {
          uri: selectedImage.uri,
          name: `foto.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      await axios.post(baseURL, formDataToSubmit, {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Mascota registrada exitosamente');
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error al registrar mascota. Por favor, revisa la consola para más detalles.');
    }
  };

  const openLib = () => {
    launchImageLibrary({}, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección de imagen');
      } else if (response.errorCode) {
        console.log('Error de selección de imagen: ', response.errorCode);
      } else {
        const { uri } = response.assets[0];
        setFoto(uri);
        setSelectedImage(response.assets[0]);
      }
    });
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Foto</Text>
      <View style={styles.imageContainer}>
        <Image resizeMode='contain' style={styles.img} source={{ uri: foto }} />
        <TouchableOpacity onPress={openLib} style={styles.btnCam}>
          <Text style={styles.text}>Seleccione la foto</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={formData.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
      />
      <Text style={styles.label}>Edad</Text>
      <TextInput
        style={styles.input}
        value={formData.edad}
        onChangeText={(text) => handleChange('edad', text)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        value={formData.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
      />
      <Text style={styles.label}>Raza</Text>
      <SelectList
        setSelected={(value) => handleChange('raza', value)}
        data={razas}
        defaultOption={{ key: formData.raza, value: razas.find(m => m.key === formData.raza)?.value }}
      />
      <Text style={styles.label}>Género</Text>
      <SelectList
        setSelected={(value) => handleChange('genero', value)}
        data={genero}
        defaultOption={{ key: formData.genero, value: genero.find(m => m.key === formData.genero)?.value }}
      />
      <Text style={styles.label}>Estado</Text>
      <SelectList
        setSelected={(value) => handleChange('estado', value)}
        data={[
          { key: 'adoptar', value: 'Adoptar' },
          { key: 'adoptada', value: 'Adoptada' },
          { key: 'proceso adopcion', value: 'En proceso de adopción' }
        ]}
        defaultOption={{ key: formData.estado, value: ['adoptar', 'adoptada', 'proceso adopcion'].find(m => m === formData.estado) }}
      />
      <Button title="Registrar Mascota" onPress={handleSubmit} />
      <Button title="Cancelar" onPress={closeModal} color="#f00" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Agrega aquí tus estilos
});

export default FormularioMascota;
