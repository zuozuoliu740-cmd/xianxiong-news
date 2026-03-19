module.exports = {
  apps: [{
    name: 'news-app',
    script: './.next/standalone/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      JUHE_API_KEY: '73de630ba83f999df435c7ccfb44daf1',
      DASHSCOPE_API_KEY: 'sk-d87066276bc840afa203cb66ccc7970b'
    }
  }]
};
