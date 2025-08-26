import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
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

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProjects();
    }, [])
  );

  const loadProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const showCreateOptions = () => {
    Alert.alert(
      'Create New',
      'Choose an option',
      [
        { text: 'New Project', onPress: () => router.push('/new-project') },
        { text: 'Quick Start', onPress: () => router.push('/quick-start') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/project/${item.id}`)}
    >
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.projectDetails}>
        Duration: {item.duration.minutes}:{item.duration.seconds.toString().padStart(2, '0')}
      </Text>
      <Text style={styles.projectDetails}>
        Words: {item.wordCount}
      </Text>
      <Text style={styles.projectDetails}>
        Runs: {item.runs.length}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
      </View>

      <View style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Start your first project!</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.projectsList}
          />
        )}
      </View>

      <View style={styles.adPlaceholder}>
        <Text style={styles.adText}>Google AdSense Placeholder</Text>
      </View>

      <TouchableOpacity style={styles.fab} onPress={showCreateOptions}>
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  projectsList: {
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3282b8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});