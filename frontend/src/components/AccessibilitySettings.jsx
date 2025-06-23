import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel, Switch, Typography, Paper } from '@mui/material';

const ACCESSIBILITY_KEY = 'accessibilitySettings';

const defaultSettings = {
  dyslexiaFont: false,
  colorBlindMode: false,
  highContrast: false,
  highlightMissingAlt: false,
};

const dyslexiaFontUrl = 'https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap';

const AccessibilitySettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(ACCESSIBILITY_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
    // Dyslexia font
    if (settings.dyslexiaFont) {
      if (!document.getElementById('dyslexia-font-link')) {
        const link = document.createElement('link');
        link.id = 'dyslexia-font-link';
        link.rel = 'stylesheet';
        link.href = dyslexiaFontUrl;
        document.head.appendChild(link);
      }
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
    // Color blind mode
    if (settings.colorBlindMode) {
      document.body.classList.add('color-blind-mode');
    } else {
      document.body.classList.remove('color-blind-mode');
    }
    // High contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    // Highlight missing alt text (for devs)
    if (settings.highlightMissingAlt) {
      document.body.classList.add('highlight-missing-alt');
    } else {
      document.body.classList.remove('highlight-missing-alt');
    }
  }, [settings]);

  const handleToggle = (key) => (e) => {
    setSettings((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Accessibility Settings
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={<Switch checked={settings.dyslexiaFont} onChange={handleToggle('dyslexiaFont')} />}
          label="Dyslexia-friendly Font"
        />
        <FormControlLabel
          control={<Switch checked={settings.colorBlindMode} onChange={handleToggle('colorBlindMode')} />}
          label="Color Blind Mode"
        />
        <FormControlLabel
          control={<Switch checked={settings.highContrast} onChange={handleToggle('highContrast')} />}
          label="High Contrast"
        />
        <FormControlLabel
          control={<Switch checked={settings.highlightMissingAlt} onChange={handleToggle('highlightMissingAlt')} />}
          label="Highlight Missing Alt Text (for devs)"
        />
      </Box>
    </Paper>
  );
};

export default AccessibilitySettings; 