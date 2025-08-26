import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Project {
  id: string;
  name: string;
  duration: { minutes: number; seconds: number };
  wordCount: number;
  scriptName?: string;
  runs: Run[];
}

interface Run {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: 'countdown' | 'stopwatch';
}

export default function ProjectDetail() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const foundProject = projects.find((p: Project) => p.id === id);
        setProject(foundProject);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const createNewRun = () => {
    if (!project) return;

    showViewOptions();
  };

  const showViewOptions = () => {
    Alert.alert(
      'Select View',
      'Choose timer view',
      [
        {
          text: 'Countdown View',
          onPress: () => startRun('countdown'),
        },
        {
          text: 'Stopwatch View',
          onPress: () => startRun('stopwatch'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const startRun = (viewType: 'countdown' | 'stopwatch') => {
    if (!project) return;

    const runName = `Run #${project.runs.length + 1}`;
    const totalSeconds = project.duration.minutes * 60 + project.duration.seconds;
    
    router.push({
      pathname: '/timer',
      params: {
        projectId: project.id,
        runName: runName,
        duration: totalSeconds,
        minutes: project.duration.minutes,
        seconds: project.duration.seconds,
        mode: viewType,
      },
    });
  };

  const renderRun = ({ item }: { item: Run }) => (
    <View style={styles.runCard}>
      <View style={styles.runHeader}>
        <Text style={styles.runName}>{item.name}</Text>
        <Text style={styles.runDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.runDetails}>
        <Text style={styles.runDetail}>
          Duration: {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </Text>
        <Text style={styles.runDetail}>Type: {item.type}</Text>
      </View>
    </View>
  );

  if (!project) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>{project.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.projectInfo}>
          <View style={styles.infoCard}>
            <Clock size={24} color="#3282b8" />
            <Text style={styles.infoText}>
              {project.duration.minutes}:{project.duration.seconds.toString().padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Words</Text>
            <Text style={styles.infoText}>{project.wordCount}</Text>
          </View>
          {project.scriptName && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Script</Text>
              <Text style={styles.infoText}>{project.scriptName}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.newRunButton} onPress={createNewRun}>
          <Play size={20} color="#ffffff" />
          <Text style={styles.newRunButtonText}>New Run</Text>
        </TouchableOpacity>

        <View style={styles.runsSection}>
          <Text style={styles.sectionTitle}>Past Runs</Text>
          {project.runs.length === 0 ? (
            <Text style={styles.emptyText}>No runs yet</Text>
          ) : (
            <FlatList
              data={project.runs}
              renderItem={renderRun}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <View style={styles.adPlaceholder}>
        <Text style={styles.adText}>Google AdSense Placeholder</Text>
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
  },
  projectInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  newRunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3282b8',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 24,
  },
  newRunButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  runsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  runCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  runName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  runDate: {
    fontSize: 12,
    color: '#666',
  },
  runDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  runDetail: {
    fontSize: 14,
    color: '#666',
  },
  adPlaceholder: {
    height: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 8,
  },
  adText: {
    color: '#666',
    fontSize: 12,
  },
});