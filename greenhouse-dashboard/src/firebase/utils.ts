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
      [key: string]: SensorValue; // Dynamic keys for multiple soil sensors
    };
  };
}

export interface SensorValue {
  unit: string;
  value: number;
  name?: string;
  position?: string;
}

// Helper function to convert Firestore timestamp to JavaScript Date
export const convertTimestamp = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Helper function to format a date nicely
export const formatDate = (date: Date): string => {
  return date.toLocaleString('de', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Parse sensor data from Firestore document - handles both old and new formats
export const parseSensorReading = (data: any): SensorReading | null => {
  try {
    // Ensure the required fields exist
    if (!data.timestamp || !data.sensors) {
      console.error('Missing required fields in sensor data', data);
      return null;
    }

    // Create the base reading structure
    const reading: SensorReading = {
      timestamp: data.timestamp,
      sensors: {
        air: {
          temperature: {
            unit: '°C',
            value: 0
          },
          humidity: {
            unit: '%',
            value: 0
          }
        },
        soil: {}
      }
    };

    // Add air sensors if they exist
    if (data.sensors.air) {
      if (data.sensors.air.temperature) {
        reading.sensors.air.temperature = {
          unit: data.sensors.air.temperature.unit || '°C',
          value: data.sensors.air.temperature.value || 0
        };
      }
      
      if (data.sensors.air.humidity) {
        reading.sensors.air.humidity = {
          unit: data.sensors.air.humidity.unit || '%',
          value: data.sensors.air.humidity.value || 0
        };
      }
    }

    // Handle soil sensors - support both old and new formats
    if (data.sensors.soil) {
      // Check for old format (single moisture sensor)
      if (data.sensors.soil.moisture) {
        reading.sensors.soil['moisture'] = {
          unit: data.sensors.soil.moisture.unit || '%',
          value: data.sensors.soil.moisture.value || 0
        };
      }
      
      // Check for new format (multiple named sensors)
      Object.keys(data.sensors.soil).forEach(key => {
        // Skip if it's the old 'moisture' we already processed
        if (key === 'moisture') return;
        
        const soilSensor = data.sensors.soil[key];
        if (soilSensor && typeof soilSensor === 'object' && 'value' in soilSensor) {
          reading.sensors.soil[key] = {
            unit: soilSensor.unit || '%',
            value: soilSensor.value || 0,
            name: soilSensor.name,
            position: soilSensor.position
          };
        }
      });
    }

    return reading;
  } catch (error) {
    console.error('Error parsing sensor reading:', error);
    return null;
  }
};

// Get a list of all soil moisture sensors from a reading
export const getSoilSensors = (reading: SensorReading | null): string[] => {
  if (!reading || !reading.sensors || !reading.sensors.soil) {
    return [];
  }
  
  return Object.keys(reading.sensors.soil);
};