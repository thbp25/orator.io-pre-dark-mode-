import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Play } from 'lucide-react-native';

export default function QuickStart() {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const router = useRouter();

  const durations = [
    { label: '1 min', value: 60 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
    { label: '30 min', value: 1800 },
    { label: 'Custom', value: -1 },
  ];

  const handleSecondsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue > 59) {
      const additionalMinutes = Math.floor(numValue / 60);
      const remainingSeconds = numValue % 60;
      const currentMinutes = parseInt(customMinutes) || 0;
      
      setCustomMinutes((currentMinutes + additionalMinutes).toString());
      setCustomSeconds(remainingSeconds.toString());
    } else {
      setCustomSeconds(value);
    }
  };

  const handleDurationSelect = (duration: { label: string; value: number }) => {
    if (duration.value === -1) {
      setShowCustomInput(true);
      setSelectedDuration(null);
    } else {
      setShowCustomInput(false);
      setSelectedDuration(duration.value);
      setCustomMinutes('');
      setCustomSeconds('');
    }
  };

  const startQuickSession = () => {
    let finalDuration = selectedDuration;
    
    if (showCustomInput) {
      const mins = parseInt(customMinutes) || 0;
      const secs = parseInt(customSeconds) || 0;
      if (mins === 0 && secs === 0) {
        Alert.alert('Error', 'Please enter a valid duration');
        return;
      }
      finalDuration = mins * 60 + secs;
    }
    
    if (!finalDuration) {
      Alert.alert('Error', 'Please select a duration');
      return;
    }

    Alert.alert(
      'Select View',
      'Choose timer view',
      [
        {
          text: 'Countdown View',
          onPress: () => startTimer(finalDuration!, 'countdown'),
        },
        {
          text: 'Stopwatch View',
          onPress: () => startTimer(finalDuration!, 'stopwatch'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const startTimer = (duration: number, mode: 'countdown' | 'stopwatch') => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    router.push({
      pathname: '/timer',
      params: {
        duration: duration,
        minutes: minutes,
        seconds: seconds,
        mode: mode,
        isQuickStart: 'true',
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Quick Start</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Clock size={64} color="#3282b8" />
        </View>
        
        <Text style={styles.subtitle}>Select Duration</Text>
        <Text style={styles.description}>
          Choose a duration for your quick practice session
        </Text>

        <View style={styles.durationGrid}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={[
                styles.durationButton,
                (selectedDuration === duration.value || (duration.value === -1 && showCustomInput)) && styles.durationButtonSelected,
              ]}
              onPress={() => handleDurationSelect(duration)}
            >
              <Text
                style={[
                  styles.durationText,
                  (selectedDuration === duration.value || (duration.value === -1 && showCustomInput)) && styles.durationTextSelected,
                ]}
              >
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showCustomInput && (
          <View style={styles.customDurationContainer}>
            <Text style={styles.customLabel}>Custom Duration</Text>
            <View style={styles.durationContainer}>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.timeInput}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.timeLabel}>min</Text>
              </View>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.timeInput}
                  value={customSeconds}
                  onChangeText={handleSecondsChange}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.timeLabel}>s</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.startButton,
            (!selectedDuration && !showCustomInput) && styles.startButtonDisabled,
          ]}
          onPress={startQuickSession}
          disabled={!selectedDuration && !showCustomInput}
        >
          <Play size={20} color="#ffffff" />
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  durationButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  durationButtonSelected: {
    borderColor: '#3282b8',
    backgroundColor: '#3282b8',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  durationTextSelected: {
    color: '#ffffff',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3282b8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  customDurationContainer: {
    width: '100%',
    marginBottom: 24,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  durationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    width: 100,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});