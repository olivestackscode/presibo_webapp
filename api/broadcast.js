// /api/broadcast.js - Secure serverless function for sending broadcast emails
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { recipientType, subject, message, externalEmails } = req.body;

    if (!recipientType || !subject || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        let emailList = [];

        if (recipientType === 'doctors') {
            const response = await fetch(process.env.API_DOCTORS_URL || 'https://presibo-wl.vercel.app/doctors.json');
            const data = await response.json();
            const doctorsArray = Array.isArray(data) ? data : data.users || [];

            emailList = doctorsArray
                .map(d => d.email)
                .filter(email => typeof email === 'string' && email.includes('@'));
        } else if (recipientType === 'external' && externalEmails) {
            emailList = Array.isArray(externalEmails)
                ? externalEmails
                : externalEmails.split(',').map(e => e.trim()).filter(e => e.includes('@'));
        } else if (recipientType === 'users') {
            try {
                const response = await fetch(process.env.API_USERS_URL || 'https://api.presibo.com/users/index.php');
                const data = await response.json();
                const usersArray = Array.isArray(data) ? data : data.users || data.data || [];

                emailList = usersArray
                    .map(u => u.email)
                    .filter(email => typeof email === 'string' && email.includes('@'));

                console.log(`Fetched ${emailList.length} users for broadcast`);
            } catch (userFetchError) {
                console.error('Error fetching users for broadcast:', userFetchError);
                return res.status(500).json({ error: 'Failed to fetch users for broadcast' });
            }
        }

        if (emailList.length === 0) {
            res.status(400).json({ error: 'No valid email addresses found' });
            return;
        }

        // Send emails to the collected addresses
        let sentCount = 0;
        const errors = [];

        for (const email of emailList) {
            try {
                const emailRes = await fetch(process.env.API_EMAIL_URL || 'https://api.presibo.com/email/index.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send',
                        type: 'custom',
                        email,
                        title: subject,
                        message
                    })
                });

                const result = await emailRes.json();
                if (result.success) sentCount++;
            } catch (error) {
                errors.push({ email, error: error.message });
            }
        }

        res.status(200).json({
            success: true,
            sent: sentCount,
            total: emailList.length,
            errors
        });
    } catch (error) {
        console.error('Broadcast API error:', error);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
}
