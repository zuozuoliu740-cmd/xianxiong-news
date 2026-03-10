#!/bin/bash
# ============================================================
#  先雄新闻网站 - 服务器初始化 & 启动脚本
#  在阿里云 ECS 服务器上执行（Ubuntu 22.04）
#  执行方法：bash /root/server-setup.sh
# ============================================================

set -e

APP_DIR="/root/news-app"
STANDALONE_DIR="$APP_DIR/.next/standalone"

echo ""
echo "================================================"
echo "  先雄新闻网站 - 服务器初始化"
echo "================================================"
echo ""

# ---- 检测是否已安装 Node.js ----
if ! command -v node &> /dev/null; then
  echo "[1/5] 安装 Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt install -y nodejs
  echo "      Node.js $(node -v) 安装完成 ✓"
else
  echo "[1/5] Node.js 已安装：$(node -v) ✓"
fi

# ---- 检测是否已安装 PM2 ----
if ! command -v pm2 &> /dev/null; then
  echo "[2/5] 安装 PM2..."
  npm install -g pm2
  echo "      PM2 安装完成 ✓"
else
  echo "[2/5] PM2 已安装 ✓"
fi

# ---- 检测是否已安装 Nginx ----
if ! command -v nginx &> /dev/null; then
  echo "[3/5] 安装 Nginx..."
  apt install -y nginx
  systemctl enable nginx
  echo "      Nginx 安装完成 ✓"
else
  echo "[3/5] Nginx 已安装 ✓"
fi

# ---- 解压项目 ----
echo "[4/5] 解压项目文件..."
mkdir -p "$APP_DIR"
tar -xzf /root/news-app.tar.gz -C "$APP_DIR"

# 复制静态资源到 standalone 目录
cp -rf "$APP_DIR/.next/static" "$STANDALONE_DIR/.next/static"
cp -rf "$APP_DIR/public" "$STANDALONE_DIR/public"
echo "      解压完成 ✓"

# ---- 配置环境变量 & 启动 ----
echo "[5/5] 启动网站..."

# 创建 PM2 生态配置文件（持久化环境变量）
cat > "$STANDALONE_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'news-app',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
      // 如有 Brave API Key，填在下面：
      BRAVE_API_KEY: '',
    },
  }],
};
EOF

cd "$STANDALONE_DIR"

# 停止旧进程（如有）
pm2 stop news-app 2>/dev/null || true
pm2 delete news-app 2>/dev/null || true

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup

echo "      网站启动完成 ✓"

# ---- 获取服务器 IP ----
SERVER_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

# ---- 配置 Nginx ----
echo ""
echo "配置 Nginx 反向代理..."

cat > /etc/nginx/sites-available/news-app << NGINX_EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    # 静态资源直接由 Next.js standalone 处理，Nginx 只做反代
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX_EOF

# 启用配置（避免重复链接）
rm -f /etc/nginx/sites-enabled/news-app
ln -s /etc/nginx/sites-available/news-app /etc/nginx/sites-enabled/news-app

# 移除默认站点（避免冲突）
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "Nginx 配置完成 ✓"

echo ""
echo "================================================"
echo "  部署完成！"
echo ""
echo "  网站地址：http://${SERVER_IP}"
echo ""
echo "  常用命令："
echo "    pm2 logs news-app     查看运行日志"
echo "    pm2 restart news-app  重启网站"
echo "    pm2 status            查看进程状态"
echo "================================================"
echo ""
