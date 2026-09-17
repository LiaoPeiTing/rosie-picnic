(function (root) {
  'use strict';
  const titles = ['Hello, Rosie!', 'Pick a blanket', 'Snack time', "Let's count", 'How do you feel?'];
  function initial() { return {screen:'welcome', step:0, paused:false, branch:'apples', food:'carrots', owner:'Rosie', blanket:'both', choice:null, ready:false, pending:false, mode:'question', text:'', goodbye:false}; }
  function question(s) {
    return ["Hi! I'm Rosie. This is my carrot bag. What's your name?", "Let's pick a picnic blanket. What color do you like?", s.branch === 'apples' ? "I'm hungry. I have apples and carrots. Do you like apples?" : "That's okay. Do you like carrots?", `How many ${s.food}?`, "I'm happy. How do you feel?"][s.step];
  }
  function hint(s) { return ["I'm Rosie. You can say, 'I'm...'", 'Pink or white?', s.branch === 'apples' ? 'Apples—yes or no?' : 'Carrots—yes or no?', "Let's count. One...", 'You can point to a face.'][s.step]; }
  function choices(s) { return [['Name shared'], ['Pink','White','Pink and white'], ['Yes','No'], ['Three','Count together'], ['Happy','Sad','Angry','Tired']][s.step]; }
  function reduce(state, action, value) {
    const s = {...state};
    if (action === 'start') { if (s.screen !== 'welcome' && s.screen !== 'end') return s; return {...initial(), screen:'play', text:question(initial())}; }
    if (action === 'end' && s.screen === 'play') return {...s, screen:'end', paused:false, text:'See you next time!', goodbye:false};
    if (action === 'goodbye' && s.screen === 'end' && !s.goodbye) return {...s, text:'Bye-bye!', goodbye:true};
    if (s.screen !== 'play') return s;
    if (action === 'pause' && !s.paused) return {...s, paused:true};
    if (action === 'resume' && s.paused) return {...s, paused:false};
    if (s.paused) return s;
    if (action === 'read' && s.pending) return {...s, ready:true, pending:false};
    if (action === 'next' && s.ready) {
      if (s.step === 4) return {...s, screen:'end', goodbye:true, text:'Thanks for playing with me. Bye-bye!'};
      s.step++; s.choice=null; s.ready=false; s.pending=false; s.mode='question'; s.text=question(s); return s;
    }
    if (action === 'replay' || action === 'hint' || action === 'other') {
      s.ready=false; s.pending=false; s.mode=action; s.choice=null;
      s.text=action === 'hint' ? hint(s) : question(s); return s;
    }
    if (action === 'back' && s.step === 2 && s.branch === 'carrots') {
      return {...s, branch:'apples', food:'carrots', owner:'Rosie', choice:null, ready:false, pending:false, mode:'question', text:question({...s,branch:'apples'})};
    }
    if (action === 'skip') {
      s.choice=null; s.mode='response'; s.pending=true; s.ready=false;
      if (s.step === 1) s.blanket='both';
      if (s.step === 2) { s.food='carrots'; s.owner='Rosie'; }
      s.text=["Let's have a picnic!", "Here's our picnic blanket.", "I'll pack some carrots for me.", 'Our picnic is ready!', ''][s.step];
      if (s.step === 4) { s.ready=true; s.pending=false; }
      return s;
    }
    if (action !== 'answer' || !choices(s).includes(value)) return s;
    s.choice=value; s.mode='response'; s.ready=false; s.pending=true;
    if (s.step === 0) s.text="Nice to meet you! Let's have a picnic!";
    if (s.step === 1) {
      s.blanket={Pink:'pink',White:'white','Pink and white':'both'}[value];
      s.text={Pink:'Pink! I like pink too!',White:"White! Let's use a white blanket!",'Pink and white':"Pink and white! Let's use both!"}[value];
    }
    if (s.step === 2) {
      if (s.branch === 'apples' && value === 'No') return {...s,branch:'carrots',choice:null,pending:false,mode:'question',text:question({...s,branch:'carrots'})};
      s.food=s.branch; s.owner=value==='Yes'?'Picnic':'Rosie';
      s.text=value==='Yes' ? `Let's pack some ${s.food}!` : "That's okay. I'll pack some carrots for me.";
    }
    if (s.step === 3) s.text=value==='Three' ? 'Three! One, two, three.' : "Let's count together. One, two, three!";
    if (s.step === 4) s.text={Happy:"I'm happy too!",Sad:"It's okay to feel sad. We can take a break.",Angry:"It's okay to feel angry. We can take a break.",Tired:"Let's rest."}[value];
    return s;
  }
  const api={initial,reduce,question,hint,choices,titles};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.Picnic=api;
})(typeof window !== 'undefined' ? window : globalThis);
