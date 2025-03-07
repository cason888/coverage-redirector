// app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Configuration for different services
const serviceConfig = {
  unifi: {
    phone: "601135152058",
    messageTemplate: "Hi, saya nak check coverage Unifi Fibre, alamat saya:"
  },
  astro: {
    phone: "601118610166",
    messageTemplate: "Hi, saya nak check coverage Astro Fibre, alamat saya:"
  },
  // Add more services as needed
};

app.get('/:service/:referrer?', (req, res) => {
  // Extract subdomain from host
  const host = req.hostname;
  const subdomain = host.split('.')[0];
  
  // Get service from path or fallback to subdomain
  const service = req.params.service || subdomain;
  
  // Get referrer from path parameter (optional)
  const referrer = req.params.referrer || 'direct';
  
  // Get configuration for the requested service
  const config = serviceConfig[subdomain];
  
  if (!config) {
    return res.status(404).send('Service not found');
  }
  
  // Construct the WhatsApp URL with phone and pre-filled message
  const referrerText = `Promo Referrer: ${referrer}\n\n`;
  const message = `${referrerText}${config.messageTemplate}`;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construct the redirect URL
  const redirectUrl = `https://api.whatsapp.com/send?phone=${config.phone}&text=${encodedMessage}`;
  
  // Redirect the user
  res.redirect(redirectUrl);
});

// Handle subdomain requests
app.get('*', (req, res) => {
  // Extract subdomain from host
  const host = req.hostname;
  const subdomain = host.split('.')[0];
  
  // Get configuration for the requested service
  const config = serviceConfig[subdomain];
  
  if (!config) {
    return res.status(404).send('Service not found');
  }
  
  // Default referrer is 'direct' if none provided
  const referrer = 'direct';
  
  // Construct the WhatsApp URL with phone and pre-filled message
  const referrerText = `Promo Referrer: ${referrer}\n\n`;
  const message = `${referrerText}${config.messageTemplate}`;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construct the redirect URL
  const redirectUrl = `https://api.whatsapp.com/send?phone=${config.phone}&text=${encodedMessage}`;
  
  // Redirect the user
  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`URL redirector listening at http://localhost:${port}`);
});