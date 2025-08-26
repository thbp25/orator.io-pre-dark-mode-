import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

export default function NewProject() {
  const [projectName, setProjectName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [wordCount, setWordCount] = useState('');
  const [scriptUploaded, setScriptUploaded] = useState(false);
  const [scriptName, setScriptName] = useState('');
  const [manualWordCount, setManualWordCount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    generateDefaultName();
  }, []);

  const generateDefaultName = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      let counter = 1;
      let defaultName = 'Untitled';
      
      while (projects.some((p: any) => p.name === defaultName)) {
        defaultName = `Untitled ${counter}`;
        counter++;
      }
      
      setProjectName(defaultName);
    } catch (error) {
      setProjectName('Untitled');
    }
  };

  const handleSecondsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue > 59) {
      const additionalMinutes = Math.floor(numValue / 60);
      const remainingSeconds = numValue % 60;
      const currentMinutes = parseInt(minutes) || 0;
      
      setMinutes((currentMinutes + additionalMinutes).toString());
      setSeconds(remainingSeconds.toString());
    } else {
      setSeconds(value);
    }
  };

  const uploadScript = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setScriptName(file.name);
        setScriptUploaded(true);
        setManualWordCount(false);
        
        // Simulate word count (in real app, you'd parse the document)
        const estimatedWords = Math.floor(Math.random() * 500) + 100;
        setWordCount(estimatedWords.toString());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload script');
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!minutes && !seconds) {
      Alert.alert('Error', 'Please enter a duration');
      return;
    }

    if (!scriptUploaded && !wordCount) {
      Alert.alert('Error', 'Please upload a script or enter word count manually');
      return;
    }

    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        duration: {
          minutes: parseInt(minutes) || 0,
          seconds: parseInt(seconds) || 0,
        },
        wordCount: parseInt(wordCount) || 0,
        scriptName: scriptUploaded ? scriptName : undefined,
        runs: [],
      };

      projects.push(newProject);
      await AsyncStorage.setItem('projects', JSON.stringify(projects));
      
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Project</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            style={styles.input}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Enter project name"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInput}>
              <TextInput
                style={styles.timeInput}
                value={minutes}
                onChangeText={setMinutes}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>
            <View style={styles.durationInput}>
              <TextInput
                style={styles.timeInput}
                value={seconds}
                onChangeText={handleSecondsChange}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={styles.timeLabel}>s</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.uploadButton, scriptUploaded && styles.uploadButtonActive]}
            onPress={uploadScript}
          >
            <Upload size={20} color={scriptUploaded ? "#ffffff" : "#3282b8"} />
            <Text style={[styles.uploadText, scriptUploaded && styles.uploadTextActive]}>
              {scriptUploaded ? `Uploaded: ${scriptName}` : 'Upload Script'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Enter Word Count Manually</Text>
          <TextInput
            style={[styles.input, scriptUploaded && styles.inputDisabled]}
            value={wordCount}
            onChangeText={setWordCount}
            placeholder="Enter word count"
            keyboardType="numeric"
            editable={!scriptUploaded}
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={createProject}>
          <Text style={styles.createButtonText}>Create Project</Text>
        </TouchableOpacity>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  durationInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3282b8',
    borderStyle: 'dashed',
  },
  uploadButtonActive: {
    backgroundColor: '#3282b8',
    borderStyle: 'solid',
  },
  uploadText: {
    fontSize: 16,
    color: '#3282b8',
    marginLeft: 8,
  },
  uploadTextActive: {
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#3282b8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});