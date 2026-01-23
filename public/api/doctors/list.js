// /api/doctors/list.js - Secure serverless function for fetching doctor emails
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Fetch doctors data from the external source
    const doctorsRes = await fetch('https://presibo-wl.vercel.app/doctors.json');
    const doctorsData = await doctorsRes.json();
    
    // Process the doctors data to extract only necessary information
    const doctorsArray = Array.isArray(doctorsData) ? doctorsData : doctorsData.users || [];
    
    // Extract only email addresses for the broadcast functionality
    const doctorEmails = doctorsArray
      .map(doctor => ({
        email: doctor.email,
        name: doctor.firstname ? `${doctor.firstname} ${doctor.lastname || ''}`.trim() : doctor.fullname,
        specialization: doctor.specialization
      }))
      .filter(item => item.email && typeof item.email === 'string' && item.email.includes('@'));

    res.status(200).json(doctorEmails);
  } catch (error) {
    console.error('Doctors list API error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors list' });
  }
}