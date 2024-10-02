const config = {
    development: {
      backendUrl: 'http://localhost:5000/api', // http://localhost:5000/api
      socketUrl: 'http://localhost:5000', // http://localhost:5000

    },
    production: {
      backendUrl: 'https://your-production-backend-url.com/api',
      socketUrl: 'https://your-production-backend-url.com',
    }
  };
  
  const env = 'development';
  
  module.exports = config[env];