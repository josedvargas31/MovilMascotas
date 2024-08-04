import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { ip } from '../IP.jsx';
import { useNavigation } from '@react-navigation/native';

const Listar = () => {
  const [mascota, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMascotas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${ip}:3000/mascotas/listarmascota`);
      setMascotas(response.data);
    console.log("datos de la mascotas ",mascota[0].foto);

    } catch (error) {
      console.error('Error fetching mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  const navigation = useNavigation();

  const handleRegistro = () => {
    navigation.navigate("RegistroMascota");
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
       <TouchableOpacity style={styles.button} onPress={handleRegistro}>
          <Text style={styles.buttonText}>Registro</Text>
        </TouchableOpacity>
      <View style={styles.container}>
        <FlatList
          data={mascota}
          keyExtractor={item => item.id.toString()}          
          renderItem={({ item }) => (

            <View style={styles.card}>
              <Image
              source={{uri: `http://${ip}:3000/img/${item.foto}`}}
              onError={(error) => console.log("Error al cargarla imagen", error)}
              style={styles.imagen}
              />
              <Text style={styles.title}>{item.nombre_mascota}</Text>
              <Text>Edad:{item.edad} años</Text>
              <Text>Desripción:{item.descripcion}</Text>
              <Text>Peso:{item.peso}Kg</Text>
              <Text>Esterelizada:{item.esterilizacion}</Text>
              <Text>Desparacitación{item.desparacitacion}</Text>
              <Text>Genero:{item.genero}</Text>
              <Text>Categoria:{item.id}</Text>
              <Text>Raza:{item.id_raza}</Text>
              <Text>ID Usuario: {item.id_usuario}</Text>
              <Text>Estado: {item.estado}</Text>
            </View>
          )}
        />
       
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color:'gray'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FDFEFE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagen:{
    marginBottom:10,
    width:100,
    height:100
  }
});

export default Listar;
