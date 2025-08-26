import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      router.replace('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!showWelcome) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Orate.io</Text>
          </View>
        </View>
        <Text style={styles.slogan}>Pitch. Present. Perfect.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f4c75',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3282b8',
  },
  slogan: {
    fontSize: 18,
    color: '#bbe1fa',
    fontWeight: '300',
    letterSpacing: 1,
  },
});