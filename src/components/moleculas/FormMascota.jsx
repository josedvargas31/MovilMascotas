import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import axiosClient from '../client/axiosClient.js';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
    nombre_mascota: yup
        .string()
        .required('El nombre_mascota es obligatorio')
        .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{1,20}$/, 'El nombre de la mascota debe tener máximo 20 caracteres, y solo puede contener letras y espacios'),
    fecha_nacimiento: yup
        .string() // Cambiar a string para validar el formato
        .matches(
            /^\d{4}-\d{2}-\d{2}$/,
            'La fecha debe estar en el formato YYYY-MM-DD'
        )
        .required('La fecha de nacimiento es obligatoria')
        .test('is-valid-date', 'La fecha no es válida', value => {
            // Validar que la fecha sea un objeto Date válido
            const date = new Date(value);
            return date instanceof Date && !isNaN(date);
        })
        .max(new Date(), 'La fecha no puede ser futura'),
    estado: yup
        .string()
        .required('El estado es obligatorio'),
    descripcion: yup
        .string()
        .max(300, 'Máximo 300 caracteres')
        .required('La descripción es obligatoria'),
    esterilizacion: yup
        .string()
        .required('Especifica si la mascota está esterilizada'),
    tamano: yup
        .string()
        .required('El tamaño es obligatorio'),
    peso: yup
        .string()
        .matches(/^[0-9]+$/, 'El peso debe ser un número entero, aproxime el peso de la mascota')
        .test('max', 'El peso no puede ser mayor a 200', value => {
            if (!value) return true; // Si no hay valor, no se aplica la validación
            const pesoEnKg = parseInt(value, 10); // Convierte el valor a entero
            return pesoEnKg <= 200;
        })
        .required('El peso es obligatorio')
        .test('no-decimales', 'Aproximar el peso de la mascota en enteros', value => {
            if (!value) return true; // Si no hay valor, no se aplica la validación
            // Asegurarse de que no se ingresen decimales
            return /^[0-9]+$/.test(value);
        }),
    fk_id_categoria: yup
        .string()
        .required('La categoría es obligatoria'),
    fk_id_raza: yup
        .string()
        .required('La raza es obligatoria'),
    fk_id_departamento: yup
        .string()
        .required('El departamento es obligatorio'),
    fk_id_municipio: yup
        .string()
        .required('El municipio es obligatorio'),
    sexo: yup
        .string()
        .required('El sexo es obligatorio'),
    imagenes: yup
        .array()
        .min(1, 'Debe seleccionar al menos una imagen')
        .required('Debe seleccionar al menos una imagen'),

});


const FormMascotas = ({ mode, handleSubmit, onClose, actionLabel, initialData }) => {

    const [categoria, setCategoria] = useState([]);
    const [raza, setRaza] = useState([]);
    const [departamento, setDepartamento] = useState([]);
    const [municipio, setMunicipio] = useState([]);

    const [fotos, setFotos] = useState([null, null, null, null]);
    const [fotoUrl, setFotoUrl] = useState([null, null, null, null]);
    const [imagenesExistentes, setImagenesExistentes] = useState([null, null, null, null]);

    useEffect(() => {
        axiosClient.get('/razas/listar').then((response) => setRaza(response.data));
        axiosClient.get('/municipios/listar').then((response) => setMunicipio(response.data));
    }, []);

    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState([]);
    const [razasPorCategoria, setRazasPorCategoria] = useState([]);

    useEffect(() => {
        axiosClient.get('/departamentos/listar').then((response) => setDepartamento(response.data));
    }, []);

    useEffect(() => {
        axiosClient.get('/categorias/listar').then((response) => {
            const categoriasFilter = response.data.filter(cate => cate.estado === 'activa');
            setCategoria(categoriasFilter);
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            nombre_mascota: '',
            fecha_nacimiento: null,
            estado: '',
            descripcion: '',
            esterilizacion: '',
            tamano: '',
            peso: '',
            fk_id_categoria: '',
            fk_id_raza: '',
            fk_id_departamento: '',
            fk_id_municipio: '',
            sexo: '',
            imagenes: [],
        },
        validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('nombre_mascota', values.nombre_mascota);

            const formattedDate = values.fecha_nacimiento ? new Date(values.fecha_nacimiento).toISOString().split('T')[0] : null;
            formData.append('fecha_nacimiento', formattedDate);

            formData.append('estado', values.estado);
            formData.append('descripcion', values.descripcion);
            formData.append('esterilizado', values.esterilizacion);
            formData.append('tamano', values.tamano);
            formData.append('peso', values.peso);
            formData.append('fk_id_categoria', values.fk_id_categoria);
            formData.append('fk_id_raza', values.fk_id_raza);
            formData.append('fk_id_departamento', values.fk_id_departamento);
            formData.append('fk_id_municipio', values.fk_id_municipio);
            formData.append('sexo', values.sexo);

            fotos.forEach((foto, index) => {
                if (foto) {
                    formData.append('imagenes', {
                        uri: foto.uri,
                        type: foto.type,
                        name: foto.fileName || `photo_${index}.jpg`, // Cambia el nombre de archivo si es necesario
                    });
                } else if (imagenesExistentes[index]) {
                    formData.append('imagenesExistentes[]', imagenesExistentes[index]);
                }
            });

            handleSubmit(formData);
        }
    });


    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

    useEffect(() => {
        if (mode === 'update' && initialData) {
            const fecha = initialData.fecha_nacimiento ? initialData.fecha_nacimiento.split('T')[0] : '';

            // Convertir el peso a número entero y luego convertirlo en una cadena de texto para el input
            const peso = initialData.peso ? Math.trunc(parseFloat(initialData.peso)).toString() : '';
            console.log("Peso convertido a entero (como texto): ", peso);

            const imagenesArray = initialData.imagenes ? initialData.imagenes.split(',') : [];
            const updatedFotos = [...imagenesArray, ...Array(4 - imagenesArray.length).fill(null)];
            setImagenesExistentes(updatedFotos);

            const fotoUrls = updatedFotos.map(imagen => imagen ? `${axiosClient.defaults.baseURL}/uploads/${imagen}` : null);
            setFotoUrl(fotoUrls);

            formik.setValues({
                nombre_mascota: initialData.nombre_mascota || '',
                fecha_nacimiento: fecha || '',
                estado: initialData.estado || 'En Adopcion',
                descripcion: initialData.descripcion || '',
                esterilizacion: initialData.esterilizado || '',
                tamano: initialData.tamano || '',
                // Asegurar que el peso se pase como string para el campo TextInput
                peso: peso || '',
                fk_id_categoria: initialData.fk_id_categoria || '',
                fk_id_raza: initialData.fk_id_raza || '',
                fk_id_departamento: initialData.fk_id_departamento || '',
                fk_id_municipio: initialData.fk_id_municipio || '',
                sexo: initialData.sexo || '',
                imagenes: updatedFotos.filter(imagen => imagen !== null),
            });
            loadRazasPorCategoria(initialData.fk_id_categoria);
            loadMunicipiosPorDepartamento(initialData.fk_id_departamento);
        }
    }, [mode, initialData]);





    const loadRazasPorCategoria = async (categoriaId) => {
        try {
            const response = await axiosClient.get(`/razas/listarRazasPorCategoria/${categoriaId}`);
            setRazasPorCategoria(response.data);
        } catch (error) {
            console.error('Error al obtener las razas:', error);
        }
    };

    const loadMunicipiosPorDepartamento = async (departamentoId) => {
        try {
            const response = await axiosClient.get(`/municipios/listarMunicipiosPorDepartamento/${departamentoId}`);
            setMunicipiosPorDepartamento(response.data);
        } catch (error) {
            console.error('Error al obtener los municipios:', error);
        }
    };

    const handleDepartamentoChange = async (departamentoId) => {
        // const departamentoId = event.target.value;
        formik.setFieldValue('fk_id_departamento', departamentoId);

        if (departamentoId) {
            loadMunicipiosPorDepartamento(departamentoId);
        } else {
            setMunicipiosPorDepartamento([]);
        }
    };

    const handleCategoriaChange = async (categoriaId) => {
        // const categoriaId = event.target.value;
        formik.setFieldValue('fk_id_categoria', categoriaId);

        if (categoriaId) {
            loadRazasPorCategoria(categoriaId);
        } else {
            setRazasPorCategoria([]);
        }
    };

    const handleImageChange = async (index) => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
            });

            if (!result.didCancel && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                const updatedFotos = [...fotos];
                updatedFotos[index] = selectedImage;
                setFotos(updatedFotos);
                const updatedFotoUrl = [...fotoUrl];
                updatedFotoUrl[index] = selectedImage.uri;
                setFotoUrl(updatedFotoUrl);

                formik.setFieldValue('imagenes', updatedFotos.filter(f => f !== null));
            }
        } catch (error) {
            console.log('Error al seleccionar la imagen:', error);
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    {fotoUrl.map((url, index) => (
                        <TouchableOpacity key={index} style={styles.imageWrapper} onPress={() => handleImageChange(index)}>
                            <Image
                                source={{ uri: url || 'https://via.placeholder.com/150' }}
                                style={styles.image}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Mostrar mensaje de error si no se ha seleccionado una imagen */}
                {formik.errors.imagenes && formik.touched.imagenes ? (
                    <Text style={styles.errorText}>
                        {formik.errors.imagenes}
                    </Text>
                ) : null}

                {/* Campos del formulario */}
                <View>
                    <Text style={styles.label}>Nombre de la mascota</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la mascota"
                        placeholderTextColor="#666"
                        value={values.nombre_mascota}
                        onChangeText={handleChange('nombre_mascota')}
                        onBlur={handleBlur('nombre_mascota')}
                    />
                    {touched.nombre_mascota && errors.nombre_mascota && <Text style={styles.errorText}>{errors.nombre_mascota}</Text>}

                    <Text style={styles.label}>Fecha de nacimiento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Fecha de nacimiento"
                        placeholderTextColor="#666"
                        value={values.fecha_nacimiento}
                        onChangeText={handleChange('fecha_nacimiento')}
                        onBlur={handleBlur('fecha_nacimiento')}
                    />
                    {touched.fecha_nacimiento && errors.fecha_nacimiento && <Text style={styles.errorText}>{errors.fecha_nacimiento}</Text>}

                    <Text style={styles.label}>Tamaño</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Tamaño", value: '' }}
                        value={formik.values.tamano}
                        onValueChange={formik.handleChange('tamano')}
                        style={pickerStyles}
                        items={[
                            { label: "Pequeño", value: "Pequeno" },
                            { label: "Mediano", value: "Mediano" },
                            { label: "Intermedio", value: "Intermedio" },
                            { label: "Grande", value: "Grande" }
                        ]}
                    />
                    {formik.touched.tamano && formik.errors.tamano && <Text style={styles.errorText}>{formik.errors.tamano}</Text>}

                    <Text style={styles.label}>Peso (en kilogramos)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Peso"
                        placeholderTextColor="#8d8d8d"
                        value={formik.values.peso}
                        onChangeText={formik.handleChange('peso')}
                        onBlur={formik.handleBlur('peso')}
                        keyboardType="numeric"
                    />
                    {formik.touched.peso && formik.errors.peso && <Text style={styles.errorText}>{formik.errors.peso}</Text>}

                    <Text style={styles.label}>Categoría</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Categoria", value: '' }}
                        value={formik.values.fk_id_categoria}
                        onValueChange={(value) => {
                            formik.setFieldValue('fk_id_categoria', value);
                            handleCategoriaChange(value); // Cargar razas por categoría
                        }}
                        style={pickerStyles}
                        items={categoria.map(cate => ({ label: cate.nombre_categoria, value: cate.id_categoria }))}
                    />
                    {formik.touched.fk_id_categoria && formik.errors.fk_id_categoria && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_categoria}</Text>
                    )}

                    <Text style={styles.label}>Raza</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Raza", value: '' }}
                        value={formik.values.fk_id_raza}
                        onValueChange={(value) => formik.setFieldValue('fk_id_raza', value)}
                        style={pickerStyles}
                        items={razasPorCategoria.map(r => ({ label: r.nombre_raza, value: r.id_raza }))}
                    />
                    {formik.touched.fk_id_raza && formik.errors.fk_id_raza && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_raza}</Text>
                    )}

                    <Text style={styles.label}>Departamento</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Departamento", value: '' }}
                        value={formik.values.fk_id_departamento}
                        onValueChange={(value) => {
                            formik.setFieldValue('fk_id_departamento', value);
                            handleDepartamentoChange(value); // Cargar municipios por departamento
                        }}
                        style={pickerStyles}
                        items={departamento.map(depa => ({ label: depa.nombre_departamento, value: depa.id_departamento }))}
                    />
                    {formik.touched.fk_id_departamento && formik.errors.fk_id_departamento && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_departamento}</Text>
                    )}

                    <Text style={styles.label}>Municipio</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Municipio", value: '' }}
                        value={formik.values.fk_id_municipio}
                        onValueChange={(value) => formik.setFieldValue('fk_id_municipio', value)}
                        style={pickerStyles}
                        items={municipiosPorDepartamento.map(mu => ({ label: mu.nombre_municipio, value: mu.id_municipio }))}
                    />
                    {formik.touched.fk_id_municipio && formik.errors.fk_id_municipio && (
                        <Text style={styles.errorText}>{formik.errors.fk_id_municipio}</Text>
                    )}

                    <Text style={styles.label}>¿Está esterilizado?</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Esterilizado", value: '' }}
                        value={formik.values.esterilizacion}
                        onValueChange={formik.handleChange('esterilizacion')}
                        style={pickerStyles}
                        items={[
                            { label: "Sí", value: "si" },
                            { label: "No", value: "no" }
                        ]}
                    />
                    {formik.touched.esterilizacion && formik.errors.esterilizacion && <Text style={styles.errorText}>{formik.errors.esterilizacion}</Text>}

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descripción"
                        placeholderTextColor="#8d8d8d"
                        value={formik.values.descripcion}
                        onChangeText={formik.handleChange('descripcion')}
                        onBlur={formik.handleBlur('descripcion')}
                    />
                    {formik.touched.descripcion && formik.errors.descripcion && <Text style={styles.errorText}>{formik.errors.descripcion}</Text>}

                    <Text style={styles.label}>Estado</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Estado", value: '' }}
                        value={formik.values.estado}
                        onValueChange={formik.handleChange('estado')}
                        style={pickerStyles}
                        items={[
                            { label: "En Adopción", value: "En Adopcion" },
                            { label: "Urgente", value: "Urgente" },
                            { label: "Adoptado", value: "Adoptado" },
                            { label: "Reservado", value: "Reservado" }
                        ]}
                    />
                    {formik.touched.estado && formik.errors.estado && <Text style={styles.errorText}>{formik.errors.estado}</Text>}

                    <Text style={styles.label}>Sexo</Text>
                    <RNPickerSelect
                        placeholder={{ label: "Seleccionar Sexo", value: '' }}
                        value={formik.values.sexo}
                        onValueChange={formik.handleChange('sexo')}
                        style={pickerStyles}
                        items={[
                            { label: "Macho", value: "Macho" },
                            { label: "Hembra", value: "Hembra" }
                        ]}
                    />
                    {formik.touched.sexo && formik.errors.sexo && <Text style={styles.errorText}>{formik.errors.sexo}</Text>}
                </View>

                {/* Botones */}
                <View style={styles.buttonContainer}>
                    <Button title="Cancelar" color="red" onPress={onClose} />
                    <Button title={actionLabel} color="orange" onPress={formik.handleSubmit} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    imageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    imageWrapper: {
        width: 60,
        height: 60,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',

    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#666',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
// Estilos del picker y el formulario
const pickerStyles = {
    inputIOS: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#8d8d8d', // Color del texto seleccionado
    },
    inputAndroid: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#8d8d8d', // Color del texto seleccionado
    },
    placeholder: {
        color: '#8d8d8d', // Color del placeholder
    },
};

export default FormMascotas;
