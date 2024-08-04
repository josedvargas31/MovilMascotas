// Header.jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Header = ({title}) => {
  return (
    <View style={styles.header}>
    <Image source={require('../../assets/logoprueba.png')} style={styles.logo} />
    <Text style={styles.txtheader}>{title}</Text>
  </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   /*  marginTop: 15, */
    marginBottom: 20,
    paddingRight: 30,
    borderBottomColor: 'orange',
    borderBottomWidth: 2,
    marginHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 65,
    marginBottom: 10,
  },
  txtheader: {
    fontSize: 24,
    textAlign: 'center',
    color: 'orange',
    fontWeight: '700',
  },
});

export default Header;
