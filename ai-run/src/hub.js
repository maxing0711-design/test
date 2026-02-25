import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DEFAULT_PORT = Number(process.env.AI_RUN_HUB_PORT || 18777);
const RETENTION_DAYS = Number(process.env.AI_RUN_RETENTION_DAYS || 10);
const DATA_DIR = process.env.AI_RUN_DATA_DIR || path.join(os.homedir(), '.ai-run');
const LOG_DIR = path.join(DATA_DIR, 'logs');

function ensureDirs() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function pruneOldLogs(days = RETENTION_DAYS) {
  ensureDirs();
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  for (const f of fs.readdirSync(LOG_DIR)) {
    const fp = path.join(LOG_DIR, f);
    try {
      const st = fs.statSync(fp);
      if (st.mtimeMs < cutoff) fs.rmSync(fp, { force: true });
    } catch {}
  }
}

function appendEvent(evt) {
  ensureDirs();
  const day = new Date().toISOString().slice(0, 10);
  const fp = path.join(LOG_DIR, `${day}.jsonl`);
  fs.appendFileSync(fp, JSON.stringify(evt) + '\n', 'utf8');
}

function panelHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ai-run desktop panel</title>
<style>
body{margin:0;background:#0b1020;color:#dbe4ff;font-family:ui-sans-serif,system-ui}
header{padding:10px 14px;border-bottom:1px solid #22345a;display:flex;gap:10px;align-items:center;position:sticky;top:0;background:#0b1020}
.badge{font-size:12px;padding:2px 8px;background:#1b2946;border-radius:999px}
#sessions{padding:8px 12px;border-bottom:1px solid #22345a;font-size:12px;color:#9cb4e2}
#list{padding:10px;display:flex;flex-direction:column;gap:8px}
.card{padding:8px;border:1px solid #23375f;border-radius:10px;background:#111b35}
.card .meta{font-size:11px;color:#8fa7d9}
.card .raw{font-size:12px;color:#a9bde7;white-space:pre-wrap;margin-top:4px}
.card .zh{margin-top:6px}
.card .next{margin-top:4px;color:#92efb4}
.error{border-left:3px solid #ff6b6b}.warn{border-left:3px solid #ffd166}.info{border-left:3px solid #6ea8fe}
.controls{margin-left:auto;display:flex;gap:8px}
button,select{background:#162442;color:#dbe4ff;border:1px solid #2d4675;border-radius:8px;padding:6px 10px}
</style></head><body>
<header><strong>ai-run 本地实时翻译面板</strong><span class="badge">只读 · 不执行终端命令</span><span class="badge">本地存储10天</span>
<div class="controls"><select id="sessionFilter"><option value="all">all sessions</option></select><select id="levelFilter"><option value="all">all levels</option><option value="error">error</option><option value="warn">warn</option><option value="info">info</option></select><button id="pause">暂停</button><button id="clear">清空</button></div></header>
<div id="sessions">sessions: (none)</div><div id="list"></div>
<script>
const list=document.getElementById('list');const sFilter=document.getElementById('sessionFilter');const lFilter=document.getElementById('levelFilter');
const sessionsLabel=document.getElementById('sessions');const pauseBtn=document.getElementById('pause');const clearBtn=document.getElementById('clear');
let paused=false; const knownSessions=new Set();
pauseBtn.onclick=()=>{paused=!paused;pauseBtn.textContent=paused?'继续':'暂停'}; clearBtn.onclick=()=>list.innerHTML='';
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function refreshSessions(){
  const current=sFilter.value; sFilter.innerHTML='<option value="all">all sessions</option>';
  [...knownSessions].sort().forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sFilter.appendChild(o)});
  if([...knownSessions].includes(current)) sFilter.value=current;
  sessionsLabel.textContent='sessions: '+([ ...knownSessions].join(', ')||'(none)');
}
const es=new EventSource('/events');
es.onmessage=(e)=>{if(paused)return; const d=JSON.parse(e.data);
  if(d.sessionId){knownSessions.add(d.sessionId);refreshSessions();}
  if(sFilter.value!=='all' && d.sessionId!==sFilter.value) return;
  if(lFilter.value!=='all' && d.level!==lFilter.value) return;
  const card=document.createElement('div'); card.className='card '+(d.level||'info');
  card.innerHTML='<div class="meta">'+esc(new Date(d.ts||Date.now()).toLocaleTimeString())+' · '+esc(d.sessionId||'default')+' · '+esc(d.level||'info')+'</div>'+
    '<div class="raw">'+esc(d.raw||'')+'</div><div class="zh">'+esc(d.zh||'')+'</div>'+(d.next?'<div class="next">👉 '+esc(d.next)+'</div>':'');
  list.prepend(card);
}
</script></body></html>`;
}

export async function startHub(port = DEFAULT_PORT) {
  ensureDirs();
  pruneOldLogs();
  const clients = new Set();

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/panel')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(panelHtml());
      return;
    }
    if (req.method === 'GET' && req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write('\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    if (req.method === 'POST' && req.url === '/ingest') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const evt = JSON.parse(body || '{}');
          const clean = {
            sessionId: String(evt.sessionId || 'default').slice(0, 64),
            level: ['error', 'warn', 'info'].includes(evt.level) ? evt.level : 'info',
            raw: String(evt.raw || '').slice(0, 3000),
            zh: String(evt.zh || '').slice(0, 3000),
            next: String(evt.next || '').slice(0, 2000),
            source: String(evt.source || 'rule').slice(0, 24),
            ts: Number(evt.ts || Date.now())
          };
          appendEvent(clean);
          const msg = `data: ${JSON.stringify(clean)}\n\n`;
          for (const c of clients) c.write(msg);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end('{"ok":false}');
        }
      });
      return;
    }
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, retentionDays: RETENTION_DAYS }));
      return;
    }
    res.writeHead(404); res.end('Not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => server.close()
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2] || DEFAULT_PORT);
  startHub(port)
    .then(({ url }) => {
      console.log(`[ai-run-hub] running at ${url}`);
      console.log('[ai-run-hub] read-only mode: no terminal command execution');
      console.log(`[ai-run-hub] local retention: ${RETENTION_DAYS} days`);
    })
    .catch((e) => {
      console.error(`[ai-run-hub] failed: ${e.message}`);
      process.exit(1);
    });
}
