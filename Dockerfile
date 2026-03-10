FROM node:18-alpine

WORKDIR /app

# 复制 standalone 构建产物
COPY .next/standalone ./
COPY .next/static ./.next/static
# 复制公共静态文件（图片、favicon 等）
COPY public ./public

ENV PORT=9000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

EXPOSE 9000

CMD ["node", "server.js"]
