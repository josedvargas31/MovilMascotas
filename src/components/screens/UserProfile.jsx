import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axiosClient from '../client/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../organismos/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [fotoUrl, setFotoUrl] = useState('');

    const fetchProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const user = await AsyncStorage.getItem('user');
            const id_usuario = JSON.parse(user).id_usuario;
            const response = await axiosClient.get(`/usuarios/perfil/${id_usuario}`, {
                headers: { token: token }
            });
            if (response.status === 200) {
                const userProfile = response.data[0];
                setProfileData(userProfile);
                const imageUrl = userProfile.img
                    ? `${axiosClient.defaults.baseURL}/uploads/${userProfile.img}`
                    : null;
                console.log('Foto URL:', imageUrl); // Verifica el URL de la imagen
                setFotoUrl(imageUrl);
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user'); // Remove user data from AsyncStorage
            Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
            navigation.navigate('Inicio');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [])
    );

    if (!profileData) {
        return <Text>Cargando...</Text>; // Muestra mensaje de carga mientras se obtienen los datos
    }

    return (
        <View style={styles.container}>
            <Header title="Perfil de usuario" />
            {/* <TouchableOpacity style={styles.iconProfile}> */}
            <View style={styles.avatarContainer}>
                {fotoUrl ? (
                    <Image
                        source={{ uri: fotoUrl }}
                        style={styles.avatar}
                    // onError={() => console.error('Error loading image')} // Manejo de errores
                    />
                ) : (
                    <FontAwesome name="user-circle-o" size={150} style={styles.icon} />
                )}
            </View>
            {/* </TouchableOpacity> */}
            <View style={styles.containerDataProfile}>
                <TouchableOpacity style={styles.dataProfile}>
                    <FontAwesome name="user" size={20} style={styles.icon} />
                    <Text style={styles.datatxt}>{profileData.rol}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dataProfile}>
                    <FontAwesome name="grav" size={20} style={styles.icon} />
                    <Text style={styles.datatxt}>{profileData.nombre} {profileData.apellidos}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dataProfile}>
                    <FontAwesome name="envelope-open" size={20} style={styles.icon} />
                    <Text style={[styles.datatxt, styles.datatxtemail]}>{profileData.correo}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.OptionsProfile}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('UpdatePerfil')}
                >
                    <Text style={styles.buttonText}>Editar perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    /* Estilos de Profile */
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        // Otros estilos según sea necesario
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 100,
    },
    iconProfile: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        marginTop: 50,
    },
    nameProfile: {
        fontWeight: '600',
        fontSize: 24,
        color: '#000',
        marginVertical: 20,
    },
    /* datos del Profile */
    containerDataProfile: {
        marginBottom: 30,
    },
    dataProfile: {
        flexDirection: 'row',
        marginLeft: 20,
        marginVertical: 10,
    },
    datatxt: {
        fontWeight: '500',
        color: '#000',
        fontSize: 18,
    },
    datatxtemail: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',

    },
    /* Opciones de Profile */
    OptionsProfile: {
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        width: 150,
        height: 50,
        backgroundColor: '#F7B318',
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    icon: {
        marginRight: 10,
        color: '#F7B318',
        /* backgroundColor: '#F7B318', */
    },
});

export default UserProfile;

