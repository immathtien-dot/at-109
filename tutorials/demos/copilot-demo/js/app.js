// Simple feed demo logic
const postsEl = document.getElementById('posts');
const contentEl = document.getElementById('content');
const postBtn = document.getElementById('postBtn');
const authorEl = document.getElementById('author');

// Try to load the full banned-word CSV at runtime. If that fails (file:// restrictions), fall back to a small set.
let BANNED = new Set();
function loadBanned(){
  return fetch('4000-most-common-english-words-csv.csv')
    .then(r=>r.text())
    .then(t=>{
      const words = t.split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.toLowerCase().startsWith('source'));
      BANNED = new Set(words.map(w=>w.toLowerCase()));
    })
    .catch(()=>{
      BANNED = new Set(['the','and','a','to','of','in','is','it','you','that']);
    });
}

function sanitize(text){
  if(!text) return '';
  // remove banned words (case-insensitive) but keep punctuation; collapse spaces
  return text.replace(/\b[\w'-]+\b/g, (w)=> BANNED.has(w.toLowerCase()) ? '' : w).replace(/\s+/g,' ').trim();
}

// sample posts (one uses the provided hello.png in images/)
const sample = [
  {id:1, author:'Ava Nguyen', handle:'@avacode', text:'Built a tiny demo of a social feed using plain JS and CSS. Loving the layout!', likes:12, ts:Date.now()-1000*60*45, image: svgPlaceholder(800,420,'Design + Demo')},
  {id:2, author:'Sam Lee', handle:'@sam', text:'Coffee + coding = productivity ☕️💻', likes:4, ts:Date.now()-1000*60*60*5, image:'images/hello.png'},
  {id:3, author:'Maya', handle:'@maya', text:'Anyone tried the new UI kit? It’s smooth.', likes:22, ts:Date.now()-1000*60*60*26, image: svgPlaceholder(800,420,'UI Kit')}
];

function timeAgo(ts){
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return `${s}s`;
  const m = Math.floor(s/60);
  if(m<60) return `${m}m`;
  const h = Math.floor(m/60);
  if(h<24) return `${h}h`;
  const d = Math.floor(h/24);
  return `${d}d`;
}

function createAvatar(name, size='md'){
  const initials = name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const div = document.createElement('div');
  div.className = 'avatar';
  if(size==='sm') div.classList.add('sm');
  if(size==='xs') div.classList.add('xs');
  div.textContent = initials;
  return div;
}

function renderPost(post){
  const el = document.createElement('article');
  el.className = 'post';
  el.dataset.id = post.id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar sm';
  avatar.textContent = post.author.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `\n    <div class="by"><div class="title">${post.author}</div><div class="time">${post.handle} · ${timeAgo(post.ts)}</div></div>\n    <div class="content">${escapeHtml(sanitize(post.text))}</div>\n  `;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'btn like';
  likeBtn.innerHTML = `❤ <span class="count">${post.likes}</span>`;
  likeBtn.addEventListener('click', (ev)=>{
    likeBtn.classList.toggle('active');
    const cnt = likeBtn.querySelector('.count');
    let n = Number(cnt.textContent);
    if(likeBtn.classList.contains('active')) n++; else n--;
    cnt.textContent = n;
    if(likeBtn.classList.contains('active')){
      const clientX = ev && ev.clientX ? ev.clientX : (likeBtn.getBoundingClientRect().left + 10);
      const clientY = ev && ev.clientY ? ev.clientY : (likeBtn.getBoundingClientRect().top + 10);
      createFloatingHearts(clientX, clientY, 12);
    }
  });

  const commentBtn = document.createElement('button');
  commentBtn.className = 'btn';
  commentBtn.textContent = '💬';
  commentBtn.addEventListener('click', ()=>{ contentEl.focus(); });

  const share = document.createElement('button');
  share.className = 'btn';
  share.textContent = '🔁';
  share.addEventListener('click', ()=>{
    navigator.clipboard && navigator.clipboard.writeText(post.text || '').then(()=>{
      share.classList.add('active'); setTimeout(()=>share.classList.remove('active'),400);
    }).catch(()=>{});
  });

  actions.appendChild(likeBtn);
  actions.appendChild(commentBtn);
  actions.appendChild(share);
  meta.appendChild(actions);
  el.appendChild(avatar);
  el.appendChild(meta);

  if(post.image){
    const img = document.createElement('img');
    img.className = 'post-image';
    img.src = post.image;
    img.alt = post.author + ' image';
    meta.appendChild(img);
  }
  return el;
}

function escapeHtml(text){
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML.replace(/\n/g,'<br>');
}

function svgPlaceholder(w=800,h=420,text='Image'){
  const bg1 = '#eef2ff';
  const bg2 = '#e0f2fe';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>\n    <defs>\n      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='${bg1}'/><stop offset='1' stop-color='${bg2}'/></linearGradient>\n    </defs>\n    <rect width='100%' height='100%' fill='url(#g)' rx='12' />\n    <g fill='#94a3b8' font-family='Inter, Arial, sans-serif' font-weight='700' font-size='28'>\n      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${escapeHtml(text)}</text>\n    </g>\n  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

// image upload handling
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewWrap = document.getElementById('previewWrap');
const removePreview = document.getElementById('removePreview');
let imageDataUrl = null;

if(imageInput){
  imageInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      imageDataUrl = reader.result;
      preview.src = imageDataUrl;
      previewWrap.setAttribute('aria-hidden','false');
    };
    reader.readAsDataURL(f);
  });
}

if(removePreview){
  removePreview.addEventListener('click', ()=>{
    imageDataUrl = null;
    preview.src = '';
    imageInput.value = '';
    previewWrap.setAttribute('aria-hidden','true');
  });
}

function createFloatingHearts(x,y,count=10){
  for(let i=0;i<count;i++){
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = '❤';
    const spreadX = (Math.random()-0.5)*80;
    const spreadY = (Math.random()-0.2)*40;
    h.style.left = (x + spreadX) + 'px';
    h.style.top = (y + spreadY) + 'px';
    const dur = (0.8 + Math.random()*0.7).toFixed(2) + 's';
    h.style.setProperty('--float-duration', dur);
    const scale = (0.9 + Math.random()*0.9).toFixed(2);
    h.style.transform = `translate(-50%,-50%) scale(${scale})`;
    document.body.appendChild(h);
    h.addEventListener('animationend', ()=>h.remove());
  }
}

function refresh(){
  postsEl.innerHTML = '';
  sample.sort((a,b)=>b.ts-a.ts).forEach(p=>postsEl.appendChild(renderPost(p)));
}

postBtn.addEventListener('click', ()=>{
  let text = contentEl.value.trim();
  const author = authorEl.value.trim() || 'You';
  const safe = sanitize(text);
  if(!safe && !imageDataUrl) return;
  const newPost = {id:Date.now(), author:author, handle:'@'+author.toLowerCase().replace(/\s+/g,''), text:safe, likes:0, ts:Date.now(), image: imageDataUrl};
  sample.push(newPost);
  contentEl.value='';
  imageDataUrl = null; preview.src=''; imageInput.value=''; previewWrap.setAttribute('aria-hidden','true');
  refresh();
  contentEl.focus();
});

// initialize: load banned words then render
loadBanned().then(()=>refresh());
