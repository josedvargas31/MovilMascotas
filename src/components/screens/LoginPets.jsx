import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../client/axiosClient';

const LoginPets = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
      correo: '',
      password: '',
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureEntry = () => {
      setSecureTextEntry(!secureTextEntry);
  };

  useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
          if (!state.isConnected) {
              Alert.alert('Sin conexión', 'Por favor, verifica tu conexión a internet.');
          }
      });
      return () => unsubscribe();
  }, []);

  useFocusEffect(
      React.useCallback(() => {
          setFormData({ correo: '', password: '' });
      }, [])
  );

  const handleInputChange = (name, value) => {
      setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
      const { correo, password } = formData;
      if (!correo || !password) {
          Alert.alert('Error', 'Por favor, completa todos los campos.');
          return false;
      }
      return true;
  };

  const Validacion = async () => {
      if (!validateForm()) return;

      try {
          const response = await axiosClient.post('/validacion', formData);

          if (response.status === 200) {
              const { token, user } = response.data;
              const userData = user[0]; // Accede al primer elemento del array user

              await AsyncStorage.setItem('token', token); // Guarda el token en AsyncStorage
              await AsyncStorage.setItem('user', JSON.stringify(userData)); // Guarda la información del usuario en AsyncStorage

              // Navegar a diferentes pantallas basadas en el rol del usuario
              if (userData.rol === 'administrador') {
                  Alert.alert('Bienvenido Administrador.');
                  navigation.navigate('AdminMain');
              } else if (userData.rol === 'usuario') {
                  Alert.alert('Bienvenido Usuario.');
                  navigation.navigate('UserMain');
              } else {
                  Alert.alert('Error', 'Rol de usuario no reconocido.');
              }
          } else {
              Alert.alert('Error', 'Usuario no autorizado.');
          }
      } catch (error) {
          console.error('Error del servidor', error);
          Alert.alert('Error', 'Ocurrió un error en el servidor. Por favor, intenta nuevamente.');
      }
  };

  return (
      <ScrollView>
          <View style={styles.container}>
              <Text style={styles.title}>INICIAR SESIÓN</Text>
              <Image source={require('../../assets/logoprueba.png')} style={styles.logo} />

              <TextInput
                  placeholder="Ingrese su Correo Electronico"
                  style={styles.input}
                  placeholderTextColor="#666"
                  value={formData.correo}
                  onChangeText={(text) => handleInputChange('correo', text)}
              />

              <View style={styles.passwordContainer}>
                  <TextInput
                      style={styles.inputPassword}
                      placeholder="Ingrese su Contraseña"
                      placeholderTextColor="#666"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity
                      style={styles.eyeIconContainer}
                      onPress={toggleSecureEntry}
                  >
                      <Text style={{ color: '#006000' }}>
                          {secureTextEntry ? 'Mostrar' : 'Ocultar'}
                      </Text>
                  </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button} onPress={Validacion}>
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
              </TouchableOpacity>
          </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 70,
    color: '#000',
  },
  logo: {
    width: 250,
    height: 320,
    marginTop: 50,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#006000',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  inputPassword: {
    height: 50,
    borderWidth: 1,
    borderColor: '#006000',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000',
    width: '100%',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
  },
  button: {
    backgroundColor: '#F7B318',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 15,
    width: 180,
    height: 60,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginPets;
