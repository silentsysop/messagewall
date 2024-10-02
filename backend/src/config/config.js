const config = {
    development: {
      frontendUrl: 'http://localhost:3000', // http://localhost:3000


    },
    production: {
      frontendUrl: 'https://your-production-frontend-url.com',

    }
  };
  
  const env = 'development';
  
  module.exports = config[env];