import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import axios from 'axios';
import { ip } from '../IP.jsx';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";
import axiosClient from "../axiosClient.js";

const InicioSesion = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // const axiosInstance = axios.create({
  //   baseURL: `http://${ip}:3000`,
  //   timeout: 15000, // Aumenta el tiempo de espera a 15 segundos
  // });

  const Validacion = async () => {
    console.log(formData);
    try {
      const response = await axiosClient.post('/validacion', formData);

      const { token } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user[0]));

      const storedUser = await AsyncStorage.getItem('user');
      const user = JSON.parse(storedUser);
      const userRol = user.rol.toLowerCase();
      console.log(userRol);

      const tokenAsyng = await AsyncStorage.getItem('token');

      if (userRol === 'administrador') {
        navigation.navigate("LISTAR");
        console.log(tokenAsyng);
        Alert.alert('Bienvenido Admin');
      } else if (userRol === 'usuario') {
        navigation.navigate("LISTARINVITADO");
        console.log(tokenAsyng);
        Alert.alert('Bienvenido Invitado');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          Alert.alert('Usuario no registrado');
        } else {
          console.error('Error en la respuesta del servidor:', error.response.data);
          Alert.alert('Error del servidor', error.response.data.message || 'Error desconocido');
        }
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
        Alert.alert('Error de red', 'No se recibió respuesta del servidor. Por favor, verifica tu conexión.');
      } else {
        console.error('Error al configurar la solicitud:', error.message);
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSignup = () => {
    navigation.navigate("SIGNUP");
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={handleGoBack}>
          <Ionicons name={"arrow-back-outline"} size={25} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.headingText}>Hola, Bienvenido</Text>
          <Image source={require('../assets/logoperritosinfondo.png')} style={styles.logo} />
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={formData.correo}
              onChangeText={(text) => handleInputChange('correo', text)}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity onPress={toggleSecureEntry}>
              <SimpleLineIcons name={"eye"} size={20} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Olvidaste la Contraseña?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButtonWrapper} onPress={Validacion}>
            <Text style={styles.loginText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.accountText}>No tienes Cuenta?</Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.signupText}>Registrate!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default InicioSesion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    textAlign: "center"
  },
  logo: {
    height: 250,
    width: 250,
    marginLeft: 40
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    marginVertical: 10,
    borderColor: "#9E9E9E"
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  forgotPasswordText: {
    textAlign: "center",
    marginVertical: 10,
  },
  loginButtonWrapper: {
    borderRadius: 100,
    marginTop: 10,
    backgroundColor: "#FF5722"
  },
  loginText: {
    fontSize: 20,
    textAlign: "center",
    padding: 10,
    color: "#FDFEFE",
  },
  continueText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 5,
  },
});
