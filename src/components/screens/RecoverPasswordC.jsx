import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const RecoverPasswordC = ({ navigation }) => {
    const [userEmail, setUserEmail] = useState('');
    const [userDNI, setUserDNI] = useState('');

    const navigateToChangePassword = () => {
        navigation.navigate('ChangePassword');
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Para recuperar su contraseña
                ingrese el correo electronico con el
                que se registro y su numero de
                identificacion</Text>
            {/* <Text style={styles.infoText}>Por favor ingrese el código de verificación enviado a su correo electrónico.</Text> */}
            <TextInput
                placeholder="Ingrese su correo electronico"
                value={userEmail}
                onChangeText={setUserEmail}
                style={styles.input}
                placeholderTextColor="#666"
                keyboardType="numeric" // Limita la entrada a solo números
            />
            <TextInput
                placeholder="Ingrese su número de identificación"
                value={userDNI}
                onChangeText={setUserDNI}
                style={styles.input}
                placeholderTextColor="#666"
                keyboardType="numeric" // Limita la entrada a solo números
            />

            <TouchableOpacity style={styles.button} onPress={navigateToChangePassword}>
                <Text style={styles.buttonText}>Siguiente</Text>
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
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 25,
        marginTop: 100,
        marginBottom: 100,
        color: '#000',
        textAlign: 'center',
        textShadowColor: '#rgba(0, 0, 0, 0.1)', // Add text shadow
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
   /*  infoText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'justify',
        color: '#666',
        marginBottom: 50,
    }, */
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#57BF4F',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 30,
        color: '#000',
    },
    button: {
        backgroundColor: '#00CC00', // Green button
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 100,
        width: 180,
        height: 60,
        shadowColor: '#00CC00', // Add button shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RecoverPasswordC;
