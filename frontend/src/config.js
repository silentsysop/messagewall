const config = {
    development: {
      backendUrl: process.env.REACT_APP_BACKEND_URL, // http://localhost:5000/api
      socketUrl: process.env.REACT_APP_SOCKET_URL, // http://localhost:5000

    },
    production: {
      backendUrl: process.env.REACT_APP_BACKEND_URL, // https://your-production-backend-url.com/api
      socketUrl: process.env.REACT_APP_SOCKET_URL, // https://your-production-backend-url.com
    }
  };
  
  const env = 'development';
  
  module.exports = config[env];