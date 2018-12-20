require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const privateKey = fs.existsSync(process.env.HTTPS_PRIV_KEY_FILE) ? fs.readFileSync(process.env.HTTPS_PRIV_KEY_FILE, 'utf8') : null;
const certificate = fs.existsSync(process.env.HTTPS_CERT_FILE) ? fs.readFileSync(process.env.HTTPS_CERT_FILE, 'utf8') : null;
const ca = fs.existsSync(process.env.HTTPS_CA_FILE) ? fs.readFileSync(process.env.HTTPS_CA_FILE, 'utf8') : null;

const app = express();

const httpsOptions = {
  key: privateKey,
  cert: certificate,
  ca,
};

app.get('*', function(req, res, next) {  
  if (!req.secure && process.env.ENV_TYPE === 'production') {
    res.redirect('https://' + req.headers.host + req.url);
  } else {
    next();
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use(express.static(process.env.SERVE_DIRECTORY));
/* app.get('/', (req, res) => {
  return res.end('<p>This server serves up static files.</p>');
}); */

const httpServer = http.createServer(app).listen(process.env.PORT_HTTP, () => {
  console.log(`app running on port ${httpServer.address().port}`);
});

const httpsServer = https.createServer(httpsOptions, app).listen(process.env.PORT_HTTPS, () => {
  console.log(`app running on port ${httpsServer.address().port}`);
});