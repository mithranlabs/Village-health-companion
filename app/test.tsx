// ─────────────────────────────────────────────────────────────
// app/test.tsx
// Temporary hackathon screen to test the Python connection
// ─────────────────────────────────────────────────────────────
import { API_BASE_URL } from '@/utils/sync';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TestConnectionScreen() {
  const [loading, setLoading] = useState(false);

  async function sendHardcodedPatient() {
    setLoading(true);
    
    // This perfectly matches the Python Dashboard's requirements
    const testPayload = {
      id: "test-uuid-9999",
      asha_id: "asha_riya",     // Matches the streamlit login!
      systolic_bp: 165,         // High BP to trigger the alert!
      diastolic_bp: 95,
      bmi: 28.4,
      risk_level: "high",
      timestamp: new Date().toISOString(),
      latitude: 23.2599,        // Bhopal coordinates
      longitude: 77.4126,
      state: "Madhya Pradesh"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/add_visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        Alert.alert("✅ SUCCESS!", "Test data sent! Tell your friend to check the dashboard.");
      } else {
        const errText = await response.text();
        Alert.alert("❌ SERVER REJECTED IT", `Status: ${response.status}\n\n${errText}`);
      }
    } catch (error: any) {
      Alert.alert("📴 NETWORK ERROR", `Could not reach ${API_BASE_URL}.\n\nCheck if IP is correct and both laptops/phones are on the same Wi-Fi!\n\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.ip}>Targeting: {API_BASE_URL}</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={sendHardcodedPatient}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.buttonText}>FIRE TEST PAYLOAD 🚀</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#141E30' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  ip: { fontSize: 14, color: '#00E6E6', marginBottom: 40 },
  button: { backgroundColor: '#FF4B4B', paddingVertical: 20, paddingHorizontal: 30, borderRadius: 15, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});