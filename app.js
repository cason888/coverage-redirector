// app.js
const express = require('express');
const app = express();

// Embed config directly in app.js to avoid import issues in serverless environments
const config = {
  unifi: {
    fibre: {
      phone: "601113315950",
      messageTemplate: "Hi, saya nak check coverage Unifi Fibre, alamat saya: "
    },
    biz: {
      phone: "601113315950",
      messageTemplate: "Hi, saya berminat dengan Unifi Business, boleh saya tahu pakej yang sesuai untuk business saya? "
    }
  },
  astro: {
    fibre: {
      phone: "601118610166",
      messageTemplate: "Hi, saya nak check coverage Astro Fibre, alamat saya: "
    },
    tv: {
      phone: "601118610166",
      messageTemplate: "Hi, saya berminat dengan Astro TV, boleh saya tahu pakej yang tersedia? "
    },
    biz: {
      phone: "601118610166",
      messageTemplate: "Hi, saya berminat dengan Astro Business solution, boleh share info untuk syarikat saya? "
    }
  },
  maxis: {
    fibre: {
      phone: "601113207374",
      messageTemplate: "Hi, saya nak check coverage Maxis Fibre, alamat saya: "
    },
    biz: {
      phone: "601113207374",
      messageTemplate: "Hi, saya berminat dengan Maxis Business, boleh kontak saya tentang penyelesaian untuk perniagaan saya? "
    }
  },
  celcomdigi: {
    fibre: {
      phone: "601158518452",
      messageTemplate: "Hi, saya nak check coverage CelcomDigi Fibre, alamat saya: "
    }
  }
};

// Add middleware to log requests - helps with debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.headers.host}`);
  next();
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.get('/:product?/:referrer?', (req, res) => {
  try {
    // Extract subdomain from host (represents the brand)
    const host = req.headers.host || req.hostname || '';
    console.log('Host header:', host);
    
    const subdomain = host.split('.')[0];
    console.log('Subdomain:', subdomain);
    
    // If this is the root domain without subdomain, show a simple homepage
    if (!subdomain || subdomain === 'coverage' || subdomain === 'www') {
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

// Fallback route handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// For local development only - not used in Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`URL redirector listening at http://localhost:${port}`);
  });
}

// Export for Vercel serverless function
module.exports = app;