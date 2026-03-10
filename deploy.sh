#!/bin/bash
# ============================================================
#  先雄新闻网站 - 一键部署到阿里云 ECS
#  使用方法：
#    首次部署：  bash deploy.sh <服务器IP>
#    更新部署：  bash deploy.sh <服务器IP>
#  示例：
#    bash deploy.sh 47.100.200.123
# ============================================================

set -e

SERVER_IP="${1}"

if [ -z "$SERVER_IP" ]; then
  echo "用法: bash deploy.sh <服务器公网IP>"
  echo "例如: bash deploy.sh 47.100.200.123"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "================================================"
echo "  先雄新闻网站 部署脚本"
echo "  目标服务器: $SERVER_IP"
echo "================================================"
echo ""

# ---------- 第一步：本地构建 ----------
echo "[1/3] 正在构建项目..."
npm run build
echo "      构建完成 ✓"

# ---------- 第二步：打包 ----------
echo "[2/3] 正在打包..."
tar -czf news-app.tar.gz \
  .next/standalone \
  .next/static \
  public
echo "      打包完成 ✓  (news-app.tar.gz)"

# ---------- 第三步：上传 ----------
echo "[3/3] 正在上传到服务器 $SERVER_IP ..."
echo "      (可能需要输入服务器 root 密码)"
scp news-app.tar.gz root@${SERVER_IP}:/root/
scp server-setup.sh root@${SERVER_IP}:/root/
echo "      上传完成 ✓"

echo ""
echo "================================================"
echo "  本地操作全部完成！"
echo ""
echo "  接下来请 SSH 登录服务器执行初始化："
echo "    ssh root@${SERVER_IP}"
echo "    bash /root/server-setup.sh"
echo "================================================"
echo ""
