(function(root){
'use strict';
class Narrator {
 constructor(api,Utterance){this.api=api;this.Utterance=Utterance;this.generation=0;this.key=null;this.paused=false;this.timer=null;this.available=!!(api&&Utterance);}
 stop(){this.generation++;this.key=null;this.paused=false;clearTimeout(this.timer);if(this.api)this.api.cancel();}
 voice(who){const all=this.api.getVoices(),english=all.filter(v=>/^en[-_]/i.test(v.lang)),us=english.filter(v=>/^en[-_]US/i.test(v.lang));const pool=us.length?us:english;const male=/pirate|vampire/i.test(who);return pool.find(v=>(male?/David|Guy|Daniel|Male/i:/Zira|Aria|Jenny|Samantha|Female/i).test(v.name))||pool[0];}
 play(lines,options){if(this.key===options.key)return;this.stop();this.key=options.key;const generation=this.generation;this.options=options;this.lines=lines;this.index=0;if(!this.available){options.onError('Voice is unavailable in this browser.');return;}this.next(generation);}
 next(generation){if(generation!==this.generation)return;if(this.index>=this.lines.length){this.key=null;this.options.onDone();return;}const line=this.lines[this.index],u=new this.Utterance(line.text);this.utterance=u;u.lang='en-US';u.voice=this.voice(line.who)||null;u.rate=.88;u.pitch=/pirate/i.test(line.who)?.85:/vampire/i.test(line.who)?.8:/Rosie/i.test(line.who)?1.12:1.05;u.volume=1;
 const fail=message=>{if(generation!==this.generation)return;const callback=this.options.onError;this.stop();callback(message);};
 u.onstart=()=>{if(generation===this.generation)this.options.onLine(this.index,line);};
 u.onend=()=>{if(generation!==this.generation)return;clearTimeout(this.timer);this.index++;this.next(generation);};
 u.onerror=e=>fail('Tap to play the voice again.');this.options.onLine(this.index,line);this.armTimer(generation,fail);this.api.speak(u);}
 armTimer(generation,fail){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(generation===this.generation&&!this.paused)fail('Tap to play the voice again.');},Math.max(20000,(this.utterance?.text.length||0)*180+10000));}
 pause(){this.paused=true;clearTimeout(this.timer);if(this.available)this.api.pause();}
 resume(){this.paused=false;if(this.available)this.api.resume();if(this.key){const generation=this.generation;this.armTimer(generation,message=>{this.key=null;this.options.onError(message);});}}
}
root.HalloweenNarrator=Narrator;
})(typeof window==='undefined'?globalThis:window);
