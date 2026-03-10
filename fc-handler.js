'use strict';

process.env.NODE_ENV = 'production';
process.env.PORT = '9001';
process.env.HOSTNAME = '127.0.0.1';

const http = require('http');
const PORT = 9001;

// 同步启动服务器（require 是同步的，server.js 会异步监听端口）
let launched = false;
function ensureLaunched() {
  if (launched) return;
  launched = true;
  try {
    require('./server.js');
    console.log('[FC] server.js loaded');
  } catch (e) {
    console.error('[FC] server.js error:', e.message);
  }
}

// 尝试一次代理请求
function proxyOnce(method, url, headers, body) {
  return new Promise((resolve) => {
    const opts = {
      hostname: '127.0.0.1',
      port: PORT,
      path: url,
      method,
      headers: Object.assign({}, headers, {
        host: `127.0.0.1:${PORT}`,
        'content-length': body.length,
      }),
    };

    const proxyReq = http.request(opts, (proxyResp) => {
      const parts = [];
      proxyResp.on('data', c => parts.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      proxyResp.on('end', () => {
        resolve({
          ok: true,
          status: proxyResp.statusCode || 200,
          headers: proxyResp.headers,
          body: Buffer.concat(parts),
        });
      });
      proxyResp.on('error', () => resolve({ ok: false }));
    });

    proxyReq.setTimeout(2000, () => { proxyReq.destroy(); resolve({ ok: false }); });
    proxyReq.on('error', () => resolve({ ok: false }));

    if (body.length > 0) proxyReq.write(body);
    proxyReq.end();
  });
}

// FC3 HTTP handler
module.exports.handler = async (req, resp, context) => {
  ensureLaunched();

  const method = req.method || 'GET';
  const url = req.url || req.path || '/';

  // 读取请求体
  let body = Buffer.alloc(0);
  if (typeof req.on === 'function') {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', () => resolve(Buffer.alloc(0)));
    });
  }

  const headers = req.headers || {};
  console.log(`[FC] ${method} ${url}`);

  // 等服务器就绪，最多等 30 秒
  let result = { ok: false };
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1000));
    result = await proxyOnce(method, url, headers, body);
    if (result.ok) break;
    if (i === 0) console.log('[FC] Waiting for server...');
  }

  if (!result.ok) {
    console.error('[FC] Server failed to respond');
    try {
      resp.statusCode = 503;
      resp.setHeader('content-type', 'text/html; charset=utf-8');
      resp.end('<h1>Service Starting...</h1><p>Please refresh the page in a moment.</p>');
    } catch (_) {}
    return;
  }

  // 写入响应
  try {
    resp.statusCode = result.status;
    const skip = new Set(['transfer-encoding', 'connection', 'keep-alive']);
    for (const [k, v] of Object.entries(result.headers || {})) {
      if (!skip.has(k.toLowerCase())) {
        try { resp.setHeader(k, v); } catch (_) {}
      }
    }
    resp.end(result.body);
  } catch (e) {
    console.error('[FC] write resp error:', e.message);
  }
};
