// app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// config.js to update the config
let config;
try {
  config = require('./config');
} catch (error) {
  console.error('Failed to load config:', error);
  process.exit(1);
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.get('/:product?/:referrer?', (req, res) => {
  try {
    // Extract subdomain from host (represents the brand)
    const host = req.hostname || '';
    const subdomain = host.split('.')[0];
    
    // If this is the root domain without subdomain, show a simple homepage
    if (subdomain === 'coverage' || subdomain === 'www') {
      return res.send(`
        <html>
          <head>
            <title>Coverage.my URL Redirector</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
              h1 { color: #333; }
              .container { max-width: 800px; margin: 0 auto; }
              .examples { background: #f5f5f5; padding: 20px; border-radius: 5px; }
              ul { padding-left: 20px; }
              a { color: #0066cc; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Coverage.my URL Redirector</h1>
              <p>Use subdomains to access specific services.</p>
              <div class="examples">
                <p><strong>Examples:</strong></p>
                <ul>
                  <li><a href="https://unifi.coverage.my/fibre/direct">unifi.coverage.my/fibre/direct</a> - Unifi Fibre</li>
                  <li><a href="https://unifi.coverage.my/biz/direct">unifi.coverage.my/biz/direct</a> - Unifi Business</li>
                  <li><a href="https://astro.coverage.my/fibre/direct">astro.coverage.my/fibre/direct</a> - Astro Fibre</li>
                  <li><a href="https://maxis.coverage.my/fibre/direct">maxis.coverage.my/fibre/direct</a> - Maxis Fibre</li>
                  <li><a href="https://celcomdigi.coverage.my/fibre/direct">celcomdigi.coverage.my/fibre/direct</a> - CelcomDigi Fibre</li>
                </ul>
              </div>
            </div>
          </body>
        </html>
      `);
    }
    
    // Get brand config
    const brandConfig = config[subdomain];
    if (!brandConfig) {
      return res.status(404).send(`Brand '${subdomain}' not found`);
    }
    
    // Get product (from path parameter or default to first product available)
    const product = req.params.product || Object.keys(brandConfig)[0];
    
    // Get product config
    const productConfig = brandConfig[product];
    if (!productConfig) {
      return res.status(404).send(`Product '${product}' not found for brand '${subdomain}'`);
    }
    
    // Get referrer (from path parameter or default to 'direct')
    const referrer = req.params.referrer || 'direct';
    
    // Construct the WhatsApp URL with phone and pre-filled message
    const referrerText = `Promo Referrer: ${referrer}\n\n`;
    const message = `${referrerText}${productConfig.messageTemplate}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Construct the redirect URL
    const redirectUrl = `https://api.whatsapp.com/send?phone=${productConfig.phone}&text=${encodedMessage}`;
    
    // Redirect the user
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fallback handler for undefined routes
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start the server with error handling
app.listen(port, () => {
  console.log(`URL redirector listening at http://localhost:${port}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
});

// For serverless environments, export the app
module.exports = app;