const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API route to serve configuration from environment variables
app.get('/api/config', (req, res) => {
  const config = {
    // API Base URLs - using environment variables with fallbacks
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.presibo.com',
    API_USERS_URL: process.env.API_USERS_URL || 'https://api.presibo.com/users/index.php',
    API_DB_URL: process.env.API_DB_URL || 'https://api.presibo.com/db/index.php',
    API_POST_URL: process.env.API_POST_URL || 'https://api.presibo.com/post/index.php',
    API_EMAIL_URL: process.env.API_EMAIL_URL || 'https://api.presibo.com/email/index.php',
    API_RESET_TOKEN_URL: process.env.API_RESET_TOKEN_URL || 'https://api.presibo.com/tokens/reset-token.php',
    API_AI_URL: process.env.API_AI_URL || 'https://api.presibo.com/ai/openrouter.php',
    API_DOCTORS_URL: process.env.API_DOCTORS_URL || 'http://localhost:3000/api/doctors/index.php',
    
    // Internal API Routes
    API_WALLET_TOPUP_URL: process.env.API_WALLET_TOPUP_URL || '/api/wallet/top-up',
    API_AUTH_LOGOUT_URL: process.env.API_AUTH_LOGOUT_URL || '/api/auth/logout',
    API_VERIFY_PASSWORD_URL: process.env.API_VERIFY_PASSWORD_URL || '/api?action=verify_password',
    API_LOGOUT_URL: process.env.API_LOGOUT_URL || '/api?action=logout',
    
    // Payment Keys - only exposing public keys (safe to expose to frontend)
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
    
    // Security Settings
    NODE_ENV: process.env.NODE_ENV || 'production'
  };

  res.json(config);
});

// Proxy API route (similar to the Vercel function)
app.post('/api/proxy', express.json(), async (req, res) => {
  const { action } = req.query;
  if (!action) {
    return res.status(400).json({ error: 'Missing action' });
  }

  try {
    const internalUrl = `https://api.presibo.com/users/index.php?action=${encodeURIComponent(action)}`;
    
    // Make the actual fetch call
    const response = await fetch(internalUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed: ' + error.message });
  }
});

// Specific API routes for wallet top-up
app.post('/api/wallet/top-up', async (req, res) => {
  // In a real implementation, this would connect to your payment processing
  // For local testing, returning a mock response
  res.json({
    success: true,
    message: 'Top-up initiated successfully',
    paymentReference: 'mock_ref_' + Date.now()
  });
});

// Logout API route
app.post('/api/auth/logout', (req, res) => {
  // In a real implementation, this would handle server-side session cleanup
  res.json({ success: true, message: 'Logged out successfully' });
});

// Doctors API route - simulates the real doctors API
app.post('/api/doctors/index.php', (req, res) => {
  const { action, vitals } = req.body;
  
  console.log('Doctors API called with:', { action, vitals });
  
  if (action === 'get_recommended_doctors') {
    // Generate mock doctors based on vitals
    const doctors = generateMockDoctors(vitals);
    res.json(doctors);
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// Helper function to generate mock doctors based on vitals
function generateMockDoctors(vitals) {
  const doctors = [];
  
  // Check blood pressure
  if (vitals && vitals.blood_pressure) {
    const { systolic, diastolic } = vitals.blood_pressure;
    
    // Hypertensive crisis (>180/120) - urgent care
    if (systolic > 180 || diastolic > 120) {
      doctors.push({
        firstname: 'Michael',
        lastname: 'Cardwell',
        specialization: 'Emergency Medicine',
        location: 'Lagos University Teaching Hospital',
        years: 15,
        phone: '+2348012345678',
        email: 'm.cardwell@luth.edu.ng',
        reason: 'Urgent care needed for hypertensive crisis. Systolic pressure dangerously high.',
        recommendation_level: 'urgent',
        bio: 'Board-certified emergency physician with 15 years of experience in critical care medicine.'
      });
      
      doctors.push({
        firstname: 'Sarah',
        lastname: 'Hypertension',
        specialization: 'Cardiology',
        location: 'HeartCare Clinic, Ikeja',
        years: 12,
        phone: '+2348098765432',
        email: 's.hypertension@heartcare.ng',
        reason: 'Specialist in hypertension management. Your blood pressure requires immediate specialist attention.',
        recommendation_level: 'high',
        bio: 'Interventional cardiologist specializing in hypertension and preventive cardiology.'
      });
    }
    // Elevated blood pressure (140-179/90-119)
    else if (systolic >= 140 || diastolic >= 90) {
      doctors.push({
        firstname: 'James',
        lastname: 'Cardio',
        specialization: 'Cardiology',
        location: 'National Heart Institute',
        years: 10,
        phone: '+2348055512345',
        email: 'j.cardio@nhi.gov.ng',
        reason: 'Elevated blood pressure detected. Cardiology consultation recommended for proper management.',
        recommendation_level: 'high',
        bio: 'Clinical cardiologist with expertise in hypertension and heart disease prevention.'
      });
      
      doctors.push({
        firstname: 'Patricia',
        lastname: 'Wellness',
        specialization: 'Internal Medicine',
        location: 'General Hospital, Victoria Island',
        years: 8,
        phone: '+2348033398765',
        email: 'p.wellness@ghvi.ng',
        reason: 'Primary care physician for comprehensive health evaluation and blood pressure management.',
        recommendation_level: 'normal',
        bio: 'Board-certified internist focusing on preventive medicine and chronic disease management.'
      });
    }
    // Normal range
    else {
      doctors.push({
        firstname: 'Robert',
        lastname: 'Preventive',
        specialization: 'Preventive Medicine',
        location: 'Wellness Center, Lekki',
        years: 7,
        phone: '+2348022234567',
        email: 'r.preventive@wellness.ng',
        reason: 'Regular checkup recommended to maintain healthy blood pressure levels.',
        recommendation_level: 'normal',
        bio: 'Preventive medicine specialist focused on health maintenance and disease prevention.'
      });
    }
  }
  
  // Check blood sugar
  if (vitals && vitals.blood_sugar) {
    const sugarLevel = vitals.blood_sugar;
    
    // Diabetic range (>126 mg/dL fasting)
    if (sugarLevel > 126) {
      doctors.push({
        firstname: 'Elizabeth',
        lastname: 'Endo',
        specialization: 'Endocrinology',
        location: 'Diabetes Center, Apapa',
        years: 13,
        phone: '+2348066678901',
        email: 'e.endo@diabetescenter.ng',
        reason: 'Elevated blood sugar levels detected. Endocrinology consultation needed for diabetes management.',
        recommendation_level: 'high',
        bio: 'Board-certified endocrinologist specializing in diabetes care and metabolic disorders.'
      });
    }
    // Pre-diabetic range (100-125 mg/dL)
    else if (sugarLevel >= 100) {
      doctors.push({
        firstname: 'David',
        lastname: 'Metabolic',
        specialization: 'Internal Medicine',
        location: 'Metropolitan Medical Center',
        years: 9,
        phone: '+2348044456789',
        email: 'd.metabolic@mmc.ng',
        reason: 'Blood sugar slightly elevated. Primary care physician can help with lifestyle modifications.',
        recommendation_level: 'normal',
        bio: 'Internist with focus on metabolic health and preventive care.'
      });
    }
  }
  
  // If no specific vitals, return general practitioners
  if (doctors.length === 0) {
    doctors.push(...[
      {
        firstname: 'Grace',
        lastname: 'Family',
        specialization: 'Family Medicine',
        location: 'Community Health Center, Surulere',
        years: 6,
        phone: '+2348011123456',
        email: 'g.family@chc.ng',
        reason: 'Primary care physician for routine health checkups and general medical concerns.',
        recommendation_level: 'normal',
        bio: 'Compassionate family physician dedicated to comprehensive healthcare for individuals and families.'
      },
      {
        firstname: 'Thomas',
        lastname: 'General',
        specialization: 'General Practice',
        location: 'City Medical Clinic, Ajah',
        years: 5,
        phone: '+2348077789012',
        email: 't.general@cmc.ng',
        reason: 'General practitioner available for initial consultations and health assessments.',
        recommendation_level: 'normal',
        bio: 'Licensed general practitioner providing quality primary healthcare services.'
      }
    ]);
  }
  
  return doctors;
}

// Generic catch-all for other API routes (you can expand this as needed)
app.all('/api/*', async (req, res) => {
  // Log the request for debugging
  console.log(`Unhandled API request: ${req.method} ${req.path}`);
  
  // For internal API routes that need to be proxied, return a mock response
  if (req.path.includes('/api?action=') || req.path.includes('/api/')) {
    // Mock response for various API actions
    res.json({ 
      success: true, 
      message: 'Mock API response for local testing',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: 'API endpoint not implemented in local server' });
  }
});

// Catch-all handler to serve the main index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Presibo Web App running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});