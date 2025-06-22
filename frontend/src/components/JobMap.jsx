import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for jobs
const createJobMarker = (color = '#FF6B00') => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        <circle cx="12.5" cy="12.5" r="4" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};

// Component to handle map updates
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 10);
    }
  }, [map, center, zoom]);
  
  return null;
};

const JobMap = ({ 
  jobs = [], 
  selectedJob, 
  onJobSelect, 
  height = '400px',
  showControls = true 
}) => {
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to San Francisco
  const [mapZoom, setMapZoom] = useState(10);
  const mapRef = useRef();

  // Get GEO Apify API key from environment
  const geoApifyKey = import.meta.env.VITE_GEO_APIFY || '7eed9cfa38b64b05b1ef20b4b8c6bbf4';

  // GEO Apify tile URL
  const geoApifyTileUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoApifyKey}`;

  // Geocode job locations
  const geocodeJobs = async (jobsToGeocode) => {
    const geocodedJobs = [];
    
    for (const job of jobsToGeocode) {
      if (job.latitude && job.longitude) {
        // Job already has coordinates
        geocodedJobs.push({
          ...job,
          lat: parseFloat(job.latitude),
          lng: parseFloat(job.longitude)
        });
      } else if (job.location) {
        try {
          // Geocode using GEO Apify
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(job.location)}&apiKey=${geoApifyKey}`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].geometry.coordinates;
            geocodedJobs.push({
              ...job,
              lat: lat,
              lng: lng
            });
          }
        } catch (error) {
          console.error('Error geocoding job location:', error);
        }
      }
    }
    
    return geocodedJobs;
  };

  const [geocodedJobs, setGeocodedJobs] = useState([]);

  // Geocode jobs when they change
  useEffect(() => {
    if (jobs.length > 0) {
      geocodeJobs(jobs).then(setGeocodedJobs);
    }
  }, [jobs, geoApifyKey]);

  // Update map center when jobs change
  useEffect(() => {
    if (geocodedJobs.length > 0) {
      // Calculate center based on job locations
      const validJobs = geocodedJobs.filter(job => job.lat && job.lng);
      if (validJobs.length > 0) {
        const avgLat = validJobs.reduce((sum, job) => sum + job.lat, 0) / validJobs.length;
        const avgLng = validJobs.reduce((sum, job) => sum + job.lng, 0) / validJobs.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [geocodedJobs]);

  // Focus on selected job
  useEffect(() => {
    if (selectedJob && selectedJob.lat && selectedJob.lng) {
      setMapCenter([selectedJob.lat, selectedJob.lng]);
      setMapZoom(12);
    }
  }, [selectedJob]);

  const handleMarkerClick = (job) => {
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const fitMapToBounds = () => {
    if (mapRef.current && geocodedJobs.length > 0) {
      const validJobs = geocodedJobs.filter(job => job.lat && job.lng);
      if (validJobs.length > 0) {
        const bounds = L.latLngBounds(validJobs.map(job => [job.lat, job.lng]));
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', height }}>
      {showControls && (
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}>
          <Button
            variant="contained"
            size="small"
            onClick={fitMapToBounds}
            sx={{ 
              backgroundColor: '#FF6B00',
              '&:hover': { backgroundColor: '#e65c00' }
            }}
          >
            Fit All Jobs
          </Button>
        </Box>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        ref={mapRef}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url={geoApifyTileUrl}
        />
        
        {geocodedJobs.map((job) => {
          if (!job.lat || !job.lng) return null;
          
          const isSelected = selectedJob && selectedJob.id === job.id;
          const markerIcon = createJobMarker(isSelected ? '#4CAF50' : '#FF6B00');
          
          return (
            <Marker
              key={job.id}
              position={[job.lat, job.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => handleMarkerClick(job)
              }}
            >
              <Popup>
                <Paper sx={{ p: 2, minWidth: 250, maxWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {job.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📍 {job.location}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    💰 ${job.hourly_wage}/hour
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Chip 
                      label={job.job_type} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#FF6B00',
                        color: 'white',
                        mr: 1
                      }}
                    />
                    {job.grade && (
                      <Chip 
                        label={`Grade: ${job.grade}`}
                        size="small"
                        sx={{ 
                          backgroundColor: '#4CAF50',
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleMarkerClick(job)}
                    sx={{ 
                      backgroundColor: '#FF6B00',
                      '&:hover': { backgroundColor: '#e65c00' }
                    }}
                  >
                    View Details
                  </Button>
                </Paper>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {geocodedJobs.length === 0 && jobs.length > 0 && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <Typography variant="h6" color="text.secondary">
            Loading job locations...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobMap;
