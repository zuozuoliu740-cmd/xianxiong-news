#!/bin/bash
# 部署脚本

# 解压到临时目录
cd /root/news-app
tar -xzf /root/news-app.tar.gz -C /tmp/

# 删除旧的 standalone 目录
rm -rf .next/standalone

# 移动新的 standalone 目录
mv /tmp/.next/standalone .next/

# 重启服务
pm2 restart news-app

echo "部署完成"
