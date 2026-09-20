'use strict';
const {initial,reduce,choices,titles} = window.Picnic;
let state=initial();
const app=document.getElementById('app');
const audioByText=new Map([
  ["Hi! I'm Rosie. This is my carrot bag. What's your name?",'line-01.mp3'],
  ["I'm Rosie. You can say, 'I'm...'",'line-02.mp3'],
  ["Let's have a picnic!",'line-03.mp3'],
  ["Nice to meet you! Let's have a picnic!",'line-04.mp3'],
  ["Let's pick a picnic blanket. What color do you like?",'line-05.mp3'],
  ['Pink or white?','line-06.mp3'],
  ["Here's our picnic blanket.",'line-07.mp3'],
  ['Pink! I like pink too!','blanket-pink.mp3'],
  ["White! Let's use a white blanket!",'line-09.mp3'],
  ["Pink and white! Let's use both!",'line-10.mp3'],
  ["I'm hungry. I have apples and carrots. Do you like apples?",'line-11.mp3'],
  ['Apples—yes or no?','line-12.mp3'],
  ["I'll pack some carrots for me.",'line-13.mp3'],
  ["Let's pack some apples!",'line-14.mp3'],
  ["That's okay. Do you like carrots?",'line-15.mp3'],
  ['Carrots—yes or no?','line-16.mp3'],
  ["Let's pack some carrots!",'line-17.mp3'],
  ["That's okay. I'll pack some carrots for me.",'line-18.mp3'],
  ['How many apples?','line-19.mp3'],
  ["Let's count. One...",'line-20.mp3'],
  ['Our picnic is ready!','line-21.mp3'],
  ['Three! One, two, three.','line-22.mp3'],
  ["Let's count together. One, two, three!",'line-23.mp3'],
  ['How many carrots?','line-24.mp3'],
  ["I'm happy. How do you feel?",'line-25.mp3'],
  ['You can point to a face.','line-26.mp3'],
  ["I'm happy too!",'line-27.mp3'],
  ["It's okay to feel sad. We can take a break.",'feel-sad.mp3'],
  ["It's okay to feel angry. We can take a break.",'line-29.mp3'],
  ["Let's rest.",'line-30.mp3'],
  ['See you next time!','line-31.mp3'],
  ['Bye-bye!','line-32.mp3'],
  ['Thanks for playing with me. Bye-bye!','line-33.mp3']
]);
let currentAudio=null;
let resumeAudio=false;
let audioIssue=false;
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
function header(){return `<header class="topbar"><div class="brand"><small>A little time together</small>Picnic with Rosie</div><span class="badge">Rosie speaks · No microphone</span></header>`;}
function welcome(){return `<section class="hero"><div>${rosie()}</div><div class="stage-content welcome-copy"><div class="eyebrow">Hello, little picnic helper</div><h1>A pink bunny.<br>A picnic with you.</h1><p>Meet Rosie and help her choose a blanket, pack a snack, and share a little smile.</p><div>${button('Start picnic','start','','class="primary large"')}</div><div class="intro-note">Rosie speaks, and a grown-up chooses the buttons.<br>No microphone. No recording. Take all the time you need.</div></div></section><p class="page-note">About 5 minutes · Five little moments · Parent-guided play · Voice generated with elevenlabs.io</p>`;}
function ended(){return `<section class="hero"><div>${rosie()}</div><div class="stage-content welcome-copy"><div class="eyebrow">Our picnic is finished</div><h1>See you<br>next time!</h1><p class="end-text" aria-live="polite">${escapeText(state.text)}</p><p>No rush to play again. You can close this page whenever you're ready.</p><div class="flow-actions">${!state.goodbye?button('Say goodbye','goodbye','','class="primary"'):''}${button('Start a new picnic','start')}</div></div></section><p class="page-note">A new picnic starts from the beginning.</p>`;}
function play(){
  const status=audioIssue?'Audio could not play. Choose Replay to try again.':state.mode==='other'?'Listen together. Choose an answer, or skip.':state.pending?'Rosie is speaking. Next unlocks when she finishes.':state.ready?'Ready for the next step.':'Listen to Rosie, then choose your child’s answer.';
  return `<div class="progress" aria-label="Step ${state.step+1} of 5">${titles.map((x,i)=>`<span class="${i<=state.step?'done':''}" title="${escapeText(x)}"></span>`).join('')}</div>
  <section class="hero" aria-label="${escapeText(titles[state.step])}"><div>${rosie()}</div><div class="stage-content"><div class="eyebrow">Step ${state.step+1} of 5 · ${escapeText(titles[state.step])}</div><div class="bubble" aria-live="polite" aria-atomic="true">${escapeText(state.text||'Our picnic is ready.')} </div>${visuals()}<p class="question-footnote">Rosie's words · Listen together</p></div></section>
  <section class="controls" aria-label="Parent controls"><div class="control-top"><div><h2>Parent controls</h2><p class="guide">Listen to Rosie's words.<br>Then choose your child's answer.</p></div><div><div class="answers">${choices(state).map(label=>button(label,'answer',label,`aria-pressed="${state.choice===label}"`)).join('')}</div><div class="helpers">${button('Replay','replay')}${button('Hint','hint')}${button('Other / Not sure','other')}${button('Skip','skip')}${state.step===2&&state.branch==='carrots'?button('Back to apples','back'):''}</div></div></div><div class="footer-controls"><div class="left">${button('Pause','pause')}${button('End picnic','end')}</div><p class="status" role="status">${escapeText(status)}</p>${button(state.step===4?'Say goodbye':'Next →','next','',`class="primary" ${state.ready?'':'disabled'}`)}</div></section><p class="page-note">Replay plays the question again · Voice generated with elevenlabs.io · No microphone or recording · Answers stay only in this session</p>`;
}
function render(focusKey=null){
  app.innerHTML=`<div id="page-content" ${state.paused?'inert':''}>${header()}${state.screen==='welcome'?welcome():state.screen==='end'?ended():play()}</div>${state.paused?'<section class="paused-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title"><div class="paused-card"><span class="symbol" aria-hidden="true">☁</span><h2 id="pause-title">Paused</h2><p>Take a little break.<br>Your picnic will be right here.</p><div class="paused-actions">'+button('Resume','resume','','class="primary"')+button('End picnic','end')+'</div></div></section>':''}`;
  if(state.paused) app.querySelector('[data-action="resume"]').focus();
  else if(focusKey){
    const target=[...app.querySelectorAll('button')].find(b=>b.dataset.action===focusKey.action&&b.dataset.value===focusKey.value&&!b.disabled);
    if(target) target.focus();
    else {const fallback=app.querySelector('[data-action="answer"], [data-action="start"], [data-action="replay"]');if(fallback) fallback.focus();}
  }
}
function stopAudio(){if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;currentAudio=null;}resumeAudio=false;}
function finishAudio(audio,text,failed=false){
  if(currentAudio!==audio)return;
  currentAudio=null;resumeAudio=false;audioIssue=failed;
  if(state.pending&&state.text===text)state=reduce(state,'read');
  render({action:state.ready?'next':'replay',value:''});
}
function playStateAudio(){
  if(state.paused||!state.text)return;
  const file=audioByText.get(state.text);
  if(!file){audioIssue=true;if(state.pending)state=reduce(state,'read');render({action:state.ready?'next':'replay',value:''});return;}
  stopAudio();audioIssue=false;
  const text=state.text;
  const audio=new Audio(`assets/audio/${file}`);
  currentAudio=audio;
  audio.addEventListener('ended',()=>finishAudio(audio,text));
  audio.addEventListener('error',()=>finishAudio(audio,text,true));
  audio.play().catch(()=>finishAudio(audio,text,true));
}
app.addEventListener('click',e=>{
  const target=e.target.closest('button[data-action]');if(!target||target.disabled)return;
  const key={action:target.dataset.action,value:target.dataset.value};
  if(key.action==='pause'){if(currentAudio&&!currentAudio.paused){currentAudio.pause();resumeAudio=true;}state=reduce(state,'pause');render(key);return;}
  if(key.action==='resume'){state=reduce(state,'resume');render(key);if(currentAudio&&resumeAudio){const audio=currentAudio,text=state.text;resumeAudio=false;audio.play().catch(()=>finishAudio(audio,text,true));}return;}
  stopAudio();state=reduce(state,key.action,key.value);render(key);playStateAudio();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&state.screen==='play') {e.preventDefault();if(state.paused){state=reduce(state,'resume');render({action:'resume',value:''});if(currentAudio&&resumeAudio){const audio=currentAudio,text=state.text;resumeAudio=false;audio.play().catch(()=>finishAudio(audio,text,true));}}else{if(currentAudio&&!currentAudio.paused){currentAudio.pause();resumeAudio=true;}state=reduce(state,'pause');render({action:'pause',value:''});}}
  if(e.key==='Tab'&&state.paused){const buttons=[...document.querySelectorAll('.paused-overlay button')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
render();
