'use strict';
const {initial,reduce,choices,titles} = window.Picnic;
let state=initial();
const app=document.getElementById('app');
const escapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function button(label, action, value='', extra='') { return `<button type="button" data-action="${action}" data-value="${escapeText(value)}" ${extra}>${escapeText(label)}</button>`; }
function rosie(){return '<img class="rosie" src="assets/rosie.png" alt="Rosie, a pink bunny wearing her carrot bag" width="1024" height="1536">';}
function card(label,art,selected=false){return `<div class="card${selected?' selected':''}"><div class="card-art" aria-hidden="true">${art}</div>${escapeText(label)}</div>`;}
function visuals(){
  if(state.step===0) return '<p class="plain-caption">A little friend. A lovely picnic.</p>';
  if(state.step===1) return `<div class="cards">${['Pink','White','Pink and white'].map((x,i)=>card(x,`<div class="swatch ${['pink','white','both'][i]}"></div>`,state.choice===x)).join('')}</div>`;
  if(state.step===2) return `<div class="cards">${card('Apple','🍎',state.branch==='apples')}${card('Carrot','🥕',state.branch==='carrots')}</div>`;
  if(state.step===3) return `<div><div class="count-mat ${state.blanket}" role="img" aria-label="Three ${state.food}">${Array.from({length:3},()=>`<span class="count-item" aria-hidden="true">${state.food==='apples'?'🍎':'🥕'}</span>`).join('')}</div><p class="plain-caption">${state.owner==='Rosie'?"Rosie's snack":'Our picnic snack'}</p></div>`;
  return `<div class="cards">${['Happy','Sad','Angry','Tired'].map((x,i)=>card(x,['🙂','😢','😠','😴'][i],state.choice===x)).join('')}</div>`;
}
function header(){return `<header class="topbar"><div class="brand"><small>A little time together</small>Picnic with Rosie</div><span class="badge">Read-aloud mode · No audio</span></header>`;}
function welcome(){return `<section class="hero"><div>${rosie()}</div><div class="stage-content welcome-copy"><div class="eyebrow">Hello, little picnic helper</div><h1>A pink bunny.<br>A picnic with you.</h1><p>Meet Rosie and help her choose a blanket, pack a snack, and share a little smile.</p><div>${button('Start picnic','start','','class="primary large"')}</div><div class="intro-note">A grown-up reads Rosie's words and chooses the buttons.<br>No microphone. No recording. Take all the time you need.</div></div></section><p class="page-note">About 5 minutes · Five little moments · Parent-guided play</p>`;}
function ended(){return `<section class="hero"><div>${rosie()}</div><div class="stage-content welcome-copy"><div class="eyebrow">Our picnic is finished</div><h1>See you<br>next time!</h1><p class="end-text" aria-live="polite">${escapeText(state.text)}</p><p>No rush to play again. You can close this page whenever you're ready.</p><div class="flow-actions">${!state.goodbye?button('Say goodbye','goodbye','','class="primary"'):''}${button('Start a new picnic','start')}</div></div></section><p class="page-note">A new picnic starts from the beginning.</p>`;}
function play(){
  const status=state.mode==='other'?'Listen together. Choose an answer, or skip.':state.pending?'Read the response, then choose Done reading.':state.ready?'Ready for the next step.':'Take your time. Choose your child’s answer.';
  return `<div class="progress" aria-label="Step ${state.step+1} of 5">${titles.map((x,i)=>`<span class="${i<=state.step?'done':''}" title="${escapeText(x)}"></span>`).join('')}</div>
  <section class="hero" aria-label="${escapeText(titles[state.step])}"><div>${rosie()}</div><div class="stage-content"><div class="eyebrow">Step ${state.step+1} of 5 · ${escapeText(titles[state.step])}</div><div class="bubble" aria-live="polite" aria-atomic="true">${escapeText(state.text||'Our picnic is ready.')} </div>${visuals()}<p class="question-footnote">Rosie's words · Read together</p></div></section>
  <section class="controls" aria-label="Parent controls"><div class="control-top"><div><h2>Parent controls</h2><p class="guide">Read Rosie's words aloud.<br>Then choose your child's answer.</p></div><div><div class="answers">${choices(state).map(label=>button(label,'answer',label,`aria-pressed="${state.choice===label}"`)).join('')}</div><div class="helpers">${button('Replay','replay')}${button('Hint','hint')}${button('Other / Not sure','other')}${button('Skip','skip')}${state.step===2&&state.branch==='carrots'?button('Back to apples','back'):''}</div>${state.pending?`<div class="read-panel"><span>Read Rosie's response above.<br>No sound plays in this version.</span>${button('Done reading','read','','class="primary"')}</div>`:''}</div></div><div class="footer-controls"><div class="left">${button('Pause','pause')}${button('End picnic','end')}</div><p class="status" role="status">${escapeText(status)}</p>${button(state.step===4?'Say goodbye':'Next →','next','',`class="primary" ${state.ready?'':'disabled'}`)}</div></section><p class="page-note">Replay shows the question again · No microphone or recording · Answers stay only in this session</p>`;
}
function render(focusKey=null){
  app.innerHTML=`<div id="page-content" ${state.paused?'inert':''}>${header()}${state.screen==='welcome'?welcome():state.screen==='end'?ended():play()}</div>${state.paused?'<section class="paused-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title"><div class="paused-card"><span class="symbol" aria-hidden="true">☁</span><h2 id="pause-title">Paused</h2><p>Take a little break.<br>Your picnic will be right here.</p><div class="paused-actions">'+button('Resume','resume','','class="primary"')+button('End picnic','end')+'</div></div></section>':''}`;
  if(state.paused) app.querySelector('[data-action="resume"]').focus();
  else if(focusKey){
    const target=[...app.querySelectorAll('button')].find(b=>b.dataset.action===focusKey.action&&b.dataset.value===focusKey.value&&!b.disabled);
    if(target) target.focus();
    else {const fallback=app.querySelector('[data-action="read"], [data-action="answer"], [data-action="start"]');if(fallback) fallback.focus();}
  }
}
app.addEventListener('click',e=>{
  const target=e.target.closest('button[data-action]');if(!target||target.disabled)return;
  const key={action:target.dataset.action,value:target.dataset.value};
  state=reduce(state,key.action,key.value);render(key);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&state.screen==='play') {e.preventDefault();state=reduce(state,state.paused?'resume':'pause');render({action:'pause',value:''});}
  if(e.key==='Tab'&&state.paused){const buttons=[...document.querySelectorAll('.paused-overlay button')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
render();
