import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosClient from '../axiosClient';
import Header from '../organisms/Header';


const UserForm = ({ closeModal, title, datos, userData, userId }) => {

    /* const route = useRoute();
    const { mode } = route.params; */
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        identificacion: userData ? userData.identificacion.toString() : '',
        nombre: userData ? userData.nombre : '',
        apellido: userData ? userData.apellido : '',
        correo: userData ? userData.correo : '',
        password: userData ? userData.password : '',
        telefono: userData ? userData.telefono : '',
    });
    console.log(formData);

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };



    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('identificacion', formData.identificacion);
            data.append('nombre', formData.nombre);
            data.append('apellido', formData.apellido);
            data.append('correo', formData.correo);
            data.append('password', formData.password);
            data.append('telefono', formData.telefono);

            await axiosClient.post('/registrarVisitante', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then((response) => {
                if (response.status == 201) {
                    Alert.alert('Usuario registrado correctamente');
                    navigation.navigate('LOGIN');
                    datos()
                    closeModal()
                } else {
                    Alert.alert('Error al registrar el usuario');
                }
            });
        } catch (error) {
            console.log('Error en el servidor en la vista de registro', error);
        }
    };

    const handleActualizar = async () => {
        try {

            const data = new FormData();
            data.append('identificacion', formData.identificacion);
            data.append('nombre', formData.nombre);
            data.append('apellido', formData.apellido);
            data.append('correo', formData.correo);
            data.append('password', formData.password);
            data.append('telefono', formData.telefono);

            await axiosClient.put(`/actualizar/${userId}`, data, {

            }).then((response) => {
                if (response.status == 201) {
                    Alert.alert('Usuario registrado correctamente');
                    navigation.navigate('LOGIN');
                    datos()
                    closeModal()
                } else {
                    Alert.alert('Error al registrar el usuario');
                }
            });
        } catch (error) {

        }
    }

    return (
        <View style={styles.container}>
            <Header title="Lista de mascotas" />
            <ScrollView>
                <View>
                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Identificación: </Text>
                        <TextInput style={styles.inputs} value={formData.identificacion} onChangeText={(value) => handleChange('identificacion', value)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Nombre: </Text>
                        <TextInput style={styles.inputs} value={formData.nombre} onChangeText={(value) => handleChange('nombre', value)} />
                    </View>

                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Apellido: </Text>
                        <TextInput style={styles.inputs} value={formData.apellido} onChangeText={(value) => handleChange('apellido', value)} />
                    </View>

                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Correo electrónico: </Text>
                        <TextInput style={styles.inputs} value={formData.correo} onChangeText={(value) => handleChange('correo', value)} />
                    </View>

                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Contraseña: </Text>
                        <TextInput style={styles.inputs} value={formData.password} onChangeText={(value) => handleChange('password', value)} secureTextEntry={true} />
                    </View>

                    <View style={styles.containerInput}>
                        <Text style={styles.texts}>Teléfono: </Text>
                        <TextInput style={styles.inputs} value={formData.telefono} onChangeText={(value) => handleChange('telefono', value)} />
                    </View>




                    <View style={styles.containerButton}>
                        <TouchableOpacity style={styles.button} onPress={title === 'Registrar' ? handleSubmit : handleActualizar}>
                            <Text style={styles.textButton}> {title} </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    containerInput: {
        width: 300,
        marginBottom: 10
    },
    inputs: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: '#333',
        padding: 10
    },
    texts: {
        fontSize: 20,
        margin: 5,
        fontWeight: '600'
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
        margin: 20
    },
    button: {
        backgroundColor: '#337FA9',
        padding: 10,
        borderRadius: 5,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 200
    },
    buttonImagePicker: {
        backgroundColor: '#6C757D',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textButton: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF'
    },
    containerButton: {
        width: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10
    }
});

export default UserForm;