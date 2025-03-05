import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { convertTimestamp, formatDate } from '../firebase/utils';

// Define props interface
interface SensorCardProps {
  sensorType: 'temperature' | 'humidity' | 'soil';
  sensorId?: string; // Optional for non-soil sensors
  title?: string;    // Optional custom title
  color?: string;    // Optional card accent color
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  sensorType, 
  sensorId = 'default', 
  title,
  color = '#1976d2' // Default MUI primary color
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<number | null>(null);
  const [unit, setUnit] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('Unknown');
  const [error, setError] = useState<string | null>(null);

  // Determine display title if not provided
  const displayTitle = title || (
    sensorType === 'temperature' ? 'Air Temperature' :
    sensorType === 'humidity' ? 'Air Humidity' :
    `Soil Moisture ${sensorId !== 'default' ? sensorId : ''}`
  );

  // Determine unit based on sensor type
  const displayUnit = 
    sensorType === 'temperature' ? '°C' :
    sensorType === 'humidity' ? '%' :
    '%';

  useEffect(() => {
    // Create a query to get the most recent reading
    const readingsRef = collection(db, 'devices/growbox/readings');
    const latestReadingQuery = query(
      readingsRef,
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      latestReadingQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setLoading(false);
          setError('No readings found');
          return;
        }
        try {
          const doc = snapshot.docs[0];
          const data = doc.data();

          // Early validation
          if (!data || !data.sensors) {
            setError('Invalid data format');
            setLoading(false);
            return;
          }

          // Extract the appropriate value based on sensor type and ID
          let sensorValue = null;
          let sensorUnit = '';

          if (sensorType === 'temperature' && data.sensors.air?.temperature) {
            sensorValue = data.sensors.air.temperature.value;
            sensorUnit = data.sensors.air.temperature.unit || '°C';
          } else if (sensorType === 'humidity' && data.sensors.air?.humidity) {
            sensorValue = data.sensors.air.humidity.value;
            sensorUnit = data.sensors.air.humidity.unit || '%';
          } else if (sensorType === 'soil' && data.sensors.soil) {
            // Handle specific soil sensor or default
            if (sensorId !== 'default' && data.sensors.soil[`sensor_${sensorId}`]) {
              sensorValue = data.sensors.soil[`sensor_${sensorId}`].value;
              sensorUnit = data.sensors.soil[`sensor_${sensorId}`].unit || '%';
            } else if (data.sensors.soil.moisture) {
              // Backward compatibility with old data structure
              sensorValue = data.sensors.soil.moisture.value;
              sensorUnit = data.sensors.soil.moisture.unit || '%';
            }
          }

          if (sensorValue !== null) {
            setValue(sensorValue);
            setUnit(sensorUnit);
            
            // Convert Firestore timestamp to formatted string
            if (data.timestamp) {
              const date = convertTimestamp(data.timestamp);
              setLastUpdated(formatDate(date));
            }
          } else {
            setError(`No ${sensorType} data found`);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error parsing data:', err);
          setLoading(false);
          setError('Error parsing data');
        }
      },
      (err) => {
        console.error('Error fetching readings:', err);
        setLoading(false);
        setError('Error fetching readings');
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [sensorType, sensorId]);

  return (
    <Card sx={{ 
      minWidth: 275, 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      borderTop: `4px solid ${color}`
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          {displayTitle}
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Box display="flex" alignItems="flex-end" my={3}>
              <Typography variant="h2" component="div">
                {value !== null ? value.toFixed(1) : '--'}
              </Typography>
              <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                {unit || displayUnit}
              </Typography>
            </Box>
            <Typography color="text.secondary" variant="body2">
              Last updated: {lastUpdated}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorCard;