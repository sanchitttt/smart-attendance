import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";

type Props = {
  visible: boolean;
};

const LoadingOverlay = ({ visible }: Props) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // 🔥 transparent black
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    padding: 20,
    borderRadius: 10,
  },
});