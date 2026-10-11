'use strict';
(() => {
  const bank = window.QUESTION_BANK;
  const byId = new Map(bank.map(q => [q.id, q]));
  const STORAGE = 'quizghor-v1';
  const labels = { physics: 'পদার্থবিজ্ঞান', chemistry: 'রসায়ন' };
  const bn = n => Number(n).toLocaleString('bn-BD');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    home:'<path d="m3 10 7-6 7 6v8h-5v-5H8v5H3z"/>',
    grid:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="13" y="3" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><rect x="13" y="13" width="6" height="6" rx="1"/>',
    book:'<path d="M11 5c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM11 5v14"/>',
    chart:'<path d="M3 3v16h17M7 14v-4m5 4V6m5 8v-7"/>',
    bookmark:'<path d="M6 3h10v16l-5-3-5 3z"/>',
    arrow:'<path d="m8 5 6 6-6 6"/>',
    back:'<path d="m13 5-6 6 6 6"/>',
    check:'<path d="m5 11 4 4 8-9"/>',
    cross:'<path d="m6 6 10 10M16 6 6 16"/>',
    star:'<path d="m11 2 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z"/>',
    target:'<circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="4"/><circle cx="11" cy="11" r="1"/>',
    atom:'<ellipse cx="11" cy="11" rx="10" ry="4"/><ellipse cx="11" cy="11" rx="10" ry="4" transform="rotate(60 11 11)"/><ellipse cx="11" cy="11" rx="10" ry="4" transform="rotate(120 11 11)"/><circle cx="11" cy="11" r="1"/>',
    flask:'<path d="M8 2h6M9 2v7L4 17q-1 3 2 3h10q3 0 2-3l-5-8V2M7 13h8M8 16h1m4 1h1"/>',
    bolt:'<path d="m12 2-8 11h6l-1 7 9-12h-6z"/>',
    bulb:'<path d="M7 15C0 8 7 1 12 3c6 2 6 8 2 12v3H7zM8 21h5M9 15v-5m3 5v-5"/>',
    clock:'<circle cx="11" cy="11" r="8"/><path d="M11 6v6l4 2"/>',
    trophy:'<path d="M6 3h10v5c0 6-10 6-10 0zM6 5H3v3q0 4 4 4m9-7h3v3q0 4-4 4M11 13v5m-4 2h8M9 18h4"/>',
    users:'<circle cx="8" cy="7" r="3"/><path d="M2 19v-3q0-5 6-5t6 5v3M15 4q5 0 4 5m-3 3q5 0 5 6"/>',
    leaf:'<path d="M4 18C0 4 14 3 19 3c0 13-7 20-15 15zm0 0 11-9"/>'
  };
  const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 22 22" aria-hidden="true">${paths[name]||paths.star}</svg>`;
  const scientist = `<svg class="scientist" viewBox="0 0 80 85" aria-hidden="true"><circle cx="40" cy="41" r="33" fill="#f5ba76"/><path d="M20 79q2-24 20-25 18 1 21 25" fill="#fff9ef" stroke="#60432c" stroke-width="1.5"/><path d="m34 57 6 9 7-10M40 66v16M27 64l2 19m24-19-2 19" fill="none" stroke="#60432c" stroke-width="1.4"/><path d="M27 31q-4-19 12-17 18-6 16 18l-7 12H31z" fill="#60432c"/><path d="M28 30q-1-11 13-10 13 0 12 12l-1 12q-2 14-12 14-11-1-12-15z" fill="#ffe8cf" stroke="#60432c" stroke-width="1.4"/><path d="m27 28 11-8 7 8 10 2" fill="#60432c"/><g fill="none" stroke="#60432c" stroke-width="1.4"><circle cx="34" cy="36" r="6"/><circle cx="48" cy="36" r="6"/><path d="M40 35h2m-2 4-2 6h4m-8 3q6 5 12 0"/></g><circle cx="34" cy="36" r="1.3" fill="#60432c"/><circle cx="48" cy="36" r="1.3" fill="#60432c"/><path d="M57 67q7 0 9-8m-1-1 3-6m-3 6-1-6" fill="none" stroke="#60432c" stroke-width="2"/><path d="m12 17 3-5m-7 9-5-2m13-3 5-1" stroke="#2e9673" stroke-width="2"/></svg>`;
  let state = {name:'শিক্ষার্থী',history:{},bookmarks:[],session:null};
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE));
    if(stored && typeof stored === 'object') {
      if(typeof stored.name==='string') state.name=stored.name.slice(0,25);
      if(stored.history && typeof stored.history==='object' && !Array.isArray(stored.history)) {
        for(const [id,h] of Object.entries(stored.history)) if(byId.has(id) && h && Number.isInteger(h.attempts) && h.attempts>=0 && Number.isInteger(h.correct) && h.correct>=0 && h.correct<=h.attempts) state.history[id]=h;
      }
      if(Array.isArray(stored.bookmarks)) state.bookmarks=[...new Set(stored.bookmarks.filter(id=>byId.has(id)))];
      const s=stored.session;
      if(s && Array.isArray(s.ids) && s.ids.length && s.ids.every(id=>byId.has(id)) && Array.isArray(s.answers) && s.answers.length===s.ids.length && Number.isInteger(s.index) && s.index>=0 && s.index<s.ids.length && Number.isFinite(s.startedAt) && ['practice','timed'].includes(s.mode)) state.session=s;
    }
  } catch { /* A fresh session remains usable when browser storage is unavailable. */ }
  let view='home', filter='physics', quizOpen=false, toastTimer;
  const quizDialog = document.querySelector('#quiz-dialog');
  const quizPanel = document.querySelector('#quiz-panel');
  const quizSlot = document.querySelector('#quiz-slot');
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{toast('ব্রাউজারে সেভ করা যাচ্ছে না। এই সেশনে অনুশীলন চালিয়ে যেতে পারবে।');}};
  const stats=()=>{const all=Object.values(state.history);return {unique:all.length,attempts:all.reduce((a,h)=>a+h.attempts,0),correct:all.reduce((a,h)=>a+h.correct,0),firstCorrect:all.filter(h=>h.firstCorrect).length,wrong:all.filter(h=>!h.lastCorrect).length};};
  const wrongIds=()=>bank.filter(q=>state.history[q.id]&&!state.history[q.id].lastCorrect).map(q=>q.id);
  const topicList = subject => [...new Set(bank.filter(q=>q.subject===subject).map(q=>q.chapter))];
  const navItems=[['home','home','হোম'],['chapters','grid','বিষয় ও অধ্যায়'],['revision','book','ভুলের খাতা'],['bookmarks','bookmark','বুকমার্ক'],['progress','chart','অগ্রগতি']];
  function renderNav(){
    const html=navItems.map(([id,i,label])=>`<button class="nav-link ${view===id&&!quizOpen?'active':''}" data-view="${id}">${icon(i)}<span>${label}</span>${id==='revision'?`<span class="nav-count">${bn(stats().wrong)}</span>`:''}</button>`).join('');
    document.querySelector('.desktop-nav').innerHTML=html;
    document.querySelector('.mobile-nav').innerHTML=html;
    document.querySelector('.mini').textContent=Array.from(state.name)[0]||'শ';
  }
  function subjectCard(subject){
    const qs=bank.filter(q=>q.subject===subject),done=qs.filter(q=>state.history[q.id]).length;
    return `<button class="subject-card" data-subject="${subject}"><span class="subject-icon ${subject}">${icon(subject==='physics'?'atom':'flask')}</span><span class="subject-copy"><h3>${labels[subject]}</h3><p>${bn(qs.length-done)}টি প্রশ্ন বাকি <span class="subject-meta">· ${bn(topicList(subject).length)}টি অধ্যায়</span></p><span class="thin-progress"><span style="width:${done}%"></span></span></span>${icon('arrow')}</button>`;
  }
  function renderDashboard(){
    const el=document.querySelector('#dashboard'),s=stats();
    if(view==='home') {
      el.innerHTML=`<div class="greeting"><div><span class="eyebrow">আজও একটু এগিয়ে যাই</span><h1>হ্যালো, ${esc(state.name)}! <span class="wave">👋</span></h1><p>তোমাকে আবার দেখে ভালো লাগছে।</p></div>${scientist}</div>
      <div class="stats-banner"><div class="stat-block">${icon('star')}<div><strong class="stat-value">${bn(s.correct*10)}</strong><span class="stat-caption">অর্জিত পয়েন্ট</span></div></div><div class="stat-block">${icon('target')}<div><strong class="stat-value">${bn(s.unique)}<span style="font-size:13px;opacity:.7"> / ২০০</span></strong><span class="stat-caption">প্রশ্নের অনুশীলন</span></div></div></div>
      <div class="section-heading"><span>${icon('bolt')} প্রতিদিনের অনুশীলন</span><span class="eyebrow">ছোট অভ্যাস, বড় পরিবর্তন</span></div>
      <button class="daily-card" data-action="daily"><span class="daily-label">${icon('clock')} ১৫ মিনিট</span><span class="daily-icon">${icon('bolt')}</span><span><h2>আজকের কুইজ</h2><p>২০টি মিশ্র প্রশ্ন · নিজেকে যাচাই করো</p></span>${icon('arrow','daily-arrow')}</button>
      <div class="section-heading"><span>${icon('book')} পড়া চালিয়ে যাও</span><button class="text-button" data-view="chapters">সব অধ্যায় ${'↗'}</button></div><div class="subject-list">${subjectCard('physics')}${subjectCard('chemistry')}<button class="subject-card" data-view="revision"><span class="subject-icon revision">${icon('book')}</span><span class="subject-copy"><h3>ভুলের খাতা</h3><p>${s.wrong?bn(s.wrong)+'টি প্রশ্ন আবার দেখে নাও':'ভুলগুলো শুধরে, আরও ভালো শেখো'}</p></span>${icon('arrow')}</button></div>
      <div class="tip-card">${icon('bulb')}<p><strong>শুধু উত্তর নয়, কারণটাও শেখো।</strong>ভুল হলে ব্যাখ্যা পড়ো। তারপর আবার চেষ্টা করো—এভাবেই প্রস্তুতি মজবুত হবে।</p></div>`;
    } else if(view==='chapters') {
      el.innerHTML=`<span class="eyebrow">অধ্যায় ধরে প্রস্তুতি</span><h1 class="view-title">আজ কী পড়বে?</h1><p class="view-intro">একটি বিষয় বেছে নিয়ে শুরু করো। প্রতিটি প্রশ্নের সঙ্গে ব্যাখ্যা আছে।</p><div class="filter-tabs">${Object.entries(labels).map(([id,l])=>`<button class="${filter===id?'active':''}" data-filter="${id}">${l}</button>`).join('')}</div><button class="daily-card" data-action="all-subject" style="min-height:90px;margin-bottom:18px"><span class="daily-icon">${icon(filter==='physics'?'atom':'flask')}</span><span><h2>পুরো বিষয় অনুশীলন</h2><p>১০০টি প্রশ্ন · নিজের সময়ে</p></span>${icon('arrow','daily-arrow')}</button><div class="chapter-list">${topicList(filter).map((c,i)=>{const qs=bank.filter(q=>q.subject===filter&&q.chapter===c),done=qs.filter(q=>state.history[q.id]).length;return `<button class="chapter-button" data-chapter="${esc(c)}"><span class="chapter-number">${bn(i+1).padStart(2,'০')}</span><span>${esc(c)}</span><small>${bn(done)}/${bn(qs.length)}</small>${icon('arrow')}</button>`;}).join('')}</div>`;
    } else if(view==='revision'||view==='bookmarks') {
      const ids=view==='revision'?wrongIds():state.bookmarks;
      el.innerHTML=`<span class="eyebrow">${view==='revision'?'ভুল থেকে শেখা':'নিজের সংগ্রহ'}</span><h1 class="view-title">${view==='revision'?'ভুলের খাতা':'বুকমার্ক'}</h1><p class="view-intro">${view==='revision'?'ভুল ও এড়িয়ে যাওয়া প্রশ্ন এখানে থাকবে। সঠিক উত্তর দিলে তালিকা থেকে সরে যাবে।':'যে প্রশ্নগুলো আবার পড়তে চাও, এখানে জমিয়ে রাখো।'}</p>${ids.length?`<button class="primary-button" data-action="practice-list" style="margin-bottom:20px">${bn(ids.length)}টি প্রশ্ন অনুশীলন করো ${icon('arrow')}</button>${ids.map(id=>{const q=byId.get(id);return `<button class="review-item" data-question="${id}"><small>${labels[q.subject]} · ${esc(q.chapter)}</small><p>${esc(q.question)}</p><span>আবার চেষ্টা করো ↗</span></button>`;}).join('')}`:`<div class="empty-state">${icon(view==='revision'?'leaf':'bookmark')}<h3>${view==='revision'?'নতুন শুরু, পরিষ্কার খাতা!':'পছন্দের প্রশ্ন জমিয়ে রাখো'}</h3><p>${view==='revision'?'অনুশীলনের সময় ভুল হলে প্রশ্নটি এখানে পাবে।':'কুইজে প্রশ্নের নিচে বুকমার্ক বোতামে চাপ দিলে সেটি এখানে থাকবে।'}</p><button class="primary-button" data-subject="physics">অনুশীলন শুরু করো ${icon('arrow')}</button></div>`}`;
    } else {
      const accuracy=s.attempts?Math.round(s.correct/s.attempts*100):0;
      el.innerHTML=`<span class="eyebrow">তোমার শেখার পথ</span><h1 class="view-title">একটু একটু, অনেক দূর।</h1><p class="view-intro">প্রতিবারের চেষ্টাই তোমাকে এগিয়ে নিয়ে যায়।</p><div class="summary-stats"><div class="summary-stat"><strong>${bn(s.unique)}</strong><span>ভিন্ন প্রশ্নে অনুশীলন</span></div><div class="summary-stat"><strong>${bn(accuracy)}%</strong><span>সব চেষ্টায় সঠিক উত্তর</span></div><div class="summary-stat"><strong>${bn(s.firstCorrect)}</strong><span>প্রথম চেষ্টায় সঠিক</span></div><div class="summary-stat"><strong>${bn(s.correct*10)}</strong><span>অর্জিত পয়েন্ট</span></div></div><div class="section-heading"><span>${icon('chart')} বিষয়ভিত্তিক অগ্রগতি</span></div><div class="subject-list">${subjectCard('physics')}${subjectCard('chemistry')}</div><div class="tip-card">${icon('bulb')}<p><strong>প্রথম চেষ্টার উত্তরও মনে রাখছি।</strong>সঠিক প্রতিটি উত্তরে ১০ পয়েন্ট। মোট নির্ভুলতায় পুনরায় চেষ্টাও গণনা হয়। পরীক্ষার নম্বর হিসেবে পয়েন্ট ব্যবহার করা হয় না।</p></div><div class="section-heading"><span>আরেকবার দেখা দরকার</span></div>${topicList('physics').concat(topicList('chemistry')).map(c=>{const ids=wrongIds().filter(id=>byId.get(id).chapter===c);return ids.length?`<button class="chapter-button" data-revise-chapter="${esc(c)}"><span>${esc(c)}</span><small>${bn(ids.length)}টি প্রশ্ন</small>${icon('arrow')}</button>`:'';}).join('')||'<p class="muted">ভুল করা প্রশ্ন থাকলে সংশ্লিষ্ট অধ্যায় এখানে দেখাবে।</p>'}`;
    }
  }
  function shuffled(items, seed){
    const a=[...items];let x=seed>>>0;
    for(let i=a.length-1;i>0;i--){x=(1664525*x+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;
  }
  function createSession(ids,title,mode='practice',dailyKey=null){
    state.session={ids:[...ids],title,mode,dailyKey,index:0,answers:Array(ids.length).fill(null),startedAt:Date.now(),limitSeconds:mode==='timed'?900:null,finished:false};
    quizOpen=true;save();render();quizDialog.scrollTop=0;
  }
  function daily(){
    const date=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dhaka'});
    if(state.session&&!state.session.finished&&state.session.dailyKey===date){quizOpen=true;render();return;}
    let seed=0;for(const c of date)seed=seed*31+c.charCodeAt(0);
    const p=shuffled(bank.filter(q=>q.subject==='physics'),seed).slice(0,10),c=shuffled(bank.filter(q=>q.subject==='chemistry'),seed+1).slice(0,10);
    createSession(shuffled([...p,...c],seed+2).map(q=>q.id),'আজকের কুইজ','timed',date);
  }
  function record(a){
    const old=state.history[a.id];
    state.history[a.id]={attempts:(old?.attempts||0)+1,correct:(old?.correct||0)+(a.correct?1:0),firstCorrect:old?old.firstCorrect:a.correct,lastCorrect:a.correct,skipped:a.skipped,lastAt:Date.now()};
  }
  function selectAnswer(index){
    const s=state.session;if(!s||s.finished||s.answers[s.index])return;
    if(s.mode==='timed'&&Date.now()>=s.startedAt+s.limitSeconds*1000){finish();return;}
    const q=byId.get(s.ids[s.index]);
    const a={id:q.id,selected:index,correct:index===q.correct,skipped:false};
    s.answers[s.index]=a;if(s.mode==='practice')record(a);save();render();
  }
  function next(skip=false){
    const s=state.session;if(!s||s.finished)return;
    if(!s.answers[s.index]){
      if(!skip)return;
      const a={id:s.ids[s.index],selected:null,correct:false,skipped:true};s.answers[s.index]=a;if(s.mode==='practice')record(a);
    }
    if(s.index===s.ids.length-1){finish();return;}
    s.index++;save();render();quizDialog.scrollTop=0;
  }
  function finish(){
    const s=state.session;if(!s||s.finished)return;
    s.answers=s.answers.map((a,i)=>{
      if(a){if(s.mode==='timed')record(a);return a;}
      const skipped={id:s.ids[i],selected:null,correct:false,skipped:true};record(skipped);return skipped;
    });
    s.finished=true;s.finishedAt=Date.now();save();render();quizDialog.scrollTop=0;
  }
  function timeLabel(){
    const s=state.session;if(!s)return '';
    const elapsed=Math.floor(((s.finished?s.finishedAt:Date.now())-s.startedAt)/1000);
    const seconds=s.mode==='timed'?Math.max(0,s.limitSeconds-elapsed):elapsed;
    return `${bn(Math.floor(seconds/60)).padStart(2,'০')}:${bn(seconds%60).padStart(2,'০')}`;
  }
  function renderQuiz(){
    const el=document.querySelector('#quiz-panel'),s=state.session;
    if(!s)return;
    if(s.finished){
      const correct=s.answers.filter(a=>a.correct).length,skip=s.answers.filter(a=>a.skipped).length,wrong=s.ids.length-correct-skip;
      el.innerHTML=`<div class="quiz-header"><button class="icon-button" data-action="exit-quiz" aria-label="হোমে ফিরুন">${icon('back')}</button><h2>অনুশীলনের ফলাফল</h2>${icon('star')}</div><div class="result-view"><div class="result-art">${icon('trophy')}</div><span class="eyebrow">${esc(s.title)}</span><h2>${correct/s.ids.length>=.7?'দারুণ এগিয়ে যাচ্ছ!':'চেষ্টা থেকেই শেখা শুরু।'}</h2><p>ব্যাখ্যাগুলো দেখে নাও, পরের বার আরও ভালো হবে।</p><div class="result-score">${bn(correct)}<small> / ${bn(s.ids.length)}</small></div><div class="result-details"><div><strong>${bn(correct)}</strong>সঠিক</div><div><strong>${bn(wrong)}</strong>ভুল</div><div><strong>${bn(skip)}</strong>এড়িয়ে গেছ</div></div><button class="primary-button" data-action="retry-errors">ভুল ও বাদ দেওয়া প্রশ্ন অনুশীলন ${icon('arrow')}</button><button class="secondary-button" data-action="restart">আবার পুরো সেট চেষ্টা করো</button><button class="text-button" data-action="exit-quiz" style="margin-top:20px">হোমে ফিরে যাও</button></div><div class="section-heading"><span>উত্তর ও ব্যাখ্যা</span><span>${bn(s.ids.length)}টি প্রশ্ন</span></div>${s.answers.map((a,i)=>{const q=byId.get(a.id);return `<details class="result-explanation"><summary><span class="result-indicator ${a.correct?'is-correct':''}">${a.correct?'✓':a.skipped?'−':'×'}</span><span>${bn(i+1)}. ${esc(q.question)}</span></summary><div><p>তোমার উত্তর: <strong>${a.skipped?'উত্তর দাওনি':esc(q.options[a.selected])}</strong></p><p>সঠিক উত্তর: <strong>${esc(q.options[q.correct])}</strong></p><p>${esc(q.explanation)}</p></div></details>`;}).join('')}<div class="panel-home-indicator"></div>`;return;
    }
    const q=byId.get(s.ids[s.index]),answer=s.answers[s.index],reveal=answer&&s.mode==='practice',isSaved=state.bookmarks.includes(q.id);
    const progress=(s.index+(answer?1:0))/s.ids.length*100;
    el.innerHTML=`<div class="quiz-header"><button class="icon-button" data-action="exit-quiz" aria-label="হোমে ফিরে যান; অগ্রগতি সেভ থাকবে">${icon('back')}</button><h2>${esc(s.title)}</h2><button class="quiz-skip" data-action="skip" ${answer?'disabled':''}>এড়িয়ে যাও</button></div><div class="quiz-progress" role="progressbar" aria-label="কুইজের অগ্রগতি" aria-valuemin="0" aria-valuemax="${s.ids.length}" aria-valuenow="${s.index+(answer?1:0)}"><span style="width:${progress}%"></span></div><div class="quiz-meta"><span class="quiz-counter">${bn(s.index+1)}<span> / ${bn(s.ids.length)}</span></span><span class="quiz-timer">${s.mode==='timed'?'বাকি সময়':'অনুশীলনের সময়'} <span id="timer">${timeLabel()}</span></span></div><div class="question-topic"><span class="topic-pill">${esc(q.chapter)}</span><span class="difficulty">${q.difficulty}</span></div><h3 class="question-text">${esc(q.question)}</h3><div class="answers">${q.options.map((o,i)=>{
      let cls='',mark='arrow',feedback='';
      if(reveal){if(i===q.correct){cls='correct';mark='check';feedback='সঠিক উত্তর';}else if(i===answer.selected){cls='wrong';mark='cross';feedback='তোমার উত্তর';}else cls='dimmed';}
      else if(answer&&i===answer.selected){cls='selected';mark='check';feedback='তোমার নির্বাচিত উত্তর';}
      return `<button class="answer ${cls}" data-answer="${i}" ${answer?'disabled':''}><span class="answer-letter">${['ক','খ','গ','ঘ'][i]}</span><span class="answer-copy">${esc(o)}${feedback?`<span class="answer-feedback">${feedback}</span>`:''}</span>${icon(mark)}</button>`;
    }).join('')}</div>${reveal?`<div class="explanation ${answer.correct?'':'incorrect'}" role="status"><h3>${answer.correct?'ঠিক ধরেছ!':'ভুল থেকেই শেখা — ব্যাখ্যা দেখো'}</h3>${!answer.correct?`<p class="chosen-note">তুমি বেছেছ: ${esc(q.options[answer.selected])}। সঠিক উত্তর: ${esc(q.options[q.correct])}।</p>`:''}<p>${esc(q.explanation)}</p><div class="remember">${answer.correct?'এই ধারণাটা মনে রাখো।':'প্রশ্নটি ভুলের খাতায় যোগ হয়েছে। আবার সঠিক করলে সেখান থেকে সরে যাবে।'}</div></div>`:''}${answer?`<button class="primary-button" data-action="next">${s.index===s.ids.length-1?'ফলাফল দেখো':'পরের প্রশ্ন'} ${icon('arrow')}</button>`:`<p class="answer-hint">${s.mode==='timed'?'উত্তর ও ব্যাখ্যা কুইজ শেষে দেখাবে।':'একটি উত্তর বেছে নাও · তারপর ব্যাখ্যাটি পড়ো'}</p>`}<div class="quiz-bottom"><button class="${isSaved?'saved':''}" data-action="bookmark" aria-pressed="${isSaved}">${icon('bookmark')}${isSaved?'বুকমার্ক করা আছে':'বুকমার্ক'}</button><span>${q.id} · ${labels[q.subject]}</span></div><p class="practice-caption">${s.mode==='timed'?'২০টি মিশ্র প্রশ্নের অনুশীলন · পূর্ণ ভর্তি পরীক্ষার মক নয়':'তাড়াহুড়ো নয়, বুঝে বুঝে শেখো।'}</p><div class="panel-home-indicator"></div>`;
  }
  function render(){
    document.body.classList.toggle('quiz-modal-open',quizOpen);
    renderNav();renderDashboard();renderQuiz();
    if(quizOpen){
      quizDialog.append(quizPanel);
      if(!quizDialog.open) quizDialog.showModal();
      // Rendering replaces the answer controls, so keep keyboard focus inside the modal.
      const control = quizPanel.querySelector('[data-action="next"]') || quizPanel.querySelector('.answer:not(:disabled)') || quizPanel.querySelector('[data-action="exit-quiz"]');
      control?.focus({preventScroll:true});
    } else {
      if(quizDialog.open) quizDialog.close();
      quizSlot.append(quizPanel);
    }
  }
  function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button,a.brand');if(!btn)return;
    if(btn.matches('a.brand')){e.preventDefault();view='home';quizOpen=false;render();return;}
    const d=btn.dataset;
    if(d.view){view=d.view;quizOpen=false;render();return;}
    if(d.filter){filter=d.filter;renderDashboard();return;}
    if(d.subject){filter=d.subject;createSession(bank.filter(q=>q.subject===d.subject).map(q=>q.id),labels[d.subject]);return;}
    if(d.chapter){createSession(bank.filter(q=>q.subject===filter&&q.chapter===d.chapter).map(q=>q.id),labels[filter]);return;}
    if(d.reviseChapter){createSession(wrongIds().filter(id=>byId.get(id).chapter===d.reviseChapter),'ভুলের খাতা');return;}
    if(d.question){createSession([d.question],'আবার চেষ্টা');return;}
    if(d.answer!==undefined){selectAnswer(Number(d.answer));return;}
    const action=d.action;
    if(action==='daily')daily();
    if(action==='all-subject')createSession(bank.filter(q=>q.subject===filter).map(q=>q.id),labels[filter]);
    if(action==='practice-list'){const ids=view==='revision'?wrongIds():state.bookmarks;if(ids.length)createSession(ids,view==='revision'?'ভুলের খাতা':'বুকমার্ক');}
    if(action==='next')next();
    if(action==='skip')next(true);
    if(action==='exit-quiz'){quizOpen=false;view='home';render();toast('অগ্রগতি সেভ আছে। কুইজ আবার খুললে এখান থেকেই চলবে।');}
    if(action==='restart'){const s=state.session;createSession(s.ids,s.title,s.mode,s.dailyKey);}
    if(action==='retry-errors'){const ids=state.session.answers.filter(a=>!a.correct).map(a=>a.id);if(ids.length)createSession(ids,'ভুল শুধরে নাও');else toast('সব উত্তর সঠিক! নতুন একটি অধ্যায় চেষ্টা করো।');}
    if(action==='bookmark'){
      const id=state.session.ids[state.session.index],exists=state.bookmarks.includes(id);
      state.bookmarks=exists?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();render();toast(exists?'বুকমার্ক সরানো হয়েছে':'প্রশ্নটি বুকমার্কে রাখা হয়েছে');
    }
    if(action==='profile'){document.querySelector('#student-name').value=state.name==='শিক্ষার্থী'?'':state.name;document.querySelector('#profile-dialog').showModal();}
    if(action==='close-profile')document.querySelector('#profile-dialog').close();
    if(action==='resume'){quizOpen=true;render();}
  });
  function closeQuiz(){
    quizOpen=false;render();
  }
  quizDialog.addEventListener('cancel',e=>{e.preventDefault();closeQuiz();});
  quizDialog.addEventListener('click',e=>{if(e.target===quizDialog)closeQuiz();});
  document.querySelector('#profile-form').addEventListener('submit',e=>{e.preventDefault();state.name=document.querySelector('#student-name').value.trim().slice(0,25)||'শিক্ষার্থী';save();document.querySelector('#profile-dialog').close();render();toast('তোমার নাম সেভ হয়েছে');});
  document.addEventListener('keydown',e=>{if(document.querySelector('#profile-dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||!state.session||state.session.finished)return;if(window.innerWidth<=760&&!quizOpen)return;if(['1','2','3','4'].includes(e.key))selectAnswer(Number(e.key)-1);if(e.key==='Enter'&&state.session.answers[state.session.index]&&e.target===document.body)next();});
  setInterval(()=>{
    const s=state.session;if(!s||s.finished)return;
    if(s.mode==='timed'&&Date.now()>=s.startedAt+s.limitSeconds*1000){finish();toast('সময় শেষ হয়েছে। তোমার ফলাফল দেখে নাও।');return;}
    const timer=document.querySelector('#timer');if(timer)timer.textContent=timeLabel();
  },1000);
  // Show a real, resumable practice session alongside the desktop dashboard.
  if(!state.session){
    const preview=bank.find(q=>q.question.startsWith('ব্যাটারিতে যুক্ত'));
    const rest=bank.filter(q=>q.subject==='physics'&&q.id!==preview.id).slice(0,19);
    state.session={ids:[preview,...rest].map(q=>q.id),title:'পদার্থবিজ্ঞান কুইজ',mode:'practice',index:0,answers:Array(20).fill(null),startedAt:Date.now(),limitSeconds:null,finished:false};save();
  }
  render();
  // Mobile home keeps a clear route back to a saved session without replacing it.
  const dashboard=document.querySelector('#dashboard');
  const addResume=()=>{
    if(view==='home'&&state.session&&!state.session.finished&&!dashboard.querySelector('.resume-button')){
      const tip=dashboard.querySelector('.tip-card');
      tip.insertAdjacentHTML('beforebegin',`<button class="resume-button secondary-button" data-action="resume">চলমান কুইজে ফিরে যাও · ${bn(state.session.index+1)}/${bn(state.session.ids.length)} ↗</button>`);
    }
  };
  new MutationObserver(addResume).observe(dashboard,{childList:true});addResume();
})();
