import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Button, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosClient from '../client/axiosClient'; // Asegúrate de que esta ruta sea correcta
import moment from 'moment';

// Esquema de validación Yup
const validationSchema = yup.object().shape({
    fk_id_mascota: yup
        .string()
        .required('La mascota es obligatoria'),
    fecha_vacuna: yup
        .date()
        .required('La fecha de la vacuna es obligatoria')
        .max(new Date(), 'La fecha no puede ser en el futuro'),
    enfermedad: yup
        .string()
        .required('La enfermedad es obligatoria')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/, 'El nombre de la enfermedad debe tener máximo 20 caracteres y solo puede contener letras y espacios'),
    estado: yup
        .string()
        .required('El estado de la vacuna es obligatorio')
});

const FormVacunas = ({ mode, handleSubmit, onClose, actionLabel }) => {
    const [mascotas, setMascotas] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // Función para obtener las mascotas
    const fetchMascotas = async () => {
        try {
            const response = await axiosClient.get('/mascotas/listar');
            setMascotas(response.data);
        } catch (error) {
            console.error('Error fetching mascotas: ', error);
        }
    };

    useEffect(() => {
        fetchMascotas(); // Llama a la función al cargar el componente
    }, []);

    // Formik para el manejo del formulario y Yup para validaciones
    const formik = useFormik({
        initialValues: {
            fk_id_mascota: '',
            fecha_vacuna: '',
            enfermedad: '',
            estado: ''
        },
        validationSchema,
        onSubmit: (values) => {
            // Aquí puedes manejar el envío del formulario
            handleSubmit(values);
        }
    });

    // Función para manejar la selección de fecha
    const handleConfirm = (date) => {
        formik.setFieldValue('fecha_vacuna', moment(date).format('YYYY-MM-DD')); // Asignar fecha en Formik
        setDatePickerVisibility(false);
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <RNPickerSelect
                    placeholder={{ label: "Seleccionar Mascota", value: '' }}
                    value={formik.values.fk_id_mascota}
                    onValueChange={value => formik.setFieldValue('fk_id_mascota', value)}
                    items={mascotas.map(m => ({ label: m.nombre_mascota, value: m.id_mascota }))}
                    style={pickerStyles}
                />
                {formik.touched.fk_id_mascota && formik.errors.fk_id_mascota ? (
                    <Text style={styles.errorText}>{formik.errors.fk_id_mascota}</Text>
                ) : null}

                <Button title="Seleccionar Fecha" onPress={() => setDatePickerVisibility(true)} />
                <Text>{formik.values.fecha_vacuna ? `Fecha de Vacuna: ${formik.values.fecha_vacuna}` : 'Fecha no seleccionada'}</Text>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={() => setDatePickerVisibility(false)}
                />
                {formik.touched.fecha_vacuna && formik.errors.fecha_vacuna ? (
                    <Text style={styles.errorText}>{formik.errors.fecha_vacuna}</Text>
                ) : null}

                <TextInput
                    style={styles.input}
                    placeholder="Enfermedad"
                    value={formik.values.enfermedad}
                    onChangeText={value => formik.setFieldValue('enfermedad', value)}
                    onBlur={formik.handleBlur('enfermedad')}
                    placeholderTextColor="#666"
                />
                {formik.touched.enfermedad && formik.errors.enfermedad ? (
                    <Text style={styles.errorText}>{formik.errors.enfermedad}</Text>
                ) : null}

                <RNPickerSelect
                    placeholder={{ label: "Seleccionar Estado de Vacuna", value: '' }}
                    value={formik.values.estado}
                    onValueChange={value => formik.setFieldValue('estado', value)}
                    items={[
                        { label: "Completa", value: "Completa" },
                        { label: "Incompleta", value: "Incompleta" },
                        { label: "En Proceso", value: "En Proceso" },
                        { label: "No se", value: "no se" }
                    ]}
                    style={pickerStyles}
                />
                {formik.touched.estado && formik.errors.estado ? (
                    <Text style={styles.errorText}>{formik.errors.estado}</Text>
                ) : null}

                <View style={styles.buttonContainer}>
                    <Button title="Cancelar" color="red" onPress={onClose} />
                    <Button title={actionLabel} color="orange" onPress={formik.handleSubmit} />
                </View>
            </View>
        </ScrollView>
    );
};
// Estilos
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
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

// Estilos del picker
const pickerStyles = {
    inputIOS: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#8d8d8d',
    },
    inputAndroid: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#8d8d8d',
    },
    placeholder: {
        color: '#8d8d8d',
    },
};

export default FormVacunas;
