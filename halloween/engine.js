(function (root) {
  'use strict';
  const themes = {
    bakery: { name: 'Halloween Bakery', chapter: 'Ghost’s Party Box', guest: 'Ghost', badge: 'Candy Helper', word: 'pumpkin' },
    library: { name: 'Halloween Library', chapter: 'Princess’s Lost Book', guest: 'Princess', badge: 'Great Detective', word: 'crown' },
    park: { name: 'Halloween Park', chapter: 'Pirate’s Hide-and-Seek Adventure', guest: 'Pirate', badge: 'Treasure Finder', word: 'treasure' }
  };
  const shuffle = (items, random) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const numeric = n => ({ key: String(n), label: String(n), picture: 'number' });
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  const quantity = n => words[n].toLowerCase();
  const numberChoices = (n, random) => shuffle([n - 1, n, n + 1].map(numeric), random);
  const line = (who, text) => ({ who, text });
  const R = text => line('Rosie', text);
  function initial(saved = {}) {
    return { screen: 'home', theme: null, costume: 'witch', index: 0, phase: 'reading', paused: false,
      help: false, other: false, override: null, wrong: null, replaying: false,
      config: null, scene: {}, collected: ['bakery', 'library', 'park'].filter(k => saved[k] === true) };
  }
  function configure(theme, first, previous, random) {
    const pick = list => list[Math.floor(random() * list.length)];
    let count = first ? 3 : pick([2, 3, 4, 5]);
    if (!first && previous && count === previous.count) count = count === 5 ? 2 : count + 1;
    let position = first ? 2 : pick([1, 2, 3]);
    if (!first && previous && position === previous.position) position = position === 3 ? 1 : position + 1;
    return { first, count, position, correction: first || random() > 0.3,
      wrongObject: first ? (theme === 'bakery' ? 'pink' : theme === 'library' ? 'hat' : 'princess') :
        pick(theme === 'bakery' ? ['pink', 'ghost-cookie'] : theme === 'library' ? ['hat', 'shoes'] : ['princess', 'witch']),
      cookies: first ? ['pumpkin-cookie', 'pink', 'ghost-cookie'] : shuffle(['pumpkin-cookie', 'pink', 'ghost-cookie'], random),
      books: first ? ['crown-book', 'hat-book', 'shoes-book'] : shuffle(['crown-book', 'hat-book', 'shoes-book'], random),
      guests: first ? (theme === 'park' ? ['pirate', 'witch', 'princess'] : ['princess', 'witch', 'ghost']) :
        shuffle(theme === 'park' ? ['pirate', 'witch', 'princess'] : ['princess', 'witch', 'ghost'], random),
      boxes: first ? ['correct-box', 'cookie-box', 'count-box'] : shuffle(['correct-box', 'cookie-box', 'count-box'], random),
      numbers: numberChoices(count, random) };
  }
  const pictureLabels = { 'pumpkin-cookie': 'Pumpkin cookie', pink: 'Pink cookie', 'ghost-cookie': 'Ghost cookie',
    'crown-book': 'Crown book', 'hat-book': 'Hat book', 'shoes-book': 'Shoes book',
    princess: 'Princess', witch: 'Witch', ghost: 'Ghost', pirate: 'Pirate', hat: 'Hat', shoes: 'Shoes' };
  const pictureChoices = (keys, useLetters = false) => keys.map((key, i) => ({ key, picture: key,
    label: useLetters ? `Picture ${'ABC'[i]}` : pictureLabels[key] || key }));
  function script(s) {
    if (!s.theme || !s.config) return [];
    const c = s.config, n = quantity(c.count), p = quantity(c.position), G = text => line(themes[s.theme].guest, text);
    const nodes = [];
    const add = (id, stage, kind, lines, options = {}) => nodes.push({ id, stage, kind, lines, duration: 1200, ...options });
    const checkpoint = stage => add(`checkpoint-${stage}`, stage, 'checkpoint', []);
    const natural = (id, stage, lines, scene) => add(id, stage, 'natural', lines, { duration: 3000, view: scene });
    if (s.theme === 'bakery') {
      add('welcome', 1, 'story', [R('Welcome to the Halloween Bakery!'), R('Look! The ghost has a box.')], { view: 'bakery' });
      natural('hello', 1, [G('Hello, Stephanie!')], 'bakery');
      add('request-cookie', 1, 'story', [G('A pumpkin cookie, please!')], { view: 'pumpkin' });
      if (c.correction) {
        add('correct-rosie', 1, 'question', [R('Is this the pumpkin cookie?')], { effect: c.wrongObject === 'pink' ? 'pick-pink' : 'pick-ghost',
          view: 'wrong-cookie', choices: [{ key: 'no', label: 'No', picture: 'no' }, ...pictureChoices([c.wrongObject])],
          correct: ['no', c.wrongObject], hint: [R('Look at this cookie. Is it a pumpkin cookie?')] });
        add('oops', 1, 'story', [R('Oops! You’re right!')], { view: 'wrong-cookie' });
      }
      add('find-cookie', 1, 'question', [R('Which one is the pumpkin cookie?')], { view: 'cookie-choices',
        choices: pictureChoices(c.cookies, true), correct: ['pumpkin-cookie'],
        hint: [R('Pumpkin. Find the pumpkin cookie.')], retry: [R('Good try. Find the pumpkin cookie.')] });
      add('cookie-in', 1, 'action', [R('Pumpkin! Yes, a pumpkin cookie!'), G('Thank you!')], { effect: 'cookie', motion: 'deliver', view: 'bakery' });
      checkpoint(1);
      add('candy-question', 2, 'question', [G(`${words[c.count]} candies, please!`), R('How many candies?')], {
        view: 'candy-request', choices: c.numbers, correct: [String(c.count)],
        hint: [R(Array.from({ length: c.count }, (_, i) => words[i + 1].toLowerCase()).join(', ') + '.'), R('How many candies?')],
        retry: [R('Good try. Let’s count again.')] });
      add('candy-in', 2, 'action', [R('Count with me!'), R(Array.from({ length: c.count }, (_, i) => words[i + 1].toLowerCase()).join(', ') + '.'),
        R(`Yes! ${words[c.count]} candies!`)], { effect: 'candies', motion: 'candies', duration: c.count * 3000 + 1500, view: 'bakery' });
      add('almost-ready', 2, 'story', [G('Thank you!'), R('The box is almost ready!')], { view: 'bakery' });
      checkpoint(2);
      add('boxes-arrive', 3, 'action', [R('Look at the party boxes!')], { motion: 'boxes', view: 'box-choices' });
      add('find-box', 3, 'question', [G('Where is my party box?'), R(`One pumpkin cookie and ${n} candies. Which one is correct?`)], {
        view: 'box-choices', choices: pictureChoices(c.boxes, true), correct: ['correct-box'],
        hint: [R(`Pumpkin cookie. ${words[c.count]} candies.`)], retry: [R(`Good try. One pumpkin cookie and ${n} candies.`)] });
      add('box-delivered', 3, 'action', [R('Yes! The party box is ready!')], { effect: 'box', motion: 'happy', view: 'bakery' });
      checkpoint(3);
      natural('happy-question', 4, [G('Yummy! Thank you!'), R('Is the ghost happy?')], 'bakery');
      add('happy-description', 4, 'story', [R('The ghost is happy!')], { view: 'bakery' });
    } else if (s.theme === 'library') {
      add('welcome', 1, 'story', [R('Welcome to the Halloween Library!')], { view: 'library' });
      add('teach-crown', 1, 'story', [R('A crown. Crown.')], { view: 'crown' });
      add('find-princess', 1, 'question', [R('A crown. A pink dress. Who is it?')], { view: 'guest-choices',
        choices: pictureChoices(c.guests), correct: ['princess'], hint: [R('Crown. Pink dress.')], retry: [R('Good try. Look for the pink dress.')] });
      add('crown-on', 1, 'action', [R('Yes! She is the princess! The princess has a crown!')], { effect: 'crown', motion: 'dance', view: 'library' });
      natural('hello', 1, [G('Hello, Stephanie!')], 'library');
      checkpoint(1);
      add('find-book', 2, 'question', [G('Where is my book? My book has a crown.'), R('Find the crown book. Which one?')], {
        view: 'book-choices', choices: pictureChoices(c.books, true), correct: ['crown-book'],
        hint: [R('Crown. Find the crown book.')], retry: [R('Good try. Look for the crown.')] });
      add('book-found', 2, 'action', [R('Yes! The crown book!'), G('I found my book! Thank you, Stephanie!')], { effect: 'book', motion: 'deliver', view: 'library' });
      checkpoint(2);
      add('open-book', 3, 'action', [G('Let’s open the book!')], { effect: 'open', motion: 'open', view: 'library' });
      add('stephanie-says', 3, 'story', [G('This is a magic book! Let’s play Stephanie Says!'), G('You’re the teacher, Stephanie. I’ll follow you!')], { view: 'library' });
      const acts = [{ key: 'turn', label: 'Turn around', picture: 'turn' }, { key: 'wave', label: 'Wave your hands', picture: 'wave' }, { key: 'climb', label: 'Climb', picture: 'climb' }, { key: 'rollerblade', label: 'Rollerblade', picture: 'rollerblade' }];
      for (let i = 0; i < 2; i++) {
        add(`command-${i + 1}`, 3, 'question', [G(i ? 'Your turn again, Stephanie! What should I do?' : 'I’m ready, Teacher Stephanie!'), G('Turn around, wave your hands, climb, or rollerblade?'), R('Choose one. Tell me: “Stephanie says…”')], {
          view: 'library', choices: acts, correct: acts.map(a => a.key), hint: [R('Say: “Stephanie says, wave your hands!”')], default: 'wave' });
        add(`move-${i + 1}`, 3, 'action', [G('Stephanie says… I’ll do it!')], { effect: 'princess-move', motion: 'chosen', duration: 8000, view: 'library' });
      }
      add('pages', 3, 'story', [R('You’re a great teacher, Stephanie!'), G('I loved playing Stephanie Says with you!')], { view: 'pages' });
      checkpoint(3);
      add('close-book', 4, 'action', [R('Great job, Stephanie!')], { effect: 'close', motion: 'close', view: 'library' });
      natural('happy-question', 4, [G('I’m happy!'), R('Are you happy?')], 'library');
      add('celebrate', 4, 'action', [G('Let’s dance!')], { motion: 'celebrate', duration: 10000, view: 'library' });
    } else {
      const location=(key,label)=>({key,label,picture:key});
      add('welcome',1,'story',[R('Welcome to Halloween Park! Let’s play hide-and-seek!'),R('The pirate is hiding. Let’s find him!')],{view:'park-hide'});
      add('find-pirate',1,'question',[R('Where is the pirate?')],{view:'park-hide',choices:[location('under-swing','Under the swing'),location('on-seesaw','On the seesaw'),location('between-trees','Between the trees')],correct:['under-swing'],hint:[R('Look around the park. Can you see him?')],retry:[R('Take another look. Where is the pirate?')]});
      add('pirate-found',1,'action',[G('You found me! I’m under the swing!'),G('Hello, Stephanie!')],{effect:'guest',motion:'deliver',view:'park-found',duration:6000});
      checkpoint(1);
      add('mermaid-request',2,'story',[G('Stephanie, can you help me find the mermaid?')],{view:'park-mermaid'});
      add('find-mermaid',2,'question',[G('Where is the mermaid?')],{view:'park-mermaid',choices:[location('mermaid-on-bench','On the bench'),location('mermaid-in-sea','In the sea'),location('mermaid-between-trees','Between the trees')],correct:['mermaid-in-sea'],hint:[R('Look around. Can you see her tail?')],retry:[G('Take another look. Where is the mermaid?')]});
      add('mermaid-found',2,'action',[G('Yes! The mermaid is in the sea!'),{who:'Mermaid',text:'Hi, Stephanie!'}],{effect:'mermaid',motion:'happy',view:'park-mermaid',duration:6000});
      add('gold-request',2,'story',[G('Can you help me find my vampire ring?'),G('It has red eyes and bat wings!')],{view:'park-gold'});
      add('find-gold',2,'question',[G('Where is my vampire ring?'),G('Can you find it, Stephanie?')],{view:'park-gold',choices:[location('ring-under-swing','Under the swing'),location('ring-on-ground','On the ground'),location('ring-on-bench','On the bench')],correct:['ring-on-bench'],hint:[R('Look around the park. Can you see the red eyes?')],retry:[G('Look carefully. Where is my gold?')]});
      add('gold-found',2,'action',[G('My vampire ring! Thank you, Stephanie!'),G('The vampire ring is on the bench!')],{effect:'gold',motion:'happy',view:'park-gold-found',duration:3500});
      checkpoint(2);
      add('ship-request',3,'story',[G('Now let’s find my ship!'),R('Let’s look around!')],{view:'park-ship'});
      add('find-ship',3,'question',[G('Where is my ship?')],{view:'park-ship',choices:[location('ship-on-grass','On the grass'),location('ship-between-trees','Between the trees'),location('ship-on-lake','On the sea')],correct:['ship-on-lake'],hint:[R('Look at the blue water. On the sea!')],retry:[R('Let’s look on the sea!')]});
      add('ship-found',3,'action',[G('There’s my ship!'),R('Let’s take my ring to the ship!')],{effect:'ship',motion:'deliver',view:'park-sail',duration:4500});
      checkpoint(3);
      add('sail-away',4,'action',[G('All aboard! Let’s go!'),R('You found the pirate, the mermaid, the vampire ring, and the ship!')],{effect:'sail',motion:'sail',view:'park-sail',duration:6000});
      natural('happy-question',4,[G('Thank you, Stephanie! I’m happy!'),R('Are you happy?')],'park-sail');
      add('celebrate',4,'action',[G('Hooray! You’re a great treasure finder!')],{motion:'celebrate',duration:4000,view:'park-sail'});
    }
    add('reward', 4, 'action', [R(`You did it! You got a ${themes[s.theme].guest} sticker!`)], { effect: 'reward', motion: 'reward', view: 'reward', duration: 4800 });
    natural('goodbye', 4, [G(`Bye-bye, Stephanie!`)], 'reward');
    nodes[nodes.length-1].duration=6000;
    return nodes;
  }
  const current = s => script(s)[s.index];
  function enter(s, index) {
    const nodes = script(s);
    while (nodes[index] && nodes[index].only && s.scene.command !== nodes[index].only) index++;
    if (!nodes[index]) {
      s.screen = 'complete'; s.phase = 'complete';
      if (!s.collected.includes(s.theme)) s.collected.push(s.theme);
      return s;
    }
    s.index = index; s.phase = nodes[index].kind === 'checkpoint' ? 'checkpoint' : 'reading';
    s.help = false; s.other = false; s.override = null; s.wrong = null; s.replaying = false;
    const node = nodes[index];
    switch (node.effect) {
      case 'pick-pink': s.scene.pinkTaken = true; break;
      case 'pick-ghost': s.scene.ghostTaken = true; break;
      case 'cookie': s.scene.cookie = true; break;
      case 'candies': s.scene.candies = s.config.count; break;
      case 'box': s.scene.delivered = true; break;
      case 'crown': s.scene.crown = true; break;
      case 'book': s.scene.book = true; break;
      case 'open': s.scene.open = true; break;
      case 'close': s.scene.open = false; break;
      case 'princess-move': s.scene.actions.push(s.scene.command || 'touch'); break;
      case 'guest': s.scene.guest = true; break;
      case 'mermaid': s.scene.mermaid = true; break;
      case 'gold': s.scene.gold = true; break;
      case 'ship': s.scene.ship = true; break;
      case 'sail': s.scene.sailed = true; break;
      case 'claps': s.scene.claps = s.config.count; break;
      case 'extra': s.scene.claps = s.config.count + 1; break;
      case 'position': s.scene.position = s.config.position; break;
      case 'parade': s.scene.parade = true; break;
      case 'reward': s.scene.reward = true; break;
    }
    return s;
  }
  function reduce(state, action, value, random = Math.random) {
    const s = JSON.parse(JSON.stringify(state));
    if (action === 'costume' && ['witch', 'cat', 'pumpkin'].includes(value) && s.screen === 'home') { s.costume = value; return s; }
    if (action === 'home') return { ...initial(Object.fromEntries(s.collected.map(k => [k, true]))), costume: s.costume };
    if (action === 'clear' && s.screen === 'home') { s.collected = []; return s; }
    if (action === 'start' && themes[value] && s.screen === 'home') {
      s.screen = 'play'; s.theme = value; s.config = configure(value, !s.collected.includes(value), null, random);
      s.scene = { actions: [], cookie: false, candies: 0, claps: 0, crown: false, book: false, open: false }; return enter(s, 0);
    }
    if (action === 'play-again' && s.screen === 'complete') {
      s.screen = 'play'; s.paused = false; s.config = configure(s.theme, false, s.config, random);
      s.scene = { actions: [], cookie: false, candies: 0, claps: 0, crown: false, book: false, open: false }; return enter(s, 0);
    }
    if (s.screen !== 'play') return s;
    if (action === 'end') { s.screen = 'ended'; s.paused = false; return s; }
    if (action === 'pause') { s.paused = true; return s; }
    if (action === 'resume') { s.paused = false; return s; }
    if (s.paused) return s;
    const node = current(s);
    if (action === 'read' && s.phase === 'reading') {
      if (s.override || s.replaying) { s.phase = node.kind === 'question' ? 'waiting' : 'ready'; s.override = null; s.replaying = false; return s; }
      if (node.kind === 'question') s.phase = 'waiting';
      else if (node.kind === 'natural') s.phase = 'natural';
      else if (node.kind === 'action') s.phase = 'acting';
      else return enter(s, s.index + 1);
      return s;
    }
    if (action === 'elapsed' && ['acting', 'natural'].includes(s.phase)) return enter(s, s.index + 1);
    if (action === 'continue' && s.phase === 'ready') return enter(s, s.index + 1);
    if (action === 'got-it' && s.phase === 'checkpoint') return enter(s, s.index + 1);
    if (action === 'replay' && s.phase !== 'checkpoint') {
      s.replaying = true; s.override = node.lines; s.phase = 'reading'; return s;
    }
    if (action === 'again') {
      const stage = node.stage;
      if (s.theme === 'bakery') {
        if (stage <= 1) s.scene = { actions: [], cookie: false, candies: 0 };
        if (stage === 2) { s.scene.candies = 0; s.scene.delivered = false; }
        if (stage >= 3) { s.scene.delivered = false; s.scene.reward = false; }
      } else if (s.theme === 'library') {
        if (stage <= 1) s.scene = { actions: [], crown: false, book: false, open: false };
        if (stage === 2) { s.scene.book = false; s.scene.actions = []; s.scene.open = false; }
        if (stage >= 3) { s.scene.actions = []; s.scene.open = false; s.scene.reward = false; }
      } else {
        if (stage <= 1) s.scene = { actions: [], claps: 0 };
        if (stage === 2) { s.scene.gold=false;s.scene.ship=false;s.scene.sailed=false; }
        if (stage >= 3) { s.scene.ship=false;s.scene.sailed=false;s.scene.reward=false; }
      }
      const restartStage = Math.min(stage, 3);
      return enter(s, script(s).findIndex(n => n.stage === restartStage));
    }
    if (action === 'hint' && node.kind === 'question' && ['reading', 'waiting'].includes(s.phase)) {
      s.help = true; s.other = false; s.override = node.hint || [R('Let’s look together.')]; s.phase = 'reading'; return s;
    }
    if (action === 'other' && node.kind === 'question' && s.phase === 'waiting') {
      s.other = true; return s;
    }
    if (action === 'skip' && node.kind === 'question' && ['reading', 'waiting'].includes(s.phase)) {
      s.scene.command = node.default || node.correct[0]; return enter(s, s.index + 1);
    }
    if (action !== 'answer' || node.kind !== 'question' || s.phase !== 'waiting' || !node.choices.some(c => c.key === value)) return s;
    if (!node.correct.includes(value)) {
      s.wrong = value; s.help = true; s.override = node.retry || [R('Good try. Let’s look together.')]; s.phase = 'reading'; return s;
    }
    if (['command', 'clap-command', 'command-1', 'command-2'].includes(node.id)) s.scene.command = value;
    s.other = false; return enter(s, s.index + 1);
  }
  const api = { themes, words, pictureLabels, initial, reduce, configure, script, current };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Halloween = api;
})(typeof window !== 'undefined' ? window : globalThis);
