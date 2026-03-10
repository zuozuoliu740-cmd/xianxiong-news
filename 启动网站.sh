#!/bin/bash
# 先雄的新闻网站 - 启动脚本

cd "$(dirname "$0")"
echo "正在启动先雄的新闻网站..."
echo "启动后请在浏览器访问: http://localhost:3000"
echo ""
npm run dev
