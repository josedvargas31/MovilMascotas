import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import logo from '../assets/logoperro.png';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate("LOGIN");
  };

  const handleSignup = () => {
    navigation.navigate("SIGNUP");
  };

  const handleGuest = () => {
    navigation.navigate("GUEST");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Purrfect Match</Text>
      <Text style={styles.subTitle}>
        Haz del mundo un lugar más feliz, adopta.
      </Text>
      <Image source={logo} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginContainer} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Inicio de Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registroContainer} onPress={handleSignup}>
          <Text style={styles.registroButtonText}>Registro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.guestContainer} onPress={handleGuest}>
          <Text style={styles.guestButtonText}>Entrar como Invitado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  logo: {
    height: 150,
    width: 150,
    marginTop: 30,
    marginBottom: 100,
  },
  title: {
    marginTop: 70,
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  subTitle: {
    fontSize: 18,
    marginTop: 20,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F39C12",
    borderRadius: 25,
    paddingVertical: 15,
    marginVertical: 20,
    width: "80%",
  },
  registroContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F39C12",
    borderRadius: 25,
    paddingVertical: 15,
    marginVertical: 5,
    width: "80%",
  },
  guestContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: 5,
    width: "80%",
  },
  loginButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",

  },
  registroButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  guestButtonText: {
    fontSize: 18,
    color: "#D35400",
    fontWeight: "bold",
    textDecorationLine: 'underline',
    textAlign: 'left',
  },
});
