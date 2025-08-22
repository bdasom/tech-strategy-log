// Local-first storage key
const KEY = 'dasom-tech-diary-v1';

// Utilities
const $ = (id) => document.getElementById(id);
const fmtDate = (d) => new Date(d).toISOString().slice(0,10);
const today = () => fmtDate(new Date());
const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const saveAll = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
const uid = () => 'e' + Math.random().toString(36).slice(2) + Date.now().toString(36);

const entries = () => load().sort((a,b) => (b.date || '').localeCompare(a.date || ''));

// Dark mode toggle
$('darkToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('invert');
  document.documentElement.classList.toggle('hue-rotate-180');
});

// Tabs
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[id^="tab-"]').forEach(s => s.classList.add('hidden'));
  document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
}));

// Default values
$('date').value = today();
$('lang').value = (new Date().getDate() % 2 === 0) ? 'KR' : 'EN'; // alternate vibe

// Prompt of the Day
const prompts = [
  { type:"Company", en:"Pick a company experimenting with an unproven bet. What metric would you watch first to validate it?", kr:"실험적 베팅을 하는 회사를 하나 고르고, 검증을 위한 최우선 지표를 정해보세요."},
  { type:"Service",  en:"Which service turned a cost-center into a revenue stream? What was the unlock?", kr:"원가성 활동을 수익화한 서비스는? 결정적 전환 포인트는?"},
  { type:"Technology", en:"What AI-in-device (on-device) use-case feels inevitable in the next 12 months?", kr:"향후 12개월 내 불가피해 보이는 온디바이스 AI 사례는?"},
  { type:"Trend", en:"Spot a cross-border consumer behavior shift. How would you localize it for Korea?", kr:"해외서 보이는 소비자 행동 변화를 포착했다면, 한국형 로컬라이징 포인트는?"},
  { type:"Mobility", en:"Which mobility player best monetizes software layers over hardware?", kr:"모빌리티에서 하드웨어 위 소프트웨어로 수익화에 성공한 사례는?"},
  { type:"Healthcare", en:"Name a healthcare workflow ripe for unbundling by a startup.", kr:"스타트업이 언번들링하기 좋은 헬스케어 워크플로우는?"},
  { type:"Media/Content", en:"Which content format is under-monetized on mobile, and how would ads or subs work?", kr:"모바일에서 과소수익화된 콘텐츠 포맷과 적합한 과금 방식은?"},
  { type:"Greentech", en:"Where do consumer incentives align with decarbonization without subsidies?", kr:"보조금 없이도 소비자 인센티브와 탈탄소가 일치하는 영역은?"},
  { type:"Fintech", en:"What 'trust' feature would make you switch financial apps tomorrow?", kr:"내일 바로 앱을 바꾸게 만들 '신뢰' 기능은?"},
  { type:"Platform", en:"What is a platform's most fragile dependency today?", kr:"요즘 플랫폼 비즈니스의 가장 취약한 의존성은?"}
];
function pickPromptByDay() {
  const d = new Date();
  const idx = d.getDate() % prompts.length;
  const p = prompts[idx];
  const isEN = (d.getDate() % 2 === 1); // odd: EN, even: KR
  $('potd').textContent = isEN ? p.en : p.kr;
  $('potdMeta').textContent = `${p.type} · ${isEN ? 'EN' : 'KR'} · ${fmtDate(d)}`;
}
pickPromptByDay();

// Quick one-liner save
$('quickOneLiner').addEventListener('click', () => {
  const one = prompt('한 줄만 입력해도 좋아요. (One-liner)');
  if (!one) return;
  const arr = load();
  arr.push({
    id: uid(),
    date: today(),
    lang: (new Date().getDate() % 2 === 0) ? 'KR' : 'EN',
    category: 'Trend',
    industry: 'IT',
    read: '',
    idea: '',
    flow: '',
    one,
    tags: [],
    createdAt: new Date().toISOString()
  });
  saveAll(arr);
  renderList();
  alert('Saved ✅');
});

// Save form
$('entryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const item = {
    id: uid(),
    date: $('date').value || today(),
    lang: $('lang').value,
    category: $('category').value,
    industry: $('industry').value,
    read: $('read').value.trim(),
    idea: $('idea').value.trim(),
    flow: $('flow').value.trim(),
    one: $('one').value.trim(),
    tags: ($('tags').value || '').split(',').map(s => s.trim()).filter(Boolean),
    createdAt: new Date().toISOString()
  };
  const arr = load();
  arr.push(item);
  saveAll(arr);
  (e.target).reset();
  $('date').value = today();
  renderList();
  alert('Saved ✅');
});

// Filters + list
['q','fCategory','fIndustry','from','to'].forEach(id => {
  $(id).addEventListener('input', renderList);
});
$('clearFilters').addEventListener('click', () => {
  ['q','fCategory','fIndustry','from','to'].forEach(id => $(id).value = '');
  renderList();
});

function passFilters(item) {
  const q = $('q').value.toLowerCase();
  const fCat = $('fCategory').value;
  const fInd = $('fIndustry').value;
  const fFrom = $('from').value;
  const fTo = $('to').value;
  const text = [item.read, item.idea, item.flow, item.one, (item.tags||[]).join(' ')].join(' ').toLowerCase();
  if (q && !text.includes(q)) return false;
  if (fCat && item.category !== fCat) return false;
  if (fInd && item.industry !== fInd) return false;
  if (fFrom && item.date < fFrom) return false;
  if (fTo && item.date > fTo) return false;
  return true;
}

function renderStats(list) {
  const total = list.length;
  const byCat = {};
  const byInd = {};
  list.forEach(e => {
    byCat[e.category] = (byCat[e.category]||0)+1;
    byInd[e.industry] = (byInd[e.industry]||0)+1;
  });
  const catStr = Object.entries(byCat).map(([k,v]) => `${k}:${v}`).join(' · ');
  const indStr = Object.entries(byInd).map(([k,v]) => `${k}:${v}`).join(' · ');
  $('stats').textContent = `Entries: ${total}` + (total ? ` · Category ${catStr} · Industry ${indStr}` : '');
}

function renderList() {
  const arr = entries().filter(passFilters);
  renderStats(arr);
  const container = $('list');
  container.innerHTML = '';
  if (!arr.length) {
    container.innerHTML = '<div class="text-sm text-gray-400">No entries yet. Capture your first note in the Capture tab.</div>';
    return;
  }
  arr.forEach(item => {
    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-gray-800 bg-gray-950 p-4';
    card.innerHTML = `
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="text-xs text-gray-400">${item.date} · ${item.lang} · ${item.category} · ${item.industry}</div>
          <div class="mt-1 text-base font-semibold">${escapeHtml(item.one || '(no one-liner)')}</div>
        </div>
        <div class="flex gap-2">
          <button data-act="copy" data-id="${item.id}" class="px-3 py-1.5 rounded-xl border border-gray-700 text-xs hover:bg-gray-800">Copy MD</button>
          <button data-act="edit" data-id="${item.id}" class="px-3 py-1.5 rounded-xl border border-gray-700 text-xs hover:bg-gray-800">Edit</button>
          <button data-act="delete" data-id="${item.id}" class="px-3 py-1.5 rounded-xl border border-gray-700 text-xs hover:bg-gray-800">Delete</button>
        </div>
      </div>
      <div class="mt-3 prose-like text-sm text-gray-200">
        ${section('Read', item.read)}
        ${section('Idea', item.idea)}
        ${section('Flow', item.flow)}
        ${tagsView(item.tags)}
      </div>
    `;
    container.appendChild(card);
  });
  container.querySelectorAll('button').forEach(btn => {
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    btn.addEventListener('click', () => {
      if (act === 'delete') {
        const ok = confirm('Delete this entry?');
        if (!ok) return;
        const arr = load().filter(e => e.id !== id);
        saveAll(arr);
        renderList();
      } else if (act === 'edit') {
        const arr = load();
        const it = arr.find(e => e.id === id);
        if (!it) return;
        const one = prompt('Edit one-liner:', it.one || '');
        if (one === null) return;
        it.one = one;
        saveAll(arr);
        renderList();
      } else if (act === 'copy') {
        const arr = load();
        const it = arr.find(e => e.id === id);
        navigator.clipboard.writeText(toMarkdown([it]));
        alert('Copied as Markdown ✅');
      }
    });
  });
}
renderList();

function section(title, text) {
  if (!text) return '';
  return `<p><span class="text-gray-400">${title}:</span> ${escapeHtml(text)}</p>`;
}
function tagsView(tags) {
  if (!tags || !tags.length) return '';
  return `<div class="mt-2 flex flex-wrap gap-1">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
}
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Exporters
function download(filename, text) {
  const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function toMarkdown(arr) {
  const lines = [];
  lines.push(`# Tech/Service Strategy Log Export`);
  lines.push(`_Exported: ${new Date().toISOString()}_`);
  lines.push('');
  arr.forEach(e => {
    lines.push(`## ${e.date} · ${e.lang} · ${e.category} · ${e.industry}`);
    if (e.one) lines.push(`**One-liner:** ${e.one}`);
    if (e.read) lines.push(`**Read:** ${e.read}`);
    if (e.idea) lines.push(`**Idea:** ${e.idea}`);
    if (e.flow) lines.push(`**Flow:** ${e.flow}`);
    if (e.tags && e.tags.length) lines.push(`**Tags:** ${e.tags.join(', ')}`);
    lines.push('');
  });
  return lines.join('\n');
}
function toCSV(arr) {
  const esc = (v) => `"${String(v||'').replace(/"/g,'""')}"`;
  const cols = ['date','lang','category','industry','one','read','idea','flow','tags','createdAt'];
  const head = cols.join(',');
  const rows = arr.map(e => cols.map(c => esc(Array.isArray(e[c]) ? e[c].join('|') : e[c])).join(','));
  return [head].concat(rows).join('\n');
}
$('exportMd').addEventListener('click', (e) => {
  e.preventDefault();
  const arr = entries().filter(passFilters);
  download(`tech-strategy-log_${today()}.md`, toMarkdown(arr));
});
$('exportJson').addEventListener('click', (e) => {
  e.preventDefault();
  const arr = entries().filter(passFilters);
  download(`tech-strategy-log_${today()}.json`, JSON.stringify(arr, null, 2));
});
$('exportCsv').addEventListener('click', (e) => {
  e.preventDefault();
  const arr = entries().filter(passFilters);
  download(`tech-strategy-log_${today()}.csv`, toCSV(arr));
});

// Import
$('importJson').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  let data = [];
  try { data = JSON.parse(text); } catch (err) { alert('Invalid JSON'); return; }
  if (!Array.isArray(data)) { alert('JSON must be an array'); return; }
  const arr = load();
  const existingIds = new Set(arr.map(x => x.id));
  data.forEach(x => { if (!existingIds.has(x.id)) arr.push(x); });
  saveAll(arr);
  renderList();
  alert('Imported ✅');
});

// Keyboard helpers
document.addEventListener('keydown', (e) => {
  if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    const one = $('one').value.trim();
    if (!one) return;
    document.querySelector('#entryForm button[type="submit"]').click();
  }
});
