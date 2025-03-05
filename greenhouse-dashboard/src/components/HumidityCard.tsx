import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { convertTimestamp, formatDate, parseSensorReading } from '../firebase/utils';

const HumidityCard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Unknown');
  const [error, setError] = useState<string | null>(null);

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
          const reading = parseSensorReading(data);
          if (reading) {
            // Extract the humidity value
            const hum = reading.sensors.air.humidity.value;
            setHumidity(hum);
            // Convert Firestore timestamp to formatted string
            const date = convertTimestamp(reading.timestamp);
            setLastUpdated(formatDate(date));
          } else {
            setError('Invalid data format');
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
  }, []);

  return (
    <Card sx={{ minWidth: 275, maxWidth: 400, margin: '0 auto', marginTop: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Air Humidity
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
                {humidity !== null ? humidity.toFixed(1) : '--'}
              </Typography>
              <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                %
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

export default HumidityCard;