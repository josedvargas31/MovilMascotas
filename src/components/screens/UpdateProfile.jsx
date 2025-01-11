import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import axiosClient from '../client/axiosClient';
import Header from '../organismos/Header';
import { Formik } from 'formik';
import * as yup from 'yup';

// Esquema de validación con yup
const validationSchema = yup.object().shape({
    tipo_documento: yup
        .string()
        .required('El tipo de documento es obligatorio'),
    documento_identidad: yup
        .string()
        .required('El documento de identidad es obligatorio')
        .matches(/^\d+$/, 'El documento de identidad debe ser numérico')
        .min(6, 'El documento de identidad debe contener como minimo 6 dígitos')
        .max(10, 'El documento de identidad debe contener como maximo 10 dígitos'),
    nombre: yup
        .string()
        .required('El nombre es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El nombre debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    apellido: yup
        .string()
        .required('El apellido es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El apellido debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    direccion: yup
        .string()
        .required('La dirección es obligatoria'),
    correo: yup
        .string()
        .email('El correo electrónico debe ser válido')
        .required('El correo electrónico es obligatorio'),
    telefono: yup
        .string()
        .required('El teléfono es obligatorio')
        .matches(/^\d*$/, 'El teléfono debe ser numérico')
        .min(10, 'El teléfono debe contener exactamente 10 dígitos'),
    password: yup
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(16, 'La contraseña no puede tener más de 16 caracteres')
        .required('La contraseña es obligatoria'),
});

const UpdateProfile = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
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
                    setUserData(userProfile);
                    const imageUrl = userProfile.img
                        ? `${axiosClient.defaults.baseURL}/uploads/${userProfile.img}`
                        : null;
                    console.log('Foto URL:', imageUrl); // Verifica el URL de la imagen
                    setFotoUrl(imageUrl);
                } else {
                    Alert.alert("Error", response.data.message);
                }
            } catch (error) {
                Alert.alert("Error", "Error fetching profile data: " + error.message);
            }
        };

        fetchProfileData();
    }, []);

    const handleSave = async (values) => {
        try {
            const id_usuario = userData.id_usuario;
            const updatedValues = { ...values };
            console.log("Id usuario: ", id_usuario);
            console.log("Datos a actualizar: ", updatedValues); // Log de los datos a enviar

            // Si la contraseña sigue siendo los 8 asteriscos, no la enviamos al backend
         
            // Crear un objeto FormData
            const formData = new FormData();
            formData.append('nombre', updatedValues.nombre);
            formData.append('apellido', updatedValues.apellido);
            formData.append('correo', updatedValues.correo);
            formData.append('telefono', updatedValues.telefono);
            formData.append('direccion', updatedValues.direccion);
            formData.append('tipo_documento', updatedValues.tipo_documento);
            formData.append('documento_identidad', updatedValues.documento_identidad);
            formData.append('rol', updatedValues.rol);

            if (values.password !== '********') {
                formData.append('password', updatedValues.password); // Enviar la nueva contraseña
            } 
            // Si se seleccionó una nueva foto, añadirla al FormData
            if (foto) {
                formData.append('img', {
                    uri: foto.uri,
                    name: foto.fileName || 'photo.jpg', // Asignar un nombre por defecto
                    type: foto.type || 'image/jpeg', // Asignar un tipo por defecto
                });
            }

            const response = await axiosClient.put(`/usuarios/actualizar/${id_usuario}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Asegurarse de que el tipo de contenido sea multipart/form-data
                },
            });
            console.log("Respuesta del servidor: ", response.data); // Log de la respuesta

            if (response.status === 200) {
                Alert.alert("Éxito", response.data.message);
                navigation.navigate('UserProfile', { refresh: true });
            } else {
                Alert.alert("Error", response.data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Error al actualizar los datos: " + error.message);
            console.log("Error al actualizar: ", error.message);
        }
    };


    const handleImageChange = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };
        launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const file = response.assets[0];
                setFoto(file);
                setFotoUrl(file.uri);
            }
        });
    };

    if (!userData) {
        return <Text>Cargando...</Text>;
    }

    return (
        <View style={styles.container}>
            <Header title="Perfil de usuario" />
            <ScrollView>
                <TouchableOpacity style={styles.iconProfile}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleImageChange}>
                        {fotoUrl ? (
                            <Image
                                source={{ uri: fotoUrl }}
                                style={styles.avatar}
                            />
                        ) : (
                            <FontAwesome name="user-circle-o" size={100} style={styles.icon} />
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>

                <Formik
                    initialValues={{
                        nombre: userData.nombre || '',
                        apellido: userData.apellido || '',
                        correo: userData.correo || '',
                        telefono: userData.telefono || '',
                        direccion: userData.direccion || '', // Campo agregado
                        tipo_documento: userData.tipo_documento || '', // Campo agregado
                        documento_identidad: userData.documento_identidad || '', // Campo agregado
                        password: '********',  // Muestra 8 asteriscos por defecto
                        rol: userData.rol || ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => handleSave(values)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            <View style={styles.containerDataProfile}>
                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="user" size={25} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.nombre}
                                        placeholder="Nombre"
                                        onChangeText={handleChange('nombre')}
                                        onBlur={handleBlur('nombre')}
                                    />
                                </TouchableOpacity>
                                {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="user" size={25} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.apellido}
                                        placeholder="Apellido"
                                        onChangeText={handleChange('apellido')}
                                        onBlur={handleBlur('apellido')}
                                    />
                                </TouchableOpacity>
                                {touched.apellido && errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="envelope-open" size={20} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.correo}
                                        placeholder="Correo electrónico"
                                        onChangeText={handleChange('correo')}
                                        onBlur={handleBlur('correo')}
                                        keyboardType="email-address"
                                    />
                                </TouchableOpacity>
                                {touched.correo && errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="phone" size={20} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.telefono}
                                        placeholder="Teléfono"
                                        onChangeText={handleChange('telefono')}
                                        onBlur={handleBlur('telefono')}
                                        keyboardType="numeric"
                                    />
                                </TouchableOpacity>
                                {touched.telefono && errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="home" size={25} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.direccion}
                                        placeholder="Dirección"
                                        onChangeText={handleChange('direccion')}
                                        onBlur={handleBlur('direccion')}
                                    />
                                </TouchableOpacity>
                                {touched.direccion && errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}

                                {/* <Text style={styles.pickerLabel}>Tipo de Documento:</Text> */}
                                <View style={styles.pickerContainer}>
                                    <FontAwesome name="file" size={25} style={styles.iconSelect} />
                                    <RNPickerSelect
                                        onValueChange={(value) => handleChange('tipo_documento')(value)}
                                        items={[
                                            { label: 'Tarjeta', value: 'tarjeta' },
                                            { label: 'Cédula', value: 'cedula' },
                                            { label: 'Tarjeta de Extranjería', value: 'tarjeta de extranjeria' },
                                        ]}
                                        value={values.tipo_documento}
                                        placeholder={{ label: 'Seleccione un tipo de documento', value: null }}
                                        style={pickerSelectStyles}
                                    />
                                </View>
                                {touched.tipo_documento && errors.tipo_documento && <Text style={styles.errorText}>{errors.tipo_documento}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="id-card" size={25} style={styles.icon} />
                                    <TextInput
                                        style={[styles.datatxt, styles.input]}
                                        value={values.documento_identidad}
                                        placeholder="Documento de identidad"
                                        onChangeText={handleChange('documento_identidad')}
                                        onBlur={handleBlur('documento_identidad')}
                                        keyboardType="numeric"
                                    />
                                </TouchableOpacity>
                                {touched.documento_identidad && errors.documento_identidad && <Text style={styles.errorText}>{errors.documento_identidad}</Text>}

                                <TouchableOpacity style={styles.dataProfile}>
                                    <FontAwesome name="lock" size={25} style={styles.icon} />
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={[styles.datatxt, styles.input]}
                                            value={values.password}
                                            placeholder="Contraseña"
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            secureTextEntry={!showPassword} // Alternar visibilidad
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <FontAwesome
                                                name={showPassword ? 'eye' : 'eye-slash'}
                                                size={20}
                                                style={{ color: '#666', marginHorizontal: 10 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                            </View>

                            <View style={styles.OptionsProfile}>
                                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                    <Text style={styles.buttonText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Formik>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eye: {
        marginLeft: 10
    },
    /* Estilos de Profile */
    iconProfile: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        marginTop: 10,
    },
    nameProfile: {
        fontWeight: '600',
        fontSize: 24,
        color: '#000',
        marginVertical: 20,
    },
    /* datos del Profile */
    containerDataProfile: {
        marginBottom: 10,
    },
    dataProfile: {
        flexDirection: 'row',
        marginLeft: 20,
        marginVertical: 10,
        alignItems: 'center',
    },
    datatxt: {
        fontWeight: '500',
        color: '#000',
        fontSize: 18,
    },
    input: {
        width: '80%',
        height: 50,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F7B318',
        borderRadius: 5,
        paddingHorizontal: 10,
        color: '#000',
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
        alignItems: 'center',
        marginRight: 10,
        color: '#F7B318',

    },
    pickerContainer: {
        flexDirection: 'row',  // Cambiado a 'row' para alinear horizontalmente
        alignItems: 'center',   // Alinea verticalmente en el centro
        marginBottom: 20,
    },
    iconSelect: {
        marginLeft: 20,        // Espacio entre el icono y el selector
        color: '#F7B318',
    },
    pickerLabel: {
        fontSize: 16,
        marginHorizontal: 30,
        marginBottom: 5,
    },
});
// Estilos para el RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        flex: 1,                 // Permite que ocupe el espacio restante
        minWidth: 150,           // Ancho mínimo para evitar el problema de "solo ^"
    },
    inputAndroid: {
        width: '80%',            // Ocupar el 80% del ancho
        height: 50,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F7B318',
        borderRadius: 5,
        paddingHorizontal: 10,
        color: '#000',
        flex: 1,                 // Permite que ocupe el espacio restante
        minWidth: 320,           // Ancho mínimo para evitar el problema de "solo ^"
    },
});

export default UpdateProfile;
