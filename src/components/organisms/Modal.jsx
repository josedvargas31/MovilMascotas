import React from "react";
import { View, StyleSheet } from "react-native";

function Modal({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.containermodal}>
        {children}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  containermodal: {
    
  },
})
export default Modal;
