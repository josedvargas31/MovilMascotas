import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const RecoverPasswordCE = ({ navigation }) => {
    const [userEmail, setUserEmail] = useState('');

    const navigateToRecoverPasswordC = () => {
            navigation.navigate('RecoverPasswordC');
        }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.infoText}>En caso de que se le olvide la contraseña puede recuperarla desde el correo que haya registrado anteriormente en el registro de su cuenta.</Text>
            <TextInput
                placeholder="Ingrese su correo"
                value={userEmail}
                onChangeText={setUserEmail}
                style={styles.input}
                placeholderTextColor="#666"
                textContentType="emailAddress"
            />
            <TouchableOpacity style={styles.button} onPress={navigateToRecoverPasswordC}>
                <Text style={styles.buttonText}>Recuperar Contraseña</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 100,
        color: '#000',
        textAlign: 'center',
        textShadowColor: '#rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'justify',
        color: '#666',
        marginBottom: 50,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#57BF4F',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: '#000',
    },
    button: {
        backgroundColor: '#00CC00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 120,
        width: 180,
        height: 60,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RecoverPasswordCE;
