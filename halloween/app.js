(function () {
  'use strict';
  const H = window.Halloween, A = window.HalloweenArt, app = document.querySelector('#app');
  const storageKey = 'rosie-halloween-completions-v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) {}
  let state = H.initial(saved), speaking = false, timer = null, timerKey = '', deadline = 0, remaining = 0, glow = false;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = (action, text, cls = 'secondary', value = '', disabled = false) => `<button class="${cls}" data-action="${action}" data-value="${value}" ${disabled ? 'disabled' : ''}>${text}</button>`;
  document.querySelector('#svg-library').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${A.defs}</svg>`;

  function halloweenDecor() {
    const web = '<svg class="web" viewBox="0 0 120 120"><g fill="none" stroke="#e4ceff" stroke-width="2"><path d="M0 0H120M0 0 110 40M0 0 85 85M0 0 40 110M0 0V120M25 0 22 9 17 17 9 22 0 25M50 0 45 17 35 35 17 45 0 50M80 0 73 28 56 56 28 73 0 80M110 0 100 36 77 77 36 100 0 110"/></g></svg>';
    const spider = '<svg viewBox="0 0 100 90"><g class="spider-legs" fill="none" stroke="#e6b16a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M38 35 22 16 6 9M35 43 17 30 4 34M35 52 15 52 4 64M39 60 24 72 17 85M62 35 78 16 94 9M65 43 83 30 96 34M65 52 85 52 96 64M61 60 76 72 83 85"/></g><ellipse cx="50" cy="39" rx="20" ry="27" fill="#9867c6" stroke="#dab9f5" stroke-width="2"/><circle cx="50" cy="61" r="17" fill="#70419d" stroke="#d4a8f0" stroke-width="2"/><path d="M42 22q8-8 16 0" fill="none" stroke="#e8cfff" stroke-width="3" stroke-linecap="round" opacity=".7"/><g class="spider-eyes" fill="#ffdf81"><circle cx="43" cy="62" r="4"/><circle cx="57" cy="62" r="4"/></g></svg>';
    const skeleton = '<svg viewBox="0 0 100 210"><g fill="none" stroke="#eee2c6" stroke-width="8" stroke-linecap="round"><path d="M50 53V125M31 75H69M31 89Q50 102 69 89M32 105Q50 116 68 105M34 126Q50 140 66 126"/><path class="bone-arm left-bone" d="M31 75 15 99 20 126"/><path class="bone-arm right-bone" d="M69 75 85 99 80 126"/><path class="bone-leg left-bone" d="M40 135 33 167 27 197 15 199"/><path class="bone-leg right-bone" d="M60 135 67 167 73 197 85 199"/></g><path d="M22 27Q22 3 50 3T78 27Q79 44 64 48V58H36V48Q21 44 22 27" fill="#fff0d2"/><g fill="#27152e"><ellipse cx="38" cy="29" rx="8" ry="10"/><ellipse cx="62" cy="29" rx="8" ry="10"/><path d="m50 37-5 8h10zM41 49v9h4v-9m10 0v9h4v-9"/></g></svg>';
    const lantern = '<svg viewBox="0 0 160 145"><path d="m77 20 3-17 12 3-5 21" fill="#67501f"/><ellipse cx="80" cy="83" rx="75" ry="58" fill="#b84612"/><ellipse cx="80" cy="81" rx="61" ry="58" fill="#df6519"/><ellipse cx="80" cy="81" rx="40" ry="58" fill="#ee7c21"/><path d="M38 38Q17 80 38 124M60 28Q43 80 60 136M102 28Q119 80 102 136M124 38Q145 80 124 124" fill="none" stroke="#92330e" stroke-width="3" opacity=".6"/><g class="lantern-light" fill="#ffdc69" stroke="#8d310c" stroke-width="3"><path d="m28 58 32 18-32 8zM132 58 100 76l32 8zM80 76l-9 18h18zM24 100l22 12 9-7 13 10 12-8 12 8 13-10 9 7 22-12-10 24-20 5-10-8-16 10-16-10-10 8-20-5z"/></g></svg>';
    return '<div class="spooky-decor" aria-hidden="true"><div class="web-corner corner-left">'+web+'<div class="web-spider">'+spider+'</div></div><div class="web-corner corner-right">'+web+'<div class="web-spider">'+spider+'</div></div><div class="walking-skeleton skeleton-one">'+skeleton+'</div><div class="walking-skeleton skeleton-two">'+skeleton+'</div><div class="carved-lantern lantern-sign-left">'+lantern+'</div><div class="carved-lantern lantern-sign-right">'+lantern+'</div></div>';
  }
  function rosie(happy = false) {
    const prefix = state.costume === 'witch' ? '' : state.costume === 'cat' ? 'cat-' : 'pumpkin-';
    const imagePath = pose => pose === 'speak-wide-hand' ? `assets/${state.costume}-speak-big.png` : `assets/${prefix}${pose}.png`;
    return `<div class="rosie ${happy ? 'happy' : ''} ${speaking?'talking':''}"><div class="rosie-shadow"></div>${['idle','blink','speak-small-hand','speak-wide-hand','happy-ears'].map((p,i) => `<img class="frame ${i === (happy ? 4 : 0) ? 'active' : ''}" data-pose="${p}" src="${imagePath(p)}" alt="${i === 0 ? 'Rosie, a pink bunny with a carrot bag' : ''}">`).join('')}</div>`;
  }
  function goodbyeRosie() {
    const cfg={witch:[0,540,100,405,465,430,170,500,370,515],cat:[536,489,595,410,955,445,680,510,865,520],pumpkin:[1024,512,1090,420,1450,440,1175,515,1375,525]}[state.costume];
    const [x,w,lx,ly,rx,ry,lp,lyp,rp,ryp]=cfg, src=new URL('assets/rosie-goodbye-sheet-v1.png',document.baseURI).href;
    const pic='<image href="'+src+'" width="1536" height="1024"/>';
    const defs='<defs><clipPath id="bye-bunny-cell"><rect x="'+x+'" width="'+w+'" height="1024"/></clipPath><mask id="bye-bunny-body"><rect width="1536" height="1024" fill="white"/><ellipse cx="'+lx+'" cy="'+ly+'" rx="54" ry="72" fill="black"/><ellipse cx="'+rx+'" cy="'+ry+'" rx="54" ry="72" fill="black"/></mask><clipPath id="bye-bunny-left"><ellipse cx="'+lx+'" cy="'+ly+'" rx="66" ry="87"/></clipPath><clipPath id="bye-bunny-right"><ellipse cx="'+rx+'" cy="'+ry+'" rx="66" ry="87"/></clipPath></defs>';
    return '<div class="rosie farewell-bunny">'+A.svg(defs+'<g clip-path="url(#bye-bunny-cell)"><g mask="url(#bye-bunny-body)">'+pic+'</g><g class="farewell-paw farewell-paw-left" style="transform-origin:'+lp+'px '+lyp+'px"><g clip-path="url(#bye-bunny-left)">'+pic+'</g></g><g class="farewell-paw farewell-paw-right" style="transform-origin:'+rp+'px '+ryp+'px"><g clip-path="url(#bye-bunny-right)">'+pic+'</g></g></g>','',x+' 0 '+w+' 1024')+'</div>';
  }
  function goodbyeGhost() {
    const pic='<image href="'+new URL('assets/ghost-v3.png',document.baseURI).href+'" width="160" height="210" preserveAspectRatio="none"/>';
    return '<div class="guest ghost farewell-ghost">'+A.svg('<defs><mask id="bye-ghost-body"><rect width="160" height="210" fill="white"/><ellipse cx="24" cy="79" rx="21" ry="27" fill="black"/><ellipse cx="140" cy="88" rx="18" ry="26" fill="black"/></mask><clipPath id="bye-ghost-left"><ellipse cx="24" cy="79" rx="28" ry="34"/></clipPath><clipPath id="bye-ghost-right"><ellipse cx="140" cy="88" rx="25" ry="33"/></clipPath></defs><g mask="url(#bye-ghost-body)">'+pic+'</g><g class="farewell-ghost-hand left"><g clip-path="url(#bye-ghost-left)">'+pic+'</g></g><g class="farewell-ghost-hand right"><g clip-path="url(#bye-ghost-right)">'+pic+'</g></g>','','-10 -10 180 230')+'</div>';
  }
  function ridingStory() {
    const rider=(x,princess)=>`<g transform="translate(${x} 0)"><ellipse cx="43" cy="77" rx="31" ry="14" fill="${princess?'#d7a676':'#a98368'}"/><path d="M60 76 65 44 78 40 86 48 82 60 70 64" fill="${princess?'#d7a676':'#a98368'}"/><path d="m67 44 3-12 7 10" fill="#986c50"/><circle cx="79" cy="47" r="2" fill="#42372e"/><path d="M19 84 16 109m21-20-2 20m23-20 5 20m8-26 7 26" stroke="${princess?'#b98659':'#87654d'}" stroke-width="6" stroke-linecap="round"/><path d="M15 76Q-4 58 3 85" fill="none" stroke="#795846" stroke-width="6"/><path d="M64 46q-10 15-5 26" fill="none" stroke="#795846" stroke-width="6"/><path d="M31 62h24v17H31Z" fill="#bc799d"/><path d="M40 60v17l14 9" fill="none" stroke="#626986" stroke-width="5"/><path d="M32 33h18l5 31H27Z" fill="${princess?'#e59cbe':'#83a6ce'}"/><circle cx="41" cy="23" r="12" fill="#f6d6ba"/><path d="M29 23q-2-20 20-13l5 15-9-9-16 10" fill="${princess?'#e3c36e':'#785744'}"/>${princess?'<path d="M30 21v24" stroke="#e3c36e" stroke-width="7"/>':'<path d="M33 8 36 1 41 7 47 1 49 9Z" fill="#e7bd57"/>'}<path d="M46 40 60 54 72 54" fill="none" stroke="#f6d6ba" stroke-width="5" stroke-linecap="round"/><path d="M60 54 76 52" stroke="#795846" fill="none"/></g>`;
    return A.svg(`<rect width="200" height="120" fill="#e7f4fc"/><circle cx="175" cy="16" r="10" fill="#f6d579"/><path d="M0 84q40-25 80 0t120-4v40H0Z" fill="#b4d59c"/><path d="M0 104q100-16 200 0" fill="none" stroke="#eed8a5" stroke-width="12"/>${rider(6,true)}${rider(102,false)}<path d="M100 0v120" stroke="#d6c2a4" stroke-width="2"/>`,'riding-story','0 0 200 120');
  }
  function libraryBackdrop() {
    return A.svg(['crown','hat','shoes'].map((k,i)=>A.use(k,190+i*52,78,34,34)).join(''),'library-display-icons','0 0 540 302').replace('<svg ', '<svg preserveAspectRatio="none" ');
  }
  function guest(role, motion = '') {
    if(role==='pirate'&&H.current(state).id==='pirate-found') {
      const img='<image href="assets/pirate-moon-captain-v2.png" width="1983" height="793"/>';
      const arm='M0 200H160L250 275 338 296 319 412 190 425 0 358Z';
      const head='M214 0H680V238L571 303 361 305 274 251 208 228Z';
      return '<div class="guest pirate pirate-hello"><svg class="art" viewBox="-35 -25 810 850" overflow="visible"><defs><mask id="pirate-hello-body"><rect width="740" height="793" fill="white"/><path d="'+arm+'" fill="black"/><path d="'+head+'" fill="black"/></mask><clipPath id="pirate-hello-arm"><path d="'+arm+'"/></clipPath><clipPath id="pirate-hello-head"><path d="'+head+'"/></clipPath><clipPath id="pirate-hello-mouth"><ellipse cx="450" cy="230" rx="36" ry="17"/></clipPath></defs><ellipse cx="308" cy="346" rx="40" ry="62" fill="#245e3e"/><g mask="url(#pirate-hello-body)">'+img+'</g><g class="pirate-hello-head"><g clip-path="url(#pirate-hello-head)">'+img+'</g><g class="pirate-hello-mouth" clip-path="url(#pirate-hello-mouth)">'+img+'</g></g><g class="pirate-hello-arm"><g clip-path="url(#pirate-hello-arm)">'+img+'</g></g></svg><span class="pirate-hello-bubble">Hello, Stephanie!</span></div>';
    }
    if(role==='princess'&&['turn','wave','climb','rollerblade'].includes(motion)) return `<div class="guest princess says-performing says-${motion} ${speaking?'talking':''}">${A.svg(A.princessPose(motion),'','0 -35 160 295')}</div>`;
    // Inline the symbol so hand and mouth animation targets remain addressable.
    const symbol = document.querySelector(`#${role}`);
    let drawing=symbol.innerHTML;
    if(role==='ghost'&&motion==='hello-wave') {
      drawing='<defs><clipPath id="ghost-wave-body"><path d="M0 0H160V82L125 96 125 121 160 125V210H0Z"/></clipPath><clipPath id="ghost-wave-sleeve"><path d="M125 96 160 82V125L125 121Z"/></clipPath></defs><g clip-path="url(#ghost-wave-body)">'+drawing+'</g><g class="ghost-waving-hand"><image href="assets/ghost-v3.png" x="0" y="0" width="160" height="210" preserveAspectRatio="xMidYMax meet" clip-path="url(#ghost-wave-sleeve)"/></g>';
    }
    if(role==='princess'&&motion==='party-dance') drawing='<g class="princess-party-body">'+drawing+'</g>';
    if(role==='princess'&&motion==='skirt-jump') {
      drawing=drawing.replace(/<path class="left-arm"[^>]*><\/path>|<path class="left-arm"[^>]*\/>/, '<path class="left-arm" d="M58 109Q43 129 57 143L74 145" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/>');
      drawing=drawing.replace(/<path class="right-arm"[^>]*><\/path>|<path class="right-arm"[^>]*\/>/, '<path class="right-arm" d="M102 109Q117 129 103 143L86 145" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/>');
      drawing=drawing.replace(/<path d="M50 235h19m26 0h18"[^>]*(?:><\/path>|\/>)/, '<g class="golden-shoes"><path d="M66 217v18m28-18v18" stroke="#f3c9b5" stroke-width="10" stroke-linecap="round"/><path d="M62 232q5 4 10 0l4 9H55q-3-4 7-9Zm28 0q5 4 10 0l9 9H88Z" fill="#e6b642" stroke="#a77b27" stroke-width="2"/><path d="M70 240v5m20-5v5" stroke="#a77b27" stroke-width="3"/></g>');
      drawing=drawing.replace('M66 101h28Q103 167 118 234q-38 19-76 0 15-60 24-133Z','M66 101h28Q102 167 116 237q-36 11-72 0Q58 167 66 101Z');
      drawing=drawing.replace('M69 129Q58 188 53 232M80 131v105M91 129q9 66 16 103','M69 129Q60 190 53 234M80 131v108M91 129q8 61 16 105');
    }
    if(role==='princess'&&motion==='skirt-jump') {
      drawing+='<g class="princess-poised-hands"><path d="M71 141Q75 137 80 141l7 3q3 4-2 6l-10-1-5-3Z" fill="url(#princess-lace-glove)" stroke="#d5c8d2" stroke-width=".6"/><path d="M89 141q-4-4-8 0l-7 3q-3 4 2 6l10-1 5-3Z" fill="url(#princess-lace-glove)" stroke="#d5c8d2" stroke-width=".6"/></g>';
    }
    if(role==='ghost'&&motion==='happy-spin') {
      const joyFace='<defs><radialGradient id="ghost-happy-white"><stop stop-color="#fffefe"/><stop offset="1" stop-color="#e7e5ed"/></radialGradient></defs><g class="ghost-joy-face"><ellipse cx="66" cy="71" rx="14" ry="14" fill="url(#ghost-happy-white)"/><ellipse cx="100" cy="79" rx="14" ry="15" fill="url(#ghost-happy-white)"/><g fill="none" stroke="#493c4e" stroke-width="2.8" stroke-linecap="round"><path d="M56 74Q65 61 75 73"/><path d="M90 82Q100 69 110 81"/></g><ellipse cx="50" cy="87" rx="7" ry="3" fill="#f5a6b6" opacity=".55"/><ellipse cx="114" cy="93" rx="7" ry="3" fill="#f5a6b6" opacity=".55"/></g>';
      const joyBits=Array.from({length:10},(_,i)=>'<text class="ghost-joy-bit" x="80" y="90" style="--joy-x:'+Math.round(Math.cos(i*Math.PI/5)*95)+'px;--joy-y:'+Math.round(Math.sin(i*Math.PI/5)*78)+'px;--joy-delay:'+(-i*.19)+'s" fill="'+['#ffd65b','#ff9fae','#c2a1ff'][i%3]+'" font-size="'+(i%2?10:15)+'">'+(i%2?'✦':'★')+'</text>').join('');
      drawing='<g class="ghost-close-dance">'+drawing+joyFace+'</g><g aria-hidden="true">'+joyBits+'</g>';
    }
    if(role==='princess'&&motion==='climb') {
      drawing=drawing.replace(/<path class="left-arm"[^>]*(?:><\/path>|\/>)/,'<path class="left-arm climbing-left" d="M58 109Q40 97 45 68" fill="none" stroke="url(#princess-lace-glove)" stroke-width="8" stroke-linecap="round"/>').replace(/<path class="right-arm"[^>]*(?:><\/path>|\/>)/,'<path class="right-arm climbing-right" d="M102 109Q120 97 115 68" fill="none" stroke="url(#princess-lace-glove)" stroke-width="8" stroke-linecap="round"/>');
    }
    if(role==='princess'&&['turn','climb','rollerblade'].includes(motion)) {
      const prop=motion==='climb'?'<path d="M25 15V245m110-230v230M25 45h110M25 85h110M25 125h110M25 165h110M25 205h110" fill="none" stroke="#a87840" stroke-width="5"/>':motion==='rollerblade'?'<g fill="#765487" stroke="#35233e" stroke-width="2"><rect x="49" y="237" width="28" height="7" rx="3"/><rect x="88" y="237" width="28" height="7" rx="3"/><circle cx="54" cy="248" r="4"/><circle cx="64" cy="248" r="4"/><circle cx="74" cy="248" r="4"/><circle cx="93" cy="248" r="4"/><circle cx="103" cy="248" r="4"/><circle cx="113" cy="248" r="4"/></g>':'';
      drawing=(motion==='climb'?prop:'')+'<g class="princess-command-'+motion+'">'+drawing+(motion==='rollerblade'?prop:'')+'</g>';
    }
    if(role==='princess'&&motion==='search-book') {
      drawing=drawing.replace(/<path class="(?:left|right)-arm"[^>]*(?:><\/path>|\/>)/g,'');
      const arms='<g class="princess-question-arm"><path d="M58 109Q43 129 27 115" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/><ellipse cx="23" cy="112" rx="8" ry="5" fill="#f3c9b5"/></g><g class="princess-thinking-arm"><path d="M102 109Q131 102 117 62L104 47" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/><ellipse cx="100" cy="45" rx="11" ry="4" fill="#f3c9b5"/></g><g class="princess-crown-pointer"><path d="M102 109Q124 113 119 85L110 67" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/><circle cx="108" cy="63" r="6" fill="#f3c9b5"/></g>';
      drawing='<g class="princess-looking-book">'+drawing+arms+'</g><g class="princess-question-cluster" aria-hidden="true"><text class="princess-search-question" x="-4" y="60" font-size="43" style="--question-delay:0s">?</text><text class="princess-search-question" x="134" y="42" font-size="34" style="--question-delay:-.8s">?</text><text class="princess-search-question" x="147" y="82" font-size="25" style="--question-delay:-1.6s">?</text></g><path class="princess-crown-cue" d="M118-25q20-10 26 10m-3-8 3 8-9-1" fill="none" stroke="#ffe9a4" stroke-width="3" stroke-linecap="round"/>';
    }
    if(role==='princess'&&motion==='royal-hello') {
      drawing=drawing.replace(/<path class="right-arm"[^>]*(?:><\/path>|\/>)/, '<g class="royal-wave-arm"><path d="M102 109Q121 113 124 94L129 74" fill="none" stroke="#f3c9b5" stroke-width="9" stroke-linecap="round"/><g class="royal-wave-hand"><ellipse cx="130" cy="70" rx="6" ry="8" fill="#f3c9b5"/><path d="M125 74Q119 67 124 61q5-6 10-2 5 4 3 12l-3 7Z" fill="#fffaf6"/><path class="glove-lace-detail" d="M122 79q2-4 4 0t4 0t4 0M125 86l4-4 4 4-4 4Z" fill="none" stroke="#d9d0df" stroke-width=".9"/></g></g>');
      drawing='<g class="princess-royal-greeting">'+drawing+'</g>';
    }
    if(role==='princess'&&['skirt-jump','dance'].includes(motion)) {
      const back='<g class="princess-turn-back"><path d="M66 101h28Q103 156 115 187L109 216q-29 11-58 0l-6-29Q57 156 66 101Z" fill="url(#princess-gown)" stroke="#ba6593" stroke-width="1"/><path d="M64 102h32l2 24H62Z" fill="#dc73aa"/><path d="M66 217v18m28-18v18" stroke="#fff0e9" stroke-width="9"/><path d="M60 236h16m12 0h16" stroke="#dfb044" stroke-width="6" stroke-linecap="round"/><path d="M58 109Q44 129 50 145L53 153m49-44Q116 129 110 145L107 153" fill="none" stroke="#fff8f1" stroke-width="8" stroke-linecap="round"/><ellipse cx="60" cy="107" rx="10" ry="11" fill="url(#princess-gown)"/><ellipse cx="100" cy="107" rx="10" ry="11" fill="url(#princess-gown)"/><path d="M48 48Q40 10 80 10t32 38l8 65q-40 17-80 0Z" fill="url(#princess-hair)"/><path d="M55 35q-5 47-4 66m13-76q-5 48-4 80m20-84v89m16-84q5 47 4 80" fill="none" stroke="#fff1a0" stroke-width="2" opacity=".6"/><use href="#crown" x="30" y="-32" width="100" height="70"/></g>';
      drawing='<g class="princess-graceful-dance"><g class="princess-turn-front">'+drawing+'</g>'+back+'</g>';
    }
    return `<div class="guest ${role} ${motion ? 'motion-' + motion : ''} ${speaking ? 'talking' : ''}">${A.svg(drawing, '', role==='princess'?(motion==='party-dance'?'0 -35 160 285':'0 0 160 250'):'0 0 160 210')}</div>`;
  }
  function home() {
    return `<section class="home"><div class="home-haunted-scenery" aria-hidden="true"><svg class="home-corner-web" viewBox="0 0 150 150"><g fill="none" stroke="#362016" stroke-width="2"><path d="M0 0H150M0 0 135 55M0 0 106 106M0 0 55 135M0 0V150M40 0 35 15 28 28 15 35 0 40M80 0 70 30 56 56 30 70 0 80M130 0 114 49 92 92 49 114 0 130"/></g></svg><div class="home-moon"></div><svg class="home-gothic-castle" viewBox="0 0 300 330"><defs><mask id="castle-window-mask"><rect width="300" height="330" fill="white"/><g fill="black"><path d="M71 113q0-18 10-18t10 18v26H71ZM78 150h14v28H78ZM208 162q0-18 10-18t10 18v29h-20ZM138 233q0-23 14-23t14 23v46h-28ZM111 201h12v22h-12ZM177 205h12v22h-12ZM114 240h11v18h-11ZM181 242h11v18h-11Z"/></g></mask></defs><g fill="#080706" mask="url(#castle-window-mask)"><path d="m35 88 48-73 43 64-18 5 9 132 33-26 39 20-3-70-32 3 57-89 58 95-31-8-11 155 42 21H35l15-37 14-164Z"/><path d="M16 314q10-50 28-64l-12-30 28 17 14-29-1 40 17 15 168 6 18 45Z"/><path d="M56 78q-28 10-26-4t11-3q-12 2 1 8m211 58q29 8 29-7t-12-4q12 2-1 9" fill="none" stroke="#080706" stroke-width="6"/><path d="M31 282 22 226 4 208 23 214 19 186 31 211 43 195 34 226 42 280Z"/></g></svg><svg class="home-night-bats" viewBox="0 0 400 200"><defs><path id="home-black-bat" d="M0 35Q22 2 45 14l8-14 7 17Q82 5 110 35 87 28 80 53 65 42 55 62 44 42 30 53 23 30 0 35Z"/></defs><g fill="#080706"><use href="#home-black-bat" x="265" y="10" transform="rotate(15 310 40)"/><use href="#home-black-bat" x="15" y="60" transform="rotate(-18 60 80) scale(.8)"/><use href="#home-black-bat" x="150" y="135" transform="rotate(10 200 160) scale(.7)"/></g></svg><div class="halloween-bunting"><i style="--flag:0"></i><i style="--flag:1"></i><i style="--flag:2"></i><i style="--flag:3"></i><i style="--flag:4"></i><i style="--flag:5"></i><i style="--flag:6"></i><i style="--flag:7"></i><i style="--flag:8"></i><i style="--flag:9"></i><i style="--flag:10"></i><i style="--flag:11"></i><i style="--flag:12"></i><i style="--flag:13"></i><i style="--flag:14"></i><i style="--flag:15"></i></div><svg class="haunted-silhouette" viewBox="0 0 1200 220" preserveAspectRatio="none"><g fill="#241810"><path d="M0 220V70l35 50-9-75 16 40 13-20-4 42 28-23-20 39 27 9-48 3 9 85ZM1200 220V55l-34 54 8-80-20 51-25-18 14 43-31-9 35 36-48 7 57 14-9 67Z"/><path d="M0 183q140-10 240 25h270v-48l20-35 10 35v-55l20-65 20 65v30l20-35 20 35v73h340q140-35 240-25v37H0Z"/><path d="M517 170h95v40h-95z"/></g><g fill="#ffcb4e"><path d="M550 135h7v13h-7zm18 0h7v13h-7zm-25 24h8v15h-8zm35 0h8v15h-8zm-20 22h12v29h-12z"/></g></svg></div><div class="home-top"><div class="home-pumpkin-track" aria-hidden="true"><div class="rolling-black-lantern"><span class="rolling-lantern-shadow"></span><div class="rolling-lantern-body"><svg viewBox="0 0 120 120"><defs><mask id="black-lantern-carving"><rect width="120" height="120" fill="white"/><g fill="black"><path d="m24 48 26 10-8 12-17-8ZM96 48 70 58l8 12 17-8ZM60 65l-8 15h16ZM21 78l10 7 4-7 8 12 6-8 11 12 11-12 6 8 8-12 4 7 10-7-7 22-10-3-8 10-7-6-7 8-7-8-7 6-8-10-10 3Z"/></g></mask></defs><g class="rolling-lantern-candle" fill="#ffc35c"><path d="m24 48 26 10-8 12-17-8ZM96 48 70 58l8 12 17-8ZM60 65l-8 15h16ZM21 78l10 7 4-7 8 12 6-8 11 12 11-12 6 8 8-12 4 7 10-7-7 22-10-3-8 10-7-6-7 8-7-8-7 6-8-10-10 3Z"/></g><path d="M62 30Q58 17 66 8q13-8 13 5" fill="none" stroke="#080706" stroke-width="7" stroke-linecap="round"/><g fill="#080706" mask="url(#black-lantern-carving)"><path d="M60 33Q20 20 10 58q-12 35 13 49 15 9 26 3 11 9 22 0 12 6 26-3 26-14 13-49Q101 20 60 33Z"/></g></svg></div></div></div><div class="hero-copy"><p class="eyebrow">HELLO, LITTLE FRIEND</p><h1>A little magic.<br><em>A lot to say.</em></h1><p>Help our Halloween friends. Speak, play and make a little adventure with Rosie.</p><div class="costumes">${[['witch','Pink Witch'],['cat','Black Cat'],['pumpkin','Happy Pumpkin']].map(([k,l])=>button('costume',l,state.costume===k?'selected':'',k)).join('')}</div></div><div class="hero-art"><span class="hero-spark spark-one">✦</span><span class="hero-spark spark-two">✧</span><span class="hero-spark spark-three">✦</span><span class="hero-spark spark-four">✧</span>${rosie()}<div class="floating-pumpkin">${A.icon('pumpkin',state)}</div><div class="floating-star">${A.icon('star',state)}</div></div></div><div class="read-note"><span class="note-icon">♡</span><p><strong>Read together · Parent reads the words.</strong><br>No sound plays in this prototype. Listen to your child, then choose their answer.</p></div><div class="theme-grid">${Object.entries(H.themes).map(([k,t])=>`<button class="theme-card ${k}" data-action="start" data-value="${k}"><div class="theme-illustration">${A.icon(t.guest.toLowerCase(),state)}<span class="prop">${A.icon(t.word==='parade'?'star':t.word,state)}</span></div><div class="theme-text"><span class="chapter-label">CHAPTER ONE</span><h2>${t.name}</h2><p>${t.chapter}</p><span class="card-bottom"><span>${state.collected.includes(k)?'Play a new round':'Start our story'}</span><span>→</span></span></div></button>`).join('')}</div></section>`;
  }
  function updatePackingDisplay() {
    if(state.screen!=='play'||H.current(state)?.id!=='candy-in'||state.phase!=='acting'||state.replaying||state.override)return;
    const elapsed=packingElapsed(), total=state.scene.candies;
    const departed=Math.min(total,Math.floor(elapsed/3000)+1);
    const arrived=Math.min(total,Math.max(0,Math.floor((elapsed-2000)/3000)+1));
    app.querySelectorAll('.shelf-candy').forEach((el,i)=>{el.style.animation='none';el.style.opacity=i<departed?'0':'1';});
    app.querySelectorAll('.packing-box .box-candy').forEach((el,i)=>{el.style.animation='none';el.style.opacity=i<arrived?'1':'0';});
    app.querySelectorAll('.candy-count-step').forEach((el,i)=>{el.style.animation='none';el.style.opacity=i===arrived-1?'1':'0';});
  }
  setInterval(updatePackingDisplay,80);
  function packingElapsed(){return state.phase==='acting'?Math.max(0,H.current(state).duration-(state.paused?remaining:Math.max(0,deadline-performance.now()))):0;}
  let pickupAnimated=false;
  function bakeryHalloweenTrim() {
    const web=(x,flip)=>'<g transform="translate('+x+' 0) scale('+flip+' 1)" fill="none" stroke="#d5c0d9" stroke-width=".8" opacity=".72"><path d="M0 0H76M0 0 68 30M0 0 50 54M0 0 24 73M0 0V80M18 0 16 8 12 13 6 17 0 18M38 0 33 15 25 27 12 36 0 39M63 0 55 25 42 45 20 60 0 64"/></g>';
    const lantern=(x,y,size)=>'<g transform="translate('+x+' '+y+') scale('+size+')"><ellipse rx="16" ry="14" fill="#e98a31" stroke="#8b4e2d" stroke-width="1.5"/><path d="M0-13 2-20" stroke="#67804b" stroke-width="3"/><path d="m-10-4 6 1-5 5m19-6-6 1 5 5M-10 5l5 3 3-2 3 3 3-3 6-1-3 6H-5Z" fill="#ffdc6d"/><path d="M-6-12q-6 12 0 24m12-24q6 12 0 24" fill="none" stroke="#c3712d"/></g>';
    const candle=(x,y)=>'<g class="bakery-candle" transform="translate('+x+' '+y+')"><ellipse cy="1" rx="14" ry="17" fill="#ffc76c" opacity=".14"/><rect x="-4" y="0" width="8" height="12" rx="2" fill="#ffba59"/><path d="M0-10q-6 8 0 10 6-2 0-10Z" fill="#ffe9a4"/></g>';
    return '<g class="bakery-halloween-trim"><path d="M-50 0v365m20-365v365m20-365v365m560-365v365m20-365v365m20-365v365" stroke="#211b28" stroke-width="2" opacity=".65"/>'+web(-55,1)+web(595,-1)+'<path d="M-60 45Q0 70 70 28M470 28q70 42 130 17" fill="none" stroke="#211c2a" stroke-width="2"/>'+[-52,-22,8,38,480,510,540,570].map((x,i)=>'<path d="m'+x+' '+(i<4?48-i*4:32+(i-4)*4)+' 15 27 15-28Z" fill="'+(i%2?'#eea24e':'#8d5d9f')+'" stroke="#39283f"/>').join('')+lantern(-24,230,1.1)+lantern(562,230,1.1)+candle(-2,235)+candle(538,235)+'<g fill="#241b2c"><path d="M-42 151q10-9 19 0l-3 31h-14Z"/><path d="m551 162 6-13 6 9 6-9 4 13q9 22-11 23t-11-23"/></g><g fill="#ecd4a0" stroke="#815a48"><path d="m-40 275 20-5 11 36-24 6Z"/><path d="m554 275 20 5-7 32-24-6Z"/></g><g stroke="#ae8967"><path d="M-27 252v22m592-22-16 23"/></g><g fill="#412b46"><path d="m-30 288 3-4 3 4 8-2-4 7-5-2-4 4-5-7Z"/><path d="m551 291 4-4 4 4 8-2-4 7-5-2-4 4-5-7Z"/></g><path d="m-39 173 13-30 10 30Z" fill="#8954a4" stroke="#e9bd6e"/><ellipse cx="-26" cy="176" rx="19" ry="5" fill="#75458b" stroke="#e9bd6e"/><path d="m559 167 3 1m4-1 3-1" stroke="#efc364" stroke-width="2"/></g>';
  }
  function bakeryBackdrop() {
    const ghostCookieShelf=()=>A.icon('ghost-cookie',state).replace('<svg','<svg width="160" height="150"');
    const loaf=(x,y,w=52)=>`<g transform="translate(${x} ${y})"><path d="M0 25Q0 0 ${w/2} 0Q${w} 0 ${w} 25v10H0Z" fill="#e9ab60" stroke="#b47d44" stroke-width="2"/><path d="m12 7 6 12m8-15 6 13m8-9 5 10" stroke="#fff0c8" stroke-width="4" stroke-linecap="round"/></g>`;
    const bun=(x,y)=>`<g transform="translate(${x} ${y})"><ellipse cx="18" cy="16" rx="18" ry="15" fill="#efb86f" stroke="#ba844c" stroke-width="2"/><path d="m10 9 7 8m1-10 8 7" stroke="#fff0d0" stroke-width="3"/></g>`;
    const toast=(x,y)=>`<g class="bakery-toast" transform="translate(${x} ${y})"><path d="M6 17Q-4 1 15 0h20q19 1 9 17v29H6Z" fill="#c58b50"/><path d="M11 17Q2 6 17 6h16q15 0 6 11v23H11Z" fill="#ffe7a8"/><rect x="17" y="22" width="16" height="12" rx="3" fill="#ffcb63"/></g>`;
    const cake=(x,y)=>`<g class="bakery-cake" transform="translate(${x} ${y})"><rect y="15" width="49" height="30" rx="4" fill="#eb9fb8" stroke="#ba7598" stroke-width="1.5"/><path d="M1 26h47m-47 10h47" stroke="#fff0d1" stroke-width="5"/><path d="M0 15q7-13 14 0 7-13 14 0 7-13 21 0v8q-6 9-10 0-6 9-11 0-6 9-11 0-6 9-17 0Z" fill="#dac1f0"/><path d="M8 8 14 1l5 7m12 0 6-7 5 7" fill="#e85d83"/><ellipse cx="25" cy="48" rx="30" ry="4" fill="#a9d5c1"/></g>`;
    const donut=(x,y,color='#f09abc')=>`<g class="bakery-donut" transform="translate(${x} ${y})"><circle cx="20" cy="20" r="20" fill="#dba263"/><circle cx="20" cy="20" r="16" fill="${color}"/><circle cx="20" cy="20" r="6" fill="#382839"/><path d="m10 8 4 3m13-1 4 3m-23 12 4-2m15 8 4-3" stroke="#fff4bb" stroke-width="3"/><path d="m19 7 2 4m-6 19 3 2m15-12-3 2" stroke="#a980c6" stroke-width="3"/></g>`;
    const croissant=(x,y)=>`<g class="bakery-croissant" transform="translate(${x} ${y})"><path d="M0 33Q-3 7 24 2q30 5 28 31L37 25q-12-15-24 0Z" fill="#efb05c" stroke="#bd7d3d" stroke-width="2"/><path d="m12 8 5 14m8-18 1 15m12-10-4 14" stroke="#ffdc95" stroke-width="4"/></g>`;
    const sandwich=(x,y)=>`<g class="bakery-sandwich" transform="translate(${x} ${y})"><path d="M0 36 27 0 54 36Z" fill="#deb47e" stroke="#b88b59" stroke-width="2"/><path d="M6 30 27 5 48 30Z" fill="#fff0c8"/><path d="m2 36 50 0-2 8H4Z" fill="#ec899d"/><path d="M2 40q6-6 12 0 6-6 12 0 6-6 12 0 6-6 14 0" stroke="#88b66d" stroke-width="5" fill="none"/><path d="M0 45h54l-3 8H3Z" fill="#ffe5ab" stroke="#b88b59" stroke-width="2"/></g>`;
    const pudding=(x,y)=>`<g class="bakery-pudding" transform="translate(${x} ${y})"><ellipse cx="13" cy="24" rx="16" ry="3" fill="#d4b0e3"/><path d="m4 7-3 15q12 5 24 0l-3-15Z" fill="#ffe18d" stroke="#d4a65b"/><ellipse cx="13" cy="7" rx="9" ry="4" fill="#ad6a3d"/><path d="m7 9 2 11" stroke="#fff3c6" stroke-width="2"/></g>`;
    const panna=(x,y)=>`<g class="bakery-panna" transform="translate(${x} ${y})"><path d="m1 5 3 22h21l3-22Z" fill="#edf4f1" stroke="#a5bdbb"/><path d="m4 9 2 15h17l2-15Z" fill="#fff9e8"/><ellipse cx="14" cy="8" rx="11" ry="4" fill="#eaa1bb"/><path d="m10 6 4-6 5 6Z" fill="#da5378"/></g>`;
    const chocolateToast=(x,y)=>`<g class="bakery-chocolate-toast" transform="translate(${x} ${y})"><path d="M0 9Q-3 0 10 0h14q13 0 10 9v26H0Z" fill="#9c6346"/><path d="M5 10Q2 5 11 5h12q9 0 6 5v20H5Z" fill="#6b443d"/><path d="m9 10 4 14m6-15 4 14" stroke="#c68f67" stroke-width="3"/></g>`;
    const strawberryCroissant=(x,y)=>`<g class="bakery-strawberry-croissant" transform="translate(${x} ${y}) scale(.6)">${croissant(0,0)}<path d="M5 20q20-26 42 0" fill="none" stroke="#ec8cac" stroke-width="7"/><path d="m21 11 6-8 6 8-6 7Z" fill="#db5278"/><path d="m23 5 4 3 4-3" stroke="#77a768" stroke-width="3"/></g>`;
    return `<defs><linearGradient id="bakery-glass" x2="0" y2="1"><stop stop-color="#b5a0ab" stop-opacity=".9"/><stop offset="1" stop-color="#7c6275" stop-opacity=".5"/></linearGradient></defs>
      <rect width="540" height="365" fill="#382839"/><path d="M0 48h540M0 95h540M0 143h540" stroke="#50394d" stroke-width="2"/>
      <path d="M0 61h140v24H0Zm400 0h140v24H400Z" fill="#654353"/><path d="M0 61h140m260 0h140" stroke="#342532" stroke-width="3"/>
      <rect class="bakery-sign" x="70" y="5" width="400" height="86" rx="20" fill="#805c53"/><text x="270" y="62" text-anchor="middle" font-family="Georgia,serif" font-size="46" fill="#fff6e7">Halloween Bakery</text>
      <rect x="16" y="102" width="117" height="129" rx="7" fill="#68494d" stroke="#392631" stroke-width="5"/><rect x="23" y="110" width="103" height="114" fill="url(#bakery-glass)"/><g class="display-donuts">${[[29,116,'#f09abc'],[62,116,'#a4d8c4'],[95,116,'#c5a8e3']].map(([x,y,color])=>`<g transform="translate(${x} ${y}) scale(.72)">${donut(0,0,color)}</g>`).join('')}</g><g class="display-candy-pile">${Array.from({length:8},(_,i)=>{const n=state.scene.candies||0;const packing=H.current(state)?.id==='candy-in'&&!state.replaying&&!state.override&&['reading','acting'].includes(state.phase);const moving=packing&&state.phase==='acting';if(!packing&&i<n)return '';const elapsed=packingElapsed();return `<g class="shelf-candy ${moving&&i<n?'taken-candy':''}" style="animation-delay:${i*3000-elapsed}ms" transform="translate(${27+(i%4)*25} ${179+Math.floor(i/4)*25})">${A.use('candy',0,0,24,24)}</g>`}).join('')}</g><path d="M20 165h110" stroke="#4b303d" stroke-width="5"/>
      <rect x="407" y="104" width="112" height="132" rx="12" fill="#8e6a6b" stroke="#3f2c39" stroke-width="4"/><rect x="420" y="119" width="86" height="75" rx="8" fill="#48313e"/><rect x="427" y="126" width="72" height="55" rx="5" fill="#edc786"/>${loaf(436,140,52)}<path d="M433 199h59" stroke="#756356" stroke-width="5" stroke-linecap="round"/><circle cx="434" cy="219" r="7" fill="#887568"/><circle cx="459" cy="219" r="7" fill="#887568"/><circle cx="492" cy="219" r="5" fill="#edac80"/>
      <rect x="151" y="98" width="238" height="112" rx="14" fill="#99765d" stroke="#503644" stroke-width="4"/><path d="M163 157h214" stroke="#5a3b43" stroke-width="6"/>${toast(166,104)}${sandwich(226,101)}${sandwich(285,101)}${croissant(335,117)}
      <path d="M0 248h540v117H0Z" fill="#493142"/><path d="M0 251h540" stroke="#8c624e" stroke-width="14"/><rect x="15" y="271" width="510" height="73" rx="8" fill="url(#bakery-glass)" stroke="#30222e" stroke-width="4"/>${Array.from({length:state.scene.cookie?3:4},(_,i)=>`<g class="shelf-pumpkin-cookie" transform="translate(${25+i*28} 280)"><circle cx="13" cy="13" r="13" fill="#dbb38a" stroke="#bd8c5d"/>${A.use('pumpkin',3,3,20,20)}</g>`).join('')}${Array.from({length:state.scene.pinkTaken?3:4},(_,i)=>`<g class="shelf-pink-cookie">${A.use('pink-cookie',25+i*28,311,26,26)}</g>`).join('')}${Array.from({length:state.scene.ghostTaken?3:4},(_,i)=>`<g class="shelf-ghost-cookie" transform="translate(${399+i*29} 278) scale(.19)">${ghostCookieShelf()}</g>`).join('')}${[0,1,2,3].map(i=>`<g class="shelf-strawberry-croissant" transform="translate(${399+i*29} 318) scale(.8)">${strawberryCroissant(0,0)}</g>`).join('')}<path d="M0 355h540" stroke="#30202d" stroke-width="10"/>${bakeryHalloweenTrim()}
      `;
  }


  function parkLandscapeDetails() {
    const tree=(x,y,k)=>'<g transform="translate('+x+' '+y+') scale('+k+')"><ellipse cy="87" rx="35" ry="8" fill="#38482c" opacity=".18"/><path d="M-6 85 0 18l9 67" fill="#856039"/><path d="M0 60-17-20m21 23 20-18" stroke="#856039" stroke-width="5" fill="none"/><path d="M-28 33Q-44 8-24-7q-11-24 10-33-5-27 15-35 22 2 19 31 24 9 15 34 23 18 5 39Q10 48-28 33Z" fill="#637e46" stroke="#48643d" stroke-width="2"/><path d="M-15 22Q-29 5-12-9q-5-19 8-26-3-15 6-22 12 4 7 22 15 10 4 25 15 15 2 27Z" fill="#91a458"/></g>';
    return '<g class="park-landscape-details">'+tree(-52,188,.78)+tree(151,186,.57)+tree(340,180,.59)+tree(590,204,.67)+
      '<g class="park-lake"><path d="M378 295Q418 277 470 291q47-19 95-3 53 7 56 38-6 35-95 37-70 15-134-9-46-20-14-59Z" fill="#6eaaad" stroke="#d3c598" stroke-width="6"/><path d="M393 307q45-17 83-3m56-2q36-2 57 15m-177 24q36 12 60 5m58 4q34 0 49-10" fill="none" stroke="#bce8df" stroke-width="2" opacity=".8"/><g fill="#a39b7b" stroke="#786e58" stroke-width="1"><ellipse cx="393" cy="296" rx="12" ry="7"/><ellipse cx="419" cy="288" rx="9" ry="6"/><ellipse cx="577" cy="294" rx="11" ry="7"/><ellipse cx="607" cy="316" rx="9" ry="6"/></g><path d="M397 289v-15m4 16v-20m-8 21v-12m187 13v-15m5 18v-20" stroke="#647448" stroke-width="3" stroke-linecap="round"/></g>'+
      '<g class="park-little-bridge"><path d="M402 298q23-20 49-16l19 12q-32-5-56 17Z" fill="#a16f45" stroke="#714d35" stroke-width="2"/><path d="M405 290q25-20 51-14m-51 14v14m16-24v15m17-21v15m18-13v13" fill="none" stroke="#d1aa70" stroke-width="3"/><path d="m418 297 8 9m4-16 8 9m6-13 7 10" stroke="#714d35" stroke-width="1.5"/></g>'+
      '<g class="park-bench" transform="translate(302 228)"><ellipse cx="28" cy="32" rx="40" ry="7" fill="#5b603d" opacity=".16"/><path d="M-4 17v18m63-18v18" stroke="#5c4b37" stroke-width="4"/><path d="M-10 0h80v7h-80Zm-3 12h86v8h-86Z" fill="#bb8b51" stroke="#795a38" stroke-width="2"/><path d="M-4 0v-8m63 8v-8" stroke="#795a38" stroke-width="3"/></g>'+
      '<g class="park-treasure-box" transform="translate(258 253)"><ellipse cx="12" cy="20" rx="20" ry="5" fill="#5b603d" opacity=".2"/><path d="M-4 0h32v20H-4Z" fill="#9d6c3c" stroke="#573b28" stroke-width="2"/><path d="M-4 0v-14q16-12 32 0V0Z" fill="#bf955d" stroke="#573b28" stroke-width="2"/><path d="M1 3h22m-9-1v17" stroke="#e6bd60" stroke-width="3"/><g class="park-gold-glint" fill="#ffdf68"><ellipse cx="8" cy="1" rx="6" ry="2"/><ellipse cx="18" cy="2" rx="6" ry="2"/></g></g>'+
      '<g class="park-lake-ship" transform="translate(510 288)"><ellipse cx="18" cy="44" rx="37" ry="5" fill="#cef2e2" opacity=".6"/><path d="M-18 23h72L40 43H-3Z" fill="#805139" stroke="#4b342c" stroke-width="2"/><path d="M16 24V-30" stroke="#69472d" stroke-width="3"/><path d="M19-26h29V5H19Z" fill="#573b66"/><path d="M12-21-8 14h20Z" fill="#fff0c8"/><circle cx="33" cy="-14" r="5" fill="#fff0c8"/><path d="M29-6h9" stroke="#fff0c8" stroke-width="2"/><path d="M18-30h20l-8 6H18Z" fill="#e6ad4e"/></g>'+
      '<g fill="#e9c66e" opacity=".8"><circle cx="195" cy="264" r="2"/><circle cx="210" cy="277" r="2"/><circle cx="365" cy="281" r="2"/><circle cx="157" cy="250" r="2"/></g></g>';
  }
  function halloweenParkBackdrop() {
    return '<image href="assets/park-storybook-v1.png" x="-90" y="0" width="720" height="365" preserveAspectRatio="none"/>';
  }
  function world(n) {
    const s=state, c=s.config, view=n.view, role=H.themes[s.theme].guest.toLowerCase();
    const happyGhost=s.theme==='bakery'&&n.id==='happy-description';
    const motion = s.theme==='library'&&n.id==='celebrate' ? 'party-dance' : role==='princess'&&n.id==='find-book'&&s.phase==='reading' ? 'search-book' : role==='princess'&&n.id==='hello' ? 'royal-hello' : role==='ghost'&&n.id==='hello' ? 'hello-wave' : s.theme==='library'&&n.id==='crown-on' ? 'skirt-jump' : happyGhost ? 'happy-spin' : s.phase==='acting' ? (n.motion==='chosen'?s.scene.command:n.motion) : '';
    let props='', actors=`<div class="actor-row">${rosie(motion==='happy'||motion==='reward'||motion==='celebrate')}${guest(role,motion)}</div>`;
    if(n.id==='goodbye'&&['bakery','library'].includes(s.theme)) actors='<div class="farewell-duet">'+goodbyeRosie()+(s.theme==='library'?guest('princess','wave'):goodbyeGhost())+'</div>';
    if(happyGhost) props+=`<div class="happy-sparkles" aria-hidden="true">${[0,1,2,3,4].map(i=>`<span style="--i:${i}">★</span>`).join('')}</div>`;
    const packing=n.id==='candy-in'&&!s.replaying&&!s.override&&['reading','acting'].includes(s.phase);
    const packingMoving=packing&&s.phase==='acting';
    const elapsed=packingElapsed();
    if(s.theme==='library'&&n.id==='celebrate') {
      actors=`<div class="library-party-duet"><div class="party-rosie">${rosie(true)}</div><div class="party-princess">${guest('princess','party-dance')}</div><div class="duet-sparkles" aria-hidden="true">${Array.from({length:12},(_,i)=>'<span style="--party-i:'+i+';--party-color:'+['#ff779e','#75dcff','#ffe36c','#bca0ff','#8ce8ae','#ffac68'][i%6]+'">'+(i%3===0?'♪':i%3===1?'✦':'♫')+'</span>').join('')}</div><div class="duet-ribbons" aria-hidden="true">${Array.from({length:16},(_,i)=>'<i style="--ribbon-i:'+i+';--ribbon-color:'+['#ff729c','#79dfff','#ffdf65','#b698ff','#83e6ae'][i%5]+'"></i>').join('')}</div></div>`;
    }
    if (s.theme==='bakery') props+=`<div class="scene-prop party-box ${motion==='deliver'?'prop-arrive':''} ${packingMoving?'packing-box':''}" style="--elapsed:${elapsed}ms">${A.box(s.scene.cookie?'pumpkin':null,packing&&s.phase==='reading'?0:s.scene.candies,!!s.scene.delivered)}</div>`;
    if(packingMoving) props+=Array.from({length:s.scene.candies},(_,i)=>`<div class="candy-transfer" style="--from-x:calc(var(--bakery-inset,10%) + var(--bakery-span,80%) * ${(87+(i%4)*25)/660});--from-y:${(179+Math.floor(i/4)*25)/365*100}%;animation-delay:${i*3000-elapsed}ms">${A.svg(A.use('candy',0,0,100),'','0 0 100 100')}</div>`).join('');
    if (!s.scene.pinkTaken&&!s.scene.ghostTaken) pickupAnimated=false;
    if(packingMoving) props+=`<div class="candy-counting" aria-label="Count the candies">${Array.from({length:s.scene.candies},(_,i)=>'<span class="candy-count-step" style="animation-delay:'+(i*3000+2000-elapsed)+'ms;animation-duration:'+(i===s.scene.candies-1?4500:3000)+'ms">'+(i+1)+'<small>'+['One','Two','Three','Four','Five'][i]+'</small></span>').join('')}</div>`;
    if(s.theme==='bakery'&&n.id==='request-cookie') actors=`<div class="actor-row cookie-request-row">${rosie()}<div class="ghost-request-group">${guest(role)}<div class="ghost-order-bubble" aria-label="Ghost wants a pumpkin cookie">${A.icon('pumpkin-cookie',s)}</div></div></div>`;
    else if (['pumpkin','crown','wrong-object','wrong-cookie','wrong-guest'].includes(view) && !(s.theme==='library'&&view==='crown') && !(s.theme==='bakery'&&view==='wrong-cookie'&&['pink','ghost-cookie'].includes(c.wrongObject))) props+=`<div class="${s.theme==='library'&&view==='wrong-object'?'falling-crown':'teaching-prop'}">${A.icon(view==='pumpkin'?'pumpkin':view==='crown'?'crown':c.wrongObject,s)}</div>`;
    if(s.theme==='bakery'&&view==='wrong-cookie'&&['pink','ghost-cookie'].includes(c.wrongObject)) {
      props+=`<div class="picked-cookie ${c.wrongObject==='ghost-cookie'?'from-right':''} ${pickupAnimated?'':'cookie-pickup'}">${A.icon(c.wrongObject,s)}</div>`;
      pickupAnimated=true;
    }
    if (s.theme==='library'&&n.id==='teach-crown') props+=`<div class="falling-crown glowing-crown">${A.svg(document.querySelector('#crown').innerHTML.replace('<ellipse','<ellipse class="crown-ruby"'),'','0 0 100 100')}</div>`;
    if(n.choices&&s.phase==='waiting') props+=`<div class="scene-choices choices ${n.choices.length===2?'two':''}" aria-label="Choose your child’s answer">${n.choices.map(c=>button('answer',`${c.picture==='number'?`<span class="big-number">${c.label}</span>`:A.icon(c.picture,s)}<span class="choice-label">${esc(c.label)}</span>`,`choice ${s.help&&n.correct.includes(c.key)?'highlight':''} ${s.wrong===c.key?'wrong':''}`,c.key,s.paused)).join('')}</div>`;
    if (s.theme==='library' && s.scene.book) {
      const opening=n.id==='open-book'&&s.phase==='acting', closing=n.id==='close-book'&&s.phase==='acting';
      const opened=s.scene.open&&!(n.id==='open-book'&&s.phase==='reading');
      props+=`<div class="animated-book ${opened||closing?'book-open':''} ${opening?'book-opening':''} ${closing?'book-closing':''}"><div class="book-paper">${ridingStory()}</div><div class="book-turning-page ${opened&&s.phase==='acting'?'turn-page':''}"></div><div class="book-front">${A.icon('crown-book',s)}</div></div>`;
    }
    if (view==='claps') props+=`<div class="count-stars">${Array.from({length:s.scene.claps},(_,i)=>`<div class="count-star">${A.icon('star',s)}${c.first||s.help?`<span>${i+1}</span>`:''}</div>`).join('')}</div>`;
    if (['invitation','positions'].includes(view)) props+=`<div class="invitation">${A.svg(`<g class="${view==='invitation'?'card-parade':''}">${A.use('witch',0,0,45,95)}${A.use('pirate',45,0,45,95)}${A.use('ghost',90,0,45,95)}</g>`)}<b>${c.position}</b></div>`;
    if (view==='positions') {
      props+=`<div class="footprints">${[1,2,3].map(i=>`<span class="footprint ${s.help&&i===c.position?'correct':''}">${i}</span>`).join('')}</div>`;
      const position=s.wrong?Number(s.wrong):s.scene.position;
      if(position) actors=`<div class="position-guest" style="left:${[17,50,83][position-1]}%">${guest(role,motion)}</div>`;
    }
    if (s.scene.parade || view==='parade') {
      const lineup=['witch','ghost']; lineup.splice(c.position-1,0,'pirate');
      actors=`<div class="parade-row ${s.phase==='acting'?'walking':''}">${lineup.map(k=>guest(k,'')).join('')}</div>`;
    }
    if(s.theme==='park') {
      if(!s.scene.guest) actors=`<div class="actor-row park-search-actors">${rosie()}<div class="pirate-hiding-clue" aria-label="The pirate is lying under the swing">${A.piratePose(true,0,0,240,125)}</div></div>`;
      if(n.id==='mermaid-found') actors='';
      props+=`<div class="park-mermaid ${n.id==='mermaid-found'?'mermaid-discovered':view==='park-mermaid'?'mermaid-focus':''}" aria-label="Mermaid in the sea">${A.svg(n.id==='mermaid-found'?'<image href="assets/mermaid-pearl-v1.png" width="160" height="150" preserveAspectRatio="xMidYMid meet"/>':A.mermaid(),'','0 0 160 150')}</div>`;
      if(['park-gold','park-gold-found'].includes(view)) props+=`<div class="park-story-prop gold-story ${s.scene.gold?'gold-collected':''}">${A.parkLocation('gold-on-ground')}</div>`;
      if(['park-ship','park-sail'].includes(view)) props+=`<div class="park-story-prop ship-story ${s.scene.sailed?'ship-sailing':''}">${A.parkLocation('ship-on-lake')}${s.scene.ship?'<span class="gold-on-board">✦</span>':''}</div>`;
    }
    if (view==='reward') props+=`<div class="sticker-pocket ${n.id==='reward'&&s.phase==='reading'?'pocket-empty':n.id==='reward'&&s.phase==='acting'?'pocket-receiving':''}"><span>My Halloween Wall</span>${A.icon(role,s)}</div><div class="sticker-preview ${n.id==='reward'&&s.phase==='acting'?'sticker-flying':n.id==='goodbye'||s.phase==='ready'?'sticker-stored':''}">${A.icon(role,s)}</div>`;
    const decor=s.theme==='park'?halloweenParkBackdrop():s.theme==='library'?'<path d="M25 80h470M25 140h470" stroke="#c1aac7" stroke-width="8"/><path d="M40 65v-35m24 35v-45m30 45v-37m35 37v-42m250 102v-40m25 40v-48m30 48v-35" stroke="#b99fbd" stroke-width="17"/>':'<path d="M30 105h470" stroke="#d8b69b" stroke-width="6"/><path d="m40 28 40 40 40-40 40 40 40-40 40 40 40-40 40 40 40-40 40 40 40-40" fill="none" stroke="#dcabbd" stroke-width="12"/>';
    const background=s.theme==='library'?'<div class="library-storybook-scene"><img class="library-illustration" src="assets/library-storybook-v2.png?v=readers7" alt="Halloween Library with magical bookshelves, moonlit windows, pumpkins and candles">'+libraryBackdrop()+'</div>':s.theme==='park'?'<img class="park-illustration" src="assets/park-storybook-v1.png?v=park3" alt="Halloween park with a ghost slide, spider swing, bee seesaw, lake and pirate ship">':['bakery','library'].includes(s.theme)?A.svg(s.theme==='bakery'?`<rect x="-60" width="660" height="365" fill="#352534"/><path d="M-60 248h660v117H-60Z" fill="#493142"/>${bakeryBackdrop()}`:libraryBackdrop(),`${s.theme}-backdrop`,s.theme==='bakery'?'-60 0 660 365':'0 0 540 365').replace('<svg ', '<svg preserveAspectRatio="none" '):A.svg(decor,'',s.theme==='park'?'-90 0 720 365':'0 0 540 365');
    props+=halloweenDecor();
    const bats=`<div class="halloween-bats" aria-hidden="true">${[0,1,2,3].map(i=>`<div class="flying-bat bat-${i}"><svg viewBox="0 0 100 50"><path class="bat-wing wing-left" d="M48 25Q27 0 2 7L12 27Q23 18 29 34Q37 24 48 33Z"/><path class="bat-wing wing-right" d="M52 25Q73 0 98 7L88 27Q77 18 71 34Q63 24 52 33Z"/><path d="M43 14 40 3 49 12 57 3 57 16Q65 32 50 42Q36 33 43 14Z"/><circle class="bat-eye" cx="46" cy="22" r="2.5"/><circle class="bat-eye" cx="55" cy="22" r="2.5"/></svg></div>`).join('')}</div>`;
    return `<div class="world ${s.theme} ${n.id==='pirate-found'?'pirate-greeting-scene':''} ${n.id==='mermaid-found'?'mermaid-reveal-scene':''} ${s.scene.crown?'crowned':''} ${n.id==='goodbye'?'farewell-scene':n.id==='reward'?'reward-scene':''} ${s.paused?'paused':''}"><div class="world-decor">${background}</div>${actors}${props}${bats}${s.paused?'<div class="paused-cover"><div><h2>Paused</h2><p>Take your time. Your story is waiting.</p></div></div>':''}</div>`;
  }
  function play() {
    const n=H.current(state), t=H.themes[state.theme], disabled=state.paused;
    let controls='';
    if(state.phase==='checkpoint') controls=`<h2>A lovely little step!</h2><p class="small-note">Ready for the next part, or try this part again.</p>${button('got-it','Got it','primary','',disabled)} ${button('again','Again','secondary','',disabled)}`;
    else {
      controls=`${(state.override||n.lines).map(l=>`<div class="dialogue-line"><span class="speaker">${l.who}’s words · Parent reads</span><p>${esc(l.text)}</p></div>`).join('')}`;
      if(state.phase==='reading') controls+=`<div class="reading-controls">${button('gesture',speaking?'Stop gestures':'Speaking gestures','secondary','',disabled)}${button('read','Finished reading','primary','',disabled)}</div><p class="small-note">Read aloud yourself. “Speaking gestures” animates Rosie; it does not play audio.</p>`;
      if(state.phase==='waiting') controls+='<p class="question-hint">Let your child speak first. Choose their answer in the scene.</p>';
      if(state.phase==='natural') controls+='<p class="feedback">A little space to say hello, share a feeling or say goodbye. No answer button needed.</p>';
      if(state.phase==='acting') controls+='<p class="feedback">Watch our friend move!</p>';
      if(state.phase==='ready') controls+=button('continue','Continue','primary','',disabled);
      if(state.other) controls+='<p class="feedback">A lovely idea! Use Need help to model a short phrase, or Not now to move on together.</p>';
    }
    return `<section class="play"><div class="chapter-bar"><h1>${t.name}</h1><span class="stage-label">${n.stage<=3?`Part ${n.stage} of 3`:'Our happy ending'}</span><div class="dots">${[1,2,3].map(i=>`<span class="${n.stage>=i?'active':''}"></span>`).join('')}</div></div><div class="play-grid">${world(n)}<div><div class="dialogue" aria-live="polite">${controls}</div></div></div><div class="parent-panel"><div class="parent-header">PARENT AREA · READ TOGETHER · NO MICROPHONE</div><div class="parent-actions">${button('replay','Replay','', '',disabled||state.phase==='checkpoint')}<details class="parent-more"><summary>More</summary><div class="more-buttons">${button('again','Again','','',disabled)}${button('hint','Need help',glow?'support-glow':'','',disabled||n.kind!=='question')}${button('other','Something else','','',disabled||state.phase!=='waiting')}${button('skip','Not now','','',disabled||n.kind!=='question')}</div></details><span class="spacer"></span>${button(state.paused?'resume':'pause',state.paused?'Resume':'Pause')}${button('end','End','quiet')}</div><p class="small-note note-bottom">No automatic answer after waiting. Pause keeps your place; End stops this round.</p></div></section>`;
  }
  function render() {
    document.querySelector('#wall-count').textContent=`${state.collected.length} / 3`;
    if(state.screen==='home') app.innerHTML=home();
    else if(state.screen==='play') app.innerHTML=play();
    else if(state.screen==='ended') app.innerHTML=`<section class="completion"><p class="eyebrow">SEE YOU SOON</p><h1>Our story can wait.</h1><p>This round has ended. You can start a new story whenever you like.</p>${button('home','Back to the Party','primary')}</section>`;
    else {const t=H.themes[state.theme];app.innerHTML=`<section class="completion"><p class="eyebrow">A LITTLE ADVENTURE, TOGETHER</p><div class="reward-illustration">${A.icon(t.guest.toLowerCase(),state)}${A.icon('star',state)}</div><span class="badge">${t.badge}</span><h1>You did it!</h1><p>${t.guest}’s sticker is on your Halloween Wall.</p><div class="completion-actions">${button('play-again','Play Again','primary')}${button('home','Back to the Party')}</div></section>`;}
    document.querySelector('#clear-wall').disabled=state.screen!=='home';
    if(state.screen==='play') {
      const dock=app.querySelector('.dialogue').parentElement;
      dock.classList.add('play-dock');
      dock.append(app.querySelector('.parent-panel'));
      const bat=app.querySelector('.flying-bat svg');
      if(bat) app.querySelector('.play').insertAdjacentHTML('beforeend',`<div class="screen-bat ${state.paused?'paused':''}" aria-hidden="true">${bat.outerHTML}</div>`);
    }
  }
  function syncTimer() {
    const active=state.screen==='play'&&['acting','natural','waiting'].includes(state.phase);
    const key=active?`${state.theme}:${state.index}:${state.phase}`:'';
    if(key!==timerKey){clearTimeout(timer);timer=null;timerKey=key;remaining=active?(state.phase==='waiting'?5000:H.current(state).duration):0;glow=false;}
    if(state.paused){if(timer){remaining=Math.max(0,deadline-performance.now());clearTimeout(timer);timer=null;}return;}
    if(active&&!timer&&remaining>0){deadline=performance.now()+remaining;timer=setTimeout(()=>{timer=null;remaining=0;if(state.phase==='waiting'){glow=true;render();}else dispatch('elapsed');},remaining);}
  }
  function dispatch(action,value) {
    speaking=false;state=H.reduce(state,action,value);syncTimer();render();
    try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(state.collected.map(k=>[k,true]))));}catch(_){}
  }
  app.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;if(b.dataset.action==='gesture'){speaking=!speaking;render();return;}dispatch(b.dataset.action,b.dataset.value);});
  document.querySelector('#brand').onclick=e=>{e.preventDefault();if(state.screen!=='play')dispatch('home');};
  function wall(){document.querySelector('#wall-items').innerHTML=Object.entries(H.themes).map(([k,t])=>`<div class="wall-sticker ${state.collected.includes(k)?'':'locked'}">${A.icon(t.guest.toLowerCase(),state)}<p>${t.guest}<br>${state.collected.includes(k)?t.badge:'An adventure to come'}</p></div>`).join('');}
  document.querySelector('#wall-toggle').onclick=()=>{if(state.screen==='play'&&!state.paused)dispatch('pause');wall();document.querySelector('#wall-dialog').showModal();};
  document.querySelector('#close-wall').onclick=()=>document.querySelector('#wall-dialog').close();
  document.querySelector('#clear-wall').onclick=()=>document.querySelector('#reset-confirm').hidden=false;
  document.querySelector('#cancel-reset').onclick=()=>document.querySelector('#reset-confirm').hidden=true;
  document.querySelector('#confirm-reset').onclick=()=>{dispatch('clear');wall();document.querySelector('#reset-confirm').hidden=true;};
  let frame=0;
  setInterval(()=>{if(state.paused)return;frame++;document.querySelectorAll('.rosie').forEach(r=>{if(r.classList.contains('happy'))return;const pose=speaking?(frame%2?'speak-small-hand':'speak-wide-hand'):frame%19===0?'blink':'idle';r.querySelectorAll('.frame').forEach(img=>img.classList.toggle('active',img.dataset.pose===pose));});},220);
  render();
})();













