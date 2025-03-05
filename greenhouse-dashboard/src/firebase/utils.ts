// src/firebase/utils.ts
import { Timestamp } from 'firebase/firestore';

// Define interfaces for our Firestore data structure
export interface SensorReading {
  timestamp: Timestamp;
  sensors: {
    air: {
      temperature: SensorValue;
      humidity: SensorValue;
    };
    soil: {
      moisture: SensorValue;
    };
  };
}

export interface SensorValue {
  unit: string;
  value: number;
}

// Helper function to convert Firestore timestamp to JavaScript Date
export const convertTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Helper function to format a date nicely
export const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Parse sensor data from Firestore document
export const parseSensorReading = (data: any): SensorReading | null => {
  try {
    // Ensure the required fields exist
    if (!data.timestamp || !data.sensors || !data.sensors.air || !data.sensors.soil) {
      console.error('Missing required fields in sensor data', data);
      return null;
    }

    return {
      timestamp: data.timestamp,
      sensors: {
        air: {
          temperature: {
            unit: data.sensors.air.temperature.unit || '°C',
            value: data.sensors.air.temperature.value || 0
          },
          humidity: {
            unit: data.sensors.air.humidity.unit || '%',
            value: data.sensors.air.humidity.value || 0
          }
        },
        soil: {
          moisture: {
            unit: data.sensors.soil.moisture.unit || '%',
            value: data.sensors.soil.moisture.value || 0
          }
        }
      }
    };
  } catch (error) {
    console.error('Error parsing sensor reading:', error);
    return null;
  }
};