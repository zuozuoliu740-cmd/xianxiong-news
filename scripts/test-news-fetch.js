/**
 * test-news-fetch.js
 * 测试所有新闻源的抓取能力
 * 
 * 用法: node scripts/test-news-fetch.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 读取配置
const configPath = path.join(__dirname, '..', 'config', 'news-sources.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 简单的 HTTP/HTTPS 请求封装
function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      timeout,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// 从 RSS XML 中提取 <title> 内容
function extractRSSTitles(xml, max = 5) {
  const titles = [];
  // 先清理 CDATA
  const clean = xml.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
  const re = /<item[\s\S]*?<title>([\s\S]*?)<\/title>/gi;
  let match;
  while ((match = re.exec(clean)) && titles.length < max) {
    const title = match[1].replace(/<[^>]*>/g, '').trim();
    if (title.length > 3) titles.push(title);
  }
  return titles;
}

// 测试聚合数据 API
async function testJuheAPI() {
  const apiKey = process.env.JUHE_API_KEY || '73de630ba83f999df435c7ccfb44daf1';
  const types = config.apis.juhe.types;
  
  console.log('\n' + '='.repeat(60));
  console.log('  聚合数据 API 测试');
  console.log('='.repeat(60));
  
  for (const type of types.slice(0, 3)) { // 只测3个类型，节省额度
    try {
      const url = `http://v.juhe.cn/toutiao/index?type=${type}&key=${apiKey}&page_size=3`;
      const res = await fetchUrl(url);
      const json = JSON.parse(res.data);
      
      if (json.error_code === 0 && json.result && json.result.data) {
        const items = json.result.data;
        console.log(`\n  [${type}] ${items.length} 条`);
        items.forEach((item, i) => {
          console.log(`    ${i + 1}. ${item.title.slice(0, 45)}`);
        });
      } else {
        console.log(`\n  [${type}] 失败: error_code=${json.error_code}, reason=${json.reason}`);
      }
    } catch (err) {
      console.log(`\n  [${type}] 错误: ${err.message}`);
    }
  }
}

// 测试 RSS 源
async function testRSSSources() {
  console.log('\n' + '='.repeat(60));
  console.log('  RSS 新闻源测试');
  console.log('='.repeat(60));
  
  const rssSources = config.sources.filter(s => s.type === 'rss');
  
  for (const source of rssSources) {
    try {
      const res = await fetchUrl(source.rss);
      const titles = extractRSSTitles(res.data);
      
      if (titles.length > 0) {
        console.log(`\n  [${source.name}] ${titles.length} 条 (HTTP ${res.status})`);
        titles.forEach((t, i) => console.log(`    ${i + 1}. ${t.slice(0, 50)}`));
      } else {
        console.log(`\n  [${source.name}] 无法解析标题 (HTTP ${res.status}, 内容长度 ${res.data.length})`);
      }
    } catch (err) {
      console.log(`\n  [${source.name}] 错误: ${err.message}`);
    }
  }
}

// 测试本地 API（需要 dev server 运行中）
async function testLocalAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('  本地 API 端点测试');
  console.log('='.repeat(60));
  
  const endpoints = [
    { name: '各源实时内容', url: 'http://localhost:3000/api/news/sources' },
    { name: '通用新闻',     url: 'http://localhost:3000/api/news' },
    { name: '伊朗新闻',     url: 'http://localhost:3000/api/news?iran=true' },
    { name: '钉钉新闻',     url: 'http://localhost:3000/api/news?ding=true' },
    { name: '蚂蚁新闻',     url: 'http://localhost:3000/api/news?ant=true' },
    { name: '本地新闻',     url: 'http://localhost:3000/api/news?local=true' },
    { name: '缓存刷新',     url: 'http://localhost:3000/api/news/refresh' },
  ];
  
  for (const ep of endpoints) {
    try {
      const res = await fetchUrl(ep.url, 30000);
      const json = JSON.parse(res.data);
      const cacheControl = res.headers['cache-control'] || '(未设置)';
      
      if (json.sources) {
        // sources 端点
        const total = json.sources.reduce((sum, s) => sum + (s.items?.length || 0), 0);
        const okCount = json.sources.filter(s => s.ok).length;
        console.log(`\n  [${ep.name}] ${okCount}/${json.sources.length} 源成功, 共 ${total} 条`);
      } else if (json.news) {
        console.log(`\n  [${ep.name}] ${json.news.length} 条 | 分类: ${json.category}`);
      } else if (json.success !== undefined) {
        console.log(`\n  [${ep.name}] ${json.success ? '成功' : '失败'}: ${json.message}`);
      }
      console.log(`    Cache-Control: ${cacheControl}`);
    } catch (err) {
      console.log(`\n  [${ep.name}] 错误: ${err.message} (服务器是否已启动?)`);
    }
  }
}

// 主测试流程
async function main() {
  console.log('');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + '   先雄新闻 - 新闻抓取能力测试'.padEnd(47) + '║');
  console.log('║' + `   ${new Date().toLocaleString('zh-CN')}`.padEnd(52) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  
  let passCount = 0;
  let failCount = 0;
  
  // 1. 测试 RSS
  await testRSSSources();
  
  // 2. 测试聚合数据
  await testJuheAPI();
  
  // 3. 测试本地 API
  await testLocalAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('  测试完成');
  console.log('='.repeat(60));
  console.log('');
}

main().catch(err => {
  console.error('测试异常:', err);
  process.exit(1);
});
