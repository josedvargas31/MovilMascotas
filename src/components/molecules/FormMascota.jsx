import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, Picker, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MascotasContext from '../../context/MascotasContext';

const FormMascotas = ({ mode, handleSubmit, onClose, actionLabel }) => {
    const [genero, setGenero] = useState([]);
    const [especie, setEspecie] = useState([]);
    const [esterilizacion, setEsterilizacion] = useState([]);
    const [nombre, setNombre] = useState('');
    const [generoOp, setGeneroOp] = useState('');
    const [especieOp, setEspecieOp] = useState('');
    const [esterilizacionOp, setEsterilizacionOp] = useState('');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('adoptar');
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const fileInputRef = useRef(null);

    const { idMascota } = useContext(MascotasContext);

    useEffect(() => {
        const enumDataGenero = [
            { value: 'Macho', label: 'Macho' },
            { value: 'Hembra', label: 'Hembra' },
        ];
        setGenero(enumDataGenero);
    }, []);

    useEffect(() => {
        const enumDataEsterilizacion = [
            { value: 'si', label: 'Si' },
            { value: 'no', label: 'No' },
            { value: 'no se', label: 'No se' },
        ];
        setEsterilizacion(enumDataEsterilizacion);
    }, []);

    useEffect(() => {
        const enumDataEspecie = [
            { value: 'Perro', label: 'Perro' },
            { value: 'Gato', label: 'Gato' },
            { value: 'Oveja', label: 'Oveja' },
            { value: 'Pato', label: 'Pato' },
            { value: 'Cerdo', label: 'Cerdo' },
            { value: 'Pajaro', label: 'Pajaro' },
            { value: 'Hamster', label: 'Hamster' },
            { value: 'Caballo', label: 'Caballo' },
            { value: 'Vaca', label: 'Vaca' },
        ];
        setEspecie(enumDataEspecie);
    }, []);

    useEffect(() => {
        if (mode === 'update' && idMascota) {
            setNombre(idMascota.nombre || '');
            setGeneroOp(idMascota.genero || '');
            setEspecieOp(idMascota.especie || '');
            setRaza(idMascota.raza || '');
            setEdad(idMascota.edad || '');
            setEsterilizacionOp(idMascota.esterilizacion || '');
            setDescripcion(idMascota.descripcion || '');
            setEstado(idMascota.estado || 'adoptar');
            setFotoUrl(idMascota.img || '');
            setFoto(null);
        } else {
            setNombre('');
            setGeneroOp('');
            setEspecieOp('');
            setRaza('');
            setEdad('');
            setEsterilizacionOp('');
            setDescripcion('');
            setEstado('adoptar');
            setFotoUrl('');
            setFoto(null);
        }
    }, [mode, idMascota]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const fk_id_usuario = user ? user.id_usuario : null;

        if (!fk_id_usuario) {
            console.error('Usuario no encontrado en localStorage');
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('genero', generoOp);
        formData.append('especie', especieOp);
        formData.append('raza', raza);
        formData.append('edad', edad);
        formData.append('esterilizacion', esterilizacionOp);
        formData.append('descripcion', descripcion);
        formData.append('estado', estado);
        formData.append('fk_id_usuario', fk_id_usuario);
        if (foto) {
            formData.append('img', foto);
        }

        handleSubmit(formData, e);
    };

    const handleImageChange = (e) => {
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

    return (
        <ScrollView>
            <View style={styles.container}>
                <TouchableOpacity style={styles.avatarContainer} onPress={handleImageChange}>
                    <Image
                        source={{ uri: fotoUrl || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de la mascota"
                    value={nombre}
                    onChangeText={setNombre}
                    required
                    maxLength={20}
                />
                <Picker
                    selectedValue={generoOp}
                    style={styles.picker}
                    onValueChange={(itemValue) => setGeneroOp(itemValue)}
                >
                    <Picker.Item label="Seleccionar Género" value="" />
                    {genero.map((item) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                </Picker>
                <Picker
                    selectedValue={especieOp}
                    style={styles.picker}
                    onValueChange={(itemValue) => setEspecieOp(itemValue)}
                >
                    <Picker.Item label="Seleccionar Especie" value="" />
                    {especie.map((item) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                </Picker>
                <TextInput
                    style={styles.input}
                    placeholder="Raza de la mascota"
                    value={raza}
                    onChangeText={setRaza}
                    required
                    maxLength={20}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Edad de la mascota"
                    value={edad}
                    onChangeText={setEdad}
                    required
                    keyboardType="numeric"
                    maxLength={2}
                />
                <Picker
                    selectedValue={esterilizacionOp}
                    style={styles.picker}
                    onValueChange={(itemValue) => setEsterilizacionOp(itemValue)}
                >
                    <Picker.Item label="Seleccionar Esterilización" value="" />
                    {esterilizacion.map((item) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                </Picker>
                <TextInput
                    style={styles.textarea}
                    placeholder="Descripción de la mascota"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    required
                    maxLength={300}
                    multiline
                />
                <Picker
                    selectedValue={estado}
                    style={styles.picker}
                    onValueChange={(itemValue) => setEstado(itemValue)}
                    enabled={mode === 'update'}
                >
                    <Picker.Item label="Seleccionar estado" value="" />
                    <Picker.Item label="Adoptar" value="adoptar" />
                    <Picker.Item label="Adoptada" value="adoptada" />
                    <Picker.Item label="En proceso de adopción" value="proceso adopcion" />
                </Picker>
                <View style={styles.buttonContainer}>
                    <Button title="Cancelar" color="red" onPress={onClose} />
                    <Button title={actionLabel} onPress={handleFormSubmit} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    textarea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        height: 100,
        textAlignVertical: 'top',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default styles;
