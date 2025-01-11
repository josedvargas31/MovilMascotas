import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import axiosClient from '../client/axiosClient';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import { Formik } from 'formik';
import * as yup from 'yup';

// Definir el esquema de validación con yup
const validationSchema = yup.object().shape({
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
        .min(10, 'El teléfono debe contener exactamente 10 dígitos')
        .max(10, 'El teléfono debe contener exactamente 10 dígitos'),
    tipo_documento: yup
        .string()
        .required('El tipo de documento es obligatorio'),
    documento_identidad: yup
        .string()
        .required('El documento de identidad es obligatorio')
        .matches(/^\d+$/, 'El documento de identidad debe ser numérico')
        .min(6, 'El documento de identidad debe contener como minimo 6 dígitos')
        .max(10, 'El documento de identidad debe contener como maximo 10 dígitos'),

    password: yup
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(16, 'La contraseña no puede tener más de 16 caracteres')
        .required('La contraseña es obligatoria'),
    rol: yup
        .string()
        .required('El rol es obligatorio'),
});

const FormUser = ({ navigation }) => {
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [isVisible, setIsVisible] = useState(false);

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

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <ScrollView>
                    <Formik
                        initialValues={{
                            nombre: '',
                            apellido: '',
                            direccion: '',
                            telefono: '',
                            correo: '',
                            tipo_documento: '',
                            documento_identidad: '',
                            password: '',
                            rol: 'usuario',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values) => {
                            try {
                                // Verificar si el correo ya está registrado
                                const { data: correoExiste } = await axiosClient.get(`/usuarios/verificar/correo/${values.correo}`);
                                if (correoExiste.existe) {
                                    Alert.alert('Error', 'El correo electrónico ya está registrado');
                                    return;
                                }

                                // Verificar si el documento de identidad ya está registrado
                                const { data: documentoExiste } = await axiosClient.get(`/usuarios/verificar/documento_identidad/${values.documento_identidad}`);
                                if (documentoExiste.existe) {
                                    Alert.alert('Error', 'El documento de identidad ya está registrado');
                                    return;
                                }
                                const formData = new FormData();
                                formData.append('nombre', values.nombre);
                                formData.append('apellido', values.apellido);
                                formData.append('direccion', values.direccion);
                                formData.append('telefono', values.telefono);
                                formData.append('correo', values.correo);
                                formData.append('tipo_documento', values.tipo_documento);
                                formData.append('documento_identidad', values.documento_identidad);
                                formData.append('password', values.password);
                                formData.append('rol', values.rol);

                                if (foto) {
                                    // Asegúrate de enviar la imagen correctamente con el campo de nombre esperado por el backend
                                    formData.append('img', {
                                        uri: foto.uri,
                                        name: foto.fileName || 'image.jpg',
                                        type: foto.type || 'image/jpeg'
                                    });
                                }

                                const response = await axiosClient.post('/usuarios/registrar', formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                });
                                console.log('Datos del registro del usuario', response);
                                Alert.alert('Éxito', 'Usuario registrado con éxito');
                                navigation.navigate('Inicio');
                            } catch (error) {
                                console.error('Error al procesar la solicitud:', error);
                                Alert.alert('Error', 'Error al registrar usuario, intente de nuevo');
                            }
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, setFieldValue }) => (
                            <>
                                <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                                    <Text style={styles.goBackText}>Volver</Text>
                                </TouchableOpacity>
                                <Text style={styles.title}>Registro</Text>
                                <TouchableOpacity style={styles.avatarContainer} onPress={handleImageChange}>
                                    <Image
                                        source={{ uri: fotoUrl || 'https://via.placeholder.com/150' }}
                                        style={styles.avatar}
                                    />
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su nombre"
                                    onChangeText={handleChange('nombre')}
                                    onBlur={handleBlur('nombre')}
                                    value={values.nombre}
                                    placeholderTextColor="#666"
                                />
                                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su apellido"
                                    onChangeText={handleChange('apellido')}
                                    onBlur={handleBlur('apellido')}
                                    value={values.apellido}
                                    placeholderTextColor="#666"
                                />
                                {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Dirección"
                                    onChangeText={handleChange('direccion')}
                                    onBlur={handleBlur('direccion')}
                                    value={values.direccion}
                                    placeholderTextColor="#666"
                                />
                                {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Teléfono"
                                    keyboardType="numeric"
                                    onChangeText={handleChange('telefono')}
                                    onBlur={handleBlur('telefono')}
                                    value={values.telefono}
                                    placeholderTextColor="#666"
                                />
                                {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo"
                                    keyboardType="email-address"
                                    onChangeText={handleChange('correo')}
                                    onBlur={handleBlur('correo')}
                                    value={values.correo}
                                    placeholderTextColor="#666"
                                />
                                {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

                                <View style={styles.pickerContainer}>
                                    <Text style={styles.pickerLabel}>Tipo de Documento:</Text>
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
                                        placeholderTextColor="#666"
                                    />
                                </View>
                                {errors.tipo_documento && <Text style={styles.errorText}>{errors.tipo_documento}</Text>}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Documento de Identidad"
                                    onChangeText={handleChange('documento_identidad')}
                                    onBlur={handleBlur('documento_identidad')}
                                    value={values.documento_identidad}
                                    placeholderTextColor="#666"
                                />
                                {errors.documento_identidad && <Text style={styles.errorText}>{errors.documento_identidad}</Text>}

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contraseña"
                                        secureTextEntry={!isVisible}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                        placeholderTextColor="#666"
                                    />
                                    <TouchableOpacity onPress={toggleVisibility}>
                                        <Icon name={isVisible ? 'eye' : 'eye-slash'} size={20} color="#000" style={styles.eyeIcon} />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                <View style={styles.pickerContainer}>
                                    <Text style={styles.input}>
                                        {values.rol}
                                    </Text>
                                </View>

                                <Button title="Registrar" onPress={handleSubmit} color="#f39c12" />
                            </>
                        )}
                    </Formik>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDEBDE',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        width: '100%',
        height: '100%',
        maxWidth: 400
    },
    goBackButton: {
        marginBottom: 1
    },
    goBackText: {
        color: '#007bff',
        fontSize: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginBottom: 20
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
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 15,
        padding: 10,
        color: '#000',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    eyeIcon: {
        marginLeft: 10
    },
    pickerContainer: {
        marginBottom: 15
    },
    pickerLabel: {
        fontSize: 16,
        marginBottom: 5
    }
});

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
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
});

export default FormUser;
