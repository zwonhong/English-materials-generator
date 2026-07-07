const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');

const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const geminiRoutes = require('./routes/gemini.routes');
const ocrLogRoutes = require('./routes/ocr-log.routes');
const pdfRoutes = require('./routes/pdf.routes');
const pageRoutes = require('./routes/page.routes');

const app = express();

app.disable('x-powered-by');
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(
  session({
    name: 'english_helper_session',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    // This private tool intentionally uses the default in-memory session store.
    // If the app ever becomes multi-user or horizontally scaled, replace this
    // with a persistent session store before deployment maintenance.
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use(authRoutes);
app.use(geminiRoutes);
app.use(pdfRoutes);
app.use(ocrLogRoutes);
app.use(pageRoutes);

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

module.exports = app;
