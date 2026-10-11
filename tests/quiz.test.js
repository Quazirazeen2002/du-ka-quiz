const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = require('node:path').join(__dirname, '..');
function app(saved) {
  const elements = new Map(), events = {}, timers = [], storage = new Map(saved ? [['quizghor-v1',saved]] : []);
  function element(selector) {
    if(!elements.has(selector)) elements.set(selector,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){}},open:false,append(){},focus(){},scrollIntoView(){},insertAdjacentHTML(){},addEventListener(event,fn){events[selector+':'+event]=fn;},querySelector(s){return s==='.resume-button'?null:element(s);},showModal(){this.open=true;},close(){this.open=false;}});
    return elements.get(selector);
  }
  let now=Date.now();
  class Clock extends Date { constructor(...args){super(...(args.length?args:[now]));} static now(){return now;} }
  const context = vm.createContext({window:{innerWidth:1440},document:{querySelector:element,body:{classList:{toggle(){}}},addEventListener(event,fn){events[event]=fn;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},MutationObserver:class{observe(){}},setInterval:fn=>timers.push(fn),setTimeout:()=>0,clearTimeout(){},Date:Clock,console});
  vm.runInContext(fs.readFileSync(root+'/data/questions.js','utf8'),context);
  vm.runInContext(fs.readFileSync(root+'/app.js','utf8'),context);
  return {cancelQuiz:()=>events['#quiz-dialog:cancel']({preventDefault(){}}),bank:context.window.QUESTION_BANK,element,read:()=>JSON.parse(storage.get('quizghor-v1')),raw:()=>storage.get('quizghor-v1'),click:dataset=>events.click({target:{closest:()=>({dataset,matches:()=>false})}}),advance:ms=>{now+=ms;timers.forEach(fn=>fn());},submitName:name=>{element('#student-name').value=name;events['#profile-form:submit']({preventDefault(){}});}};
}
test('bank contains 100 distinct questions per subject, valid options and explanations',()=>{
  const a=app(),bank=a.bank;
  assert.equal(bank.length,200);assert.equal(new Set(bank.map(q=>q.id)).size,200);assert.equal(new Set(bank.map(q=>q.question)).size,200);
  for(const subject of ['physics','chemistry'])assert.equal(bank.filter(q=>q.subject===subject).length,100);
  for(const q of bank){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.explanation.length>40);assert.ok(q.chapter);}
  assert.ok(new Set(bank.map(q=>q.correct)).size===4);
});
test('wrong answer is recorded once, persists, and correct revision resolves it',()=>{
  let a=app(),s=a.read(),id=s.session.ids[0],q=a.bank.find(q=>q.id===id);
  a.click({answer:String((q.correct+1)%4)});a.click({answer:String(q.correct)});
  assert.equal(a.read().history[id].attempts,1);assert.equal(a.read().history[id].lastCorrect,false);
  assert.match(a.element('#quiz-panel').innerHTML,/ভুল থেকেই শেখা/);
  a=app(a.raw());assert.equal(a.read().session.answers[0].correct,false);
  a.click({question:id});a.click({answer:String(q.correct)});
  assert.equal(a.read().history[id].lastCorrect,true);assert.equal(a.read().history[id].firstCorrect,false);assert.equal(a.read().history[id].attempts,2);
  a.click({action:'next'});assert.equal(a.read().session.finished,true);assert.match(a.element('#quiz-panel').innerHTML,/উত্তর ও ব্যাখ্যা/);
});
test('daily quiz is balanced, delays feedback, and commits all answers on timeout',()=>{
  const a=app();a.click({action:'daily'});const s=a.read().session;
  assert.equal(s.ids.length,20);assert.equal(s.ids.filter(id=>id.startsWith('P')).length,10);assert.equal(s.ids.filter(id=>id.startsWith('C')).length,10);assert.equal(new Set(s.ids).size,20);
  const q=a.bank.find(q=>q.id===s.ids[0]);a.click({answer:String(q.correct)});
  assert.equal(Object.keys(a.read().history).length,0);assert.doesNotMatch(a.element('#quiz-panel').innerHTML,/class="explanation/);
  a.advance(900001);const result=a.read();assert.equal(result.session.finished,true);assert.equal(Object.keys(result.history).length,20);assert.equal(result.history[q.id].correct,1);assert.equal(result.session.answers.filter(a=>a.skipped).length,19);
  a.advance(2000);assert.equal(a.read().history[q.id].attempts,1);
});
test('skipping final question produces results; practice retry uses only missed items',()=>{
  const a=app();a.click({chapter:'পরিমাপ ও ভেক্টর'});
  for(let i=0;i<6;i++)a.click({action:'skip'});
  assert.equal(a.read().session.finished,true);assert.equal(a.read().session.answers.filter(a=>a.skipped).length,6);
  a.click({action:'retry-errors'});assert.equal(a.read().session.mode,'practice');assert.equal(a.read().session.ids.length,6);
});
test('bookmarks toggle and survive reload; names are escaped',()=>{
  let a=app(),id=a.read().session.ids[0];a.click({action:'bookmark'});assert.deepEqual(a.read().bookmarks,[id]);
  a=app(a.raw());assert.deepEqual(a.read().bookmarks,[id]);a.click({action:'bookmark'});assert.deepEqual(a.read().bookmarks,[]);
  a.submitName('<img src=x>');assert.match(a.element('#dashboard').innerHTML,/&lt;img src=x&gt;/);assert.doesNotMatch(a.element('#dashboard').innerHTML,/<img src=x>/);
});
test('corrupt storage recovers without preventing practice',()=>{
  const a=app('{broken');assert.ok(a.read().session);a.click({subject:'chemistry'});assert.equal(a.read().session.ids.length,100);
});

test('quiz opens in a modal and closing it preserves the active session',()=>{
  const a=app();assert.equal(a.element('#quiz-dialog').open,false);
  a.click({action:'resume'});assert.equal(a.element('#quiz-dialog').open,true);
  const saved=a.raw();a.cancelQuiz();assert.equal(a.element('#quiz-dialog').open,false);assert.equal(a.raw(),saved);
  a.click({action:'resume'});assert.equal(a.element('#quiz-dialog').open,true);
  a.click({action:'exit-quiz'});assert.equal(a.element('#quiz-dialog').open,false);assert.equal(a.raw(),saved);
});
