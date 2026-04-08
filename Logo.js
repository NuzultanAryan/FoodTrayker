import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function Logo({ size = 80 }) {
  return (
    <Image
      source={require('./assets/images/Logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {},
});