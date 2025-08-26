import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Save, RotateCcw, Play, Pause, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Timer() {
  const {
    projectId,
    runName,
    duration,
    minutes,
    seconds,
    mode,
    isQuickStart,
  } = useLocalSearchParams();

  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = parseInt(duration as string);
  const initialMinutes = parseInt(minutes as string);
  const initialSeconds = parseInt(seconds as string);

  const [currentTime, setCurrentTime] = useState(totalDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState(mode as 'countdown' | 'stopwatch');
  const [laps, setLaps] = useState<{ number: number; time: string }[]>([]);

  useEffect(() => {
    if (viewMode === 'stopwatch') {
      setCurrentTime(0);
    } else {
      setCurrentTime(totalDuration);
    }
  }, [viewMode, totalDuration]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (viewMode === 'countdown') {
            if (prev <= 1) {
              setIsRunning(false);
              setIsPaused(false);
              Alert.alert('Time\'s up!', 'Your session has ended.');
              return 0;
            }
            return prev - 1;
          } else {
            if (prev >= totalDuration) {
              setIsRunning(false);
              setIsPaused(false);
              Alert.alert('Time\'s up!', 'Your session has ended.');
              return totalDuration;
            }
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, viewMode, totalDuration]);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (viewMode === 'countdown') return '#1a1a2e';
    
    const progress = currentTime / totalDuration;
    if (progress < 0.7) return '#4CAF50'; // Green
    if (currentTime > 60) return '#FF9800'; // Yellow
    return '#F44336'; // Red
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setLaps([]);
    if (viewMode === 'countdown') {
      setCurrentTime(totalDuration);
    } else {
      setCurrentTime(0);
    }
  };

  const handleLap = () => {
    const lapTime = formatTime(viewMode === 'countdown' ? totalDuration - currentTime : currentTime);
    setLaps(prev => [...prev, { number: prev.length + 1, time: lapTime }]);
  };

  const toggleView = () => {
    setViewMode(prev => prev === 'countdown' ? 'stopwatch' : 'countdown');
    handleReset();
  };

  const saveAndExit = async () => {
    if (isQuickStart === 'true') {
      router.back();
      return;
    }

    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      if (storedProjects && projectId) {
        const projects = JSON.parse(storedProjects);
        const projectIndex = projects.findIndex((p: any) => p.id === projectId);
        
        if (projectIndex !== -1) {
          const newRun = {
            id: Date.now().toString(),
            name: runName as string,
            date: new Date().toISOString(),
            duration: viewMode === 'countdown' ? totalDuration - currentTime : currentTime,
            type: viewMode,
          };

          projects[projectIndex].runs.push(newRun);
          await AsyncStorage.setItem('projects', JSON.stringify(projects));
        }
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving run:', error);
      router.back();
    }
  };

  return (
    <View style={[styles.container, styles.landscape]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={saveAndExit} style={styles.saveButton}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveText}>
            {isQuickStart === 'true' ? 'Exit' : 'Save & Exit'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleView} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            Toggle to {viewMode === 'countdown' ? 'Stopwatch' : 'Countdown'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color: getTimerColor() }]}>
          {formatTime(currentTime)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, (!isRunning || isPaused) && styles.controlButtonDisabled]}
          onPress={handleReset}
          disabled={!isRunning && !isPaused}
        >
          <RotateCcw size={24} color={(!isRunning && !isPaused) ? "#ccc" : "#666"} />
          <Text style={[styles.controlText, (!isRunning && !isPaused) && styles.controlTextDisabled]}>
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={isRunning && !isPaused ? handlePause : isPaused ? handleResume : handleStart}
        >
          {isRunning && !isPaused ? (
            <Pause size={32} color="#ffffff" />
          ) : (
            <Play size={32} color="#ffffff" />
          )}
          <Text style={styles.primaryButtonText}>
            {isRunning && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, (!isRunning || isPaused) && styles.controlButtonDisabled]}
          onPress={handleLap}
          disabled={!isRunning || isPaused}
        >
          <Clock size={24} color={(!isRunning || isPaused) ? "#ccc" : "#666"} />
          <Text style={[styles.controlText, (!isRunning || isPaused) && styles.controlTextDisabled]}>
            Lap
          </Text>
        </TouchableOpacity>
      </View>

      {laps.length > 0 && (
        <View style={styles.lapsContainer}>
          <Text style={styles.lapsTitle}>Laps</Text>
          <ScrollView 
            style={styles.lapsScroll}
            showsVerticalScrollIndicator={laps.length > 5}
          >
            {laps.slice(-5).map((lap) => (
              <View key={lap.number} style={styles.lapItem}>
                <Text style={styles.lapNumber}>Lap {lap.number}</Text>
                <Text style={styles.lapTime}>{lap.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  landscape: {
    transform: [{ rotate: '90deg' }],
    width: height,
    height: width,
    position: 'absolute',
    top: (height - width) / 2,
    left: (width - height) / 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#3282b8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: width * 0.2,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  primaryButton: {
    backgroundColor: '#3282b8',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  controlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  controlTextDisabled: {
    color: '#ccc',
  },
  primaryButtonText: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: 'bold',
  },
  lapsContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    height: 180,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lapsScroll: {
    maxHeight: 100,
  },
  lapsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lapNumber: {
    fontSize: 12,
    color: '#666',
  },
  lapTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
  },
});