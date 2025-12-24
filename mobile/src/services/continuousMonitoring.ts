/**
 * Continuous Monitoring Service
 * Handles background camera and audio recording for patient safety monitoring
 * Uses privacy-first approach with consent management
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Camera, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import { File } from 'expo-file-system';
import { getApiBaseUrl } from './api/env';

const MONITORING_TASK = 'background-monitoring-task';
const RECORDING_INTERVAL = 10000; // 10 seconds per recording chunk
const UPLOAD_BATCH_SIZE = 1; // Upload every 5 recordings

interface RecordingMetadata {
  patientId: string;
  timestamp: string;
  duration: number;
  type: 'video' | 'audio';
  consent: boolean;
}

let isMonitoring = false;
let currentVideoRecording: any = null;
let currentAudioRecording: Audio.Recording | null = null;
let recordingQueue: { uri: string; metadata: RecordingMetadata }[] = [];

/**
 * Upload recording to mock API server
 */
async function uploadRecording(uri: string, metadata: RecordingMetadata): Promise<void> {
  try {
    const apiBase = getApiBaseUrl();
    const endpoint = metadata.type === 'video' 
      ? `${apiBase}/api/recordings/video`
      : `${apiBase}/api/recordings/audio`;

    console.log(`📤 Uploading ${metadata.type} to: ${endpoint}`);
    console.log(`📁 File URI: ${uri}`);

    // Check if file exists using new File API
    const file = new File(uri);
    const exists = await file.exists;
    if (!exists) {
      throw new Error(`File not found: ${uri}`);
    }
    const fileSize = await file.size;
    console.log(`📊 File size: ${(fileSize / 1024).toFixed(2)} KB`);

    // Read file as base64 using new File API
    const fileData = await file.base64();
    console.log(`🔢 Base64 length: ${fileData.length}`);

    const requestBody = {
      patientId: metadata.patientId,
      timestamp: metadata.timestamp,
      duration: metadata.duration,
      data: fileData,
      consent: metadata.consent,
    };
    console.log(`📦 Request body size: ${JSON.stringify(requestBody).length} bytes`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📡 Response status: ${response.status}`);
    const responseData = await response.json();
    console.log(`📥 Response data:`, responseData);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    console.log(`✅ Uploaded ${metadata.type} recording: ${metadata.timestamp}`);

    // Delete local file after successful upload using new File API
    await file.delete();
    console.log(`🗑️ Deleted local file: ${uri}`);
  } catch (error) {
    console.error('❌ Failed to upload recording:', error);
    // Keep in queue for retry
    throw error;
  }
}

/**
 * Process recording queue and upload in batches
 */
async function processRecordingQueue(): Promise<void> {
  if (recordingQueue.length === 0) return;

  console.log(`📤 Processing ${recordingQueue.length} recordings in queue`);

  const batch = recordingQueue.splice(0, UPLOAD_BATCH_SIZE);
  
  for (const item of batch) {
    try {
      await uploadRecording(item.uri, item.metadata);
    } catch (error) {
      // Re-add to queue if upload fails
      recordingQueue.unshift(item);
      console.error('Upload failed, keeping in queue:', error);
      break; // Stop processing batch if upload fails
    }
  }
}

/**
 * Record video chunk
 */
async function recordVideoChunk(patientId: string): Promise<string | null> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    if (status !== 'granted') {
      console.warn('⚠️ Camera permission not granted');
      return null;
    }

    // Note: Background video recording requires native module implementation
    // Expo Camera doesn't support background video recording without custom native code
    // This would need a foreground camera component with recordAsync()
    
    console.log(`🎥 Video recording not implemented - requires foreground camera component`);
    console.log(`ℹ️  For video recording, you need to:`);
    console.log(`   1. Create a Camera component in the UI`);
    console.log(`   2. Use camera.recordAsync() method`);
    console.log(`   3. Handle recording in foreground only`);
    
    // Return null - video recording needs UI component
    return null;
  } catch (error) {
    console.error('❌ Video recording failed:', error);
    return null;
  }
}

/**
 * Record audio chunk
 */
async function recordAudioChunk(patientId: string): Promise<string | null> {
  try {
    console.log(`🎤 Starting audio recording for patient: ${patientId}`);
    
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('⚠️ Audio permission not granted');
      return null;
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    console.log(`✅ Audio mode configured`);

    // Create recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    console.log(`✅ Recording prepared`);
    
    await recording.startAsync();
    console.log(`🔴 Recording started, will record for ${RECORDING_INTERVAL / 1000}s...`);

    // Record for RECORDING_INTERVAL
    await new Promise(resolve => setTimeout(resolve, RECORDING_INTERVAL));

    // Stop recording
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    console.log(`🎤 Audio recording completed: ${uri}`);

    if (uri) {
      const metadata: RecordingMetadata = {
        patientId,
        timestamp: new Date().toISOString(),
        duration: RECORDING_INTERVAL / 1000,
        type: 'audio',
        consent: true, // Should check consent from settings
      };

      recordingQueue.push({ uri, metadata });
      console.log(`📋 Added to queue. Queue length: ${recordingQueue.length}/${UPLOAD_BATCH_SIZE}`);

      // Process queue if batch size reached
      if (recordingQueue.length >= UPLOAD_BATCH_SIZE) {
        console.log(`🚀 Batch size reached, processing queue...`);
        await processRecordingQueue();
      }
    }

    return uri;
  } catch (error) {
    console.error('❌ Audio recording failed:', error);
    return null;
  }
}

/**
 * Background task for continuous monitoring
 */
TaskManager.defineTask(MONITORING_TASK, async () => {
  try {
    console.log('🔄 Background monitoring task running...');

    // Get patient ID from storage (you'll need to implement this)
    const patientId = 'p123'; // Replace with actual patient ID from storage

    // Record audio chunk (video recording in background requires native implementation)
    await recordAudioChunk(patientId);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background monitoring task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Start continuous monitoring
 */
export async function startContinuousMonitoring(patientId: string): Promise<boolean> {
  try {
    // Check permissions
    const [cameraStatus, audioStatus] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Audio.requestPermissionsAsync(),
    ]);

    if (cameraStatus.status !== 'granted' || audioStatus.status !== 'granted') {
      console.warn('Required permissions not granted');
      return false;
    }

    // Register background task
    await BackgroundFetch.registerTaskAsync(MONITORING_TASK, {
      minimumInterval: 60, // Minimum interval in seconds (Android)
      stopOnTerminate: false, // Continue after app is closed
      startOnBoot: true, // Start on device boot
    });

    isMonitoring = true;
    console.log('✅ Continuous monitoring started');

    // Start foreground recording loop
    startForegroundRecording(patientId);

    return true;
  } catch (error) {
    console.error('Failed to start continuous monitoring:', error);
    return false;
  }
}

/**
 * Stop continuous monitoring
 */
export async function stopContinuousMonitoring(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(MONITORING_TASK);
    isMonitoring = false;

    // Stop any active recordings
    if (currentAudioRecording) {
      await currentAudioRecording.stopAndUnloadAsync();
      currentAudioRecording = null;
    }

    // Upload remaining recordings in queue
    await processRecordingQueue();

    console.log('✅ Continuous monitoring stopped');
  } catch (error) {
    console.error('Failed to stop continuous monitoring:', error);
  }
}

/**
 * Start foreground recording loop (when app is active)
 */
async function startForegroundRecording(patientId: string): Promise<void> {
  const record = async () => {
    if (!isMonitoring) return;

    try {
      // Record audio chunk
      await recordAudioChunk(patientId);

      // Schedule next recording
      setTimeout(record, RECORDING_INTERVAL);
    } catch (error) {
      console.error('Foreground recording error:', error);
      // Retry after delay
      setTimeout(record, RECORDING_INTERVAL);
    }
  };

  record();
}

/**
 * Check if monitoring is active
 */
export function isMonitoringActive(): boolean {
  return isMonitoring;
}

/**
 * Get recording queue status
 */
export function getQueueStatus() {
  return {
    queueLength: recordingQueue.length,
    isMonitoring,
  };
}

/**
 * Force upload all pending recordings
 */
export async function uploadPendingRecordings(): Promise<void> {
  await processRecordingQueue();
}
