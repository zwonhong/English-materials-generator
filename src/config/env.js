const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
  quiet: true,
});

const requiredKeys = ['MASTER_ID', 'MASTER_PASSWORD', 'SESSION_SECRET'];
const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
}

function warnAboutWeakProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const warnings = [];

  if (process.env.SESSION_SECRET.length < 32) {
    warnings.push('SESSION_SECRET should be at least 32 characters in production.');
  }

  if (
    process.env.MASTER_ID === 'your_master_id' ||
    process.env.MASTER_PASSWORD === 'your_master_password' ||
    process.env.SESSION_SECRET === 'replace_with_a_long_random_string'
  ) {
    warnings.push('Replace placeholder .env values before production deployment.');
  }

  warnings.forEach((warning) => {
    console.warn(`[environment warning] ${warning}`);
  });
}

warnAboutWeakProductionSecrets();

module.exports = Object.freeze({
  masterId: process.env.MASTER_ID,
  masterPassword: process.env.MASTER_PASSWORD,
  sessionSecret: process.env.SESSION_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT, 10) || 3000,
});
