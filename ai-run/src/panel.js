import http from 'node:http';

function htmlTemplate() {
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ai-run panel</title>
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;margin:0;background:#0b1020;color:#dbe4ff}
header{padding:12px 16px;border-bottom:1px solid #24314d;display:flex;gap:10px;align-items:center;position:sticky;top:0;background:#0b1020}
.badge{padding:2px 8px;border-radius:999px;background:#1c2740;color:#9db3df;font-size:12px}
#list{padding:12px;display:flex;flex-direction:column;gap:10px}
.card{border:1px solid #24314d;border-radius:10px;padding:10px;background:#101933}
.raw{color:#9bb0d9;font-size:12px;white-space:pre-wrap}
.zh{margin-top:6px;font-size:14px}
.next{margin-top:4px;color:#8be9a9;font-size:13px}
.error{border-left:3px solid #ff6b6b}.warn{border-left:3px solid #ffd166}.info{border-left:3px solid #6ea8fe}
.controls{margin-left:auto;display:flex;gap:8px}
button,select{background:#17233f;color:#dbe4ff;border:1px solid #2a3e67;border-radius:8px;padding:6px 10px}
</style></head>
<body>
<header>
  <strong>ai-run 实时翻译面板</strong>
  <span class="badge">不影响原终端</span>
  <div class="controls">
    <select id="filter"><option value="all">all</option><option value="error">error</option><option value="warn">warn</option><option value="info">info</option></select>
    <button id="pause">暂停</button>
    <button id="clear">清空</button>
  </div>
</header>
<div id="list"></div>
<script>
const list=document.getElementById('list');
const filterEl=document.getElementById('filter');
const pauseBtn=document.getElementById('pause');
const clearBtn=document.getElementById('clear');
let paused=false, filter='all';
filterEl.onchange=()=>filter=filterEl.value;
pauseBtn.onclick=()=>{paused=!paused;pauseBtn.textContent=paused?'继续':'暂停'};
clearBtn.onclick=()=>{list.innerHTML=''};
const es=new EventSource('/events');
es.onmessage=(evt)=>{
  if(paused) return;
  const d=JSON.parse(evt.data);
  if(filter!=='all' && d.level!==filter) return;
  const card=document.createElement('div');
  card.className='card '+(d.level||'info');
  card.innerHTML='<div class="raw">'+escapeHtml(d.raw||'')+'</div>'+
    '<div class="zh">'+escapeHtml(d.zh||'')+'</div>'+
    (d.next?'<div class="next">👉 '+escapeHtml(d.next)+'</div>':'');
  list.prepend(card);
};
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
</script>
</body></html>`;
}

export function startPanelServer(port = 18777) {
  const clients = new Set();

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/panel') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(htmlTemplate());
      return;
    }

    if (req.url === '/events') {
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

    res.writeHead(404);
    res.end('Not found');
  });

  function publish(payload) {
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of clients) client.write(msg);
  }

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        publish,
        close: () => server.close()
      });
    });
  });
}
