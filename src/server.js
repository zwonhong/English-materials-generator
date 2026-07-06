const app = require('./app');
const env = require('./config/env');

const port = env.port;

app.listen(port, () => {
  console.log(`English Helper server is running on http://localhost:${port}`);
});
