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
      DASHSCOPE_API_KEY: 'sk-d87066276bc840afa203cb66ccc7970b',
      BOCHA_API_KEY: 'sk-f173213b78004805a232a5dea805567d',
      DATA_DIR: '/root/news-app/data',
      WX_APPID: 'wxd630488930210e53',
      WX_APPSECRET: '8d3b70311771c488715521f8f13253b6'
    }
  }]
};
