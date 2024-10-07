const config = {
    development: {
      frontendUrl: process.env.FRONTEND_URL, // http://localhost:3000


    },
    production: {
      frontendUrl: process.env.FRONTEND_URL, // https://your-production-frontend-url.com

    }
  };
  
  const env = 'development'; // 'development' or 'production'
  
  module.exports = config[env];