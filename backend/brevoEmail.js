const sendEmail = async ({ to, subject, htmlContent, senderEmail = 'noreply@ghonsiproof.com', senderName = 'Ghonsi Proof' }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return await response.json();
};

module.exports = { sendEmail };
