(function(root){
'use strict';
class Narrator {
 constructor(api,Utterance,config={}){this.api=api;this.Utterance=Utterance;this.audio=config.audio;this.gap=config.gap||0;this.generation=0;this.key=null;this.timer=null;this.available=!!(api&&Utterance);}
 stop(){this.generation++;this.key=null;this.paused=false;clearTimeout(this.timer);this.audio?.stopVoice();this.api?.cancel();this.gapPending=false;}
 voice(who){const english=this.api.getVoices().filter(v=>/^en[-_]/i.test(v.lang)),us=english.filter(v=>/^en[-_]US/i.test(v.lang)),pool=us.length?us:english;return pool.find(v=>(/pirate|vampire/i.test(who)?/David|Guy|Daniel|Male/i:/Zira|Aria|Jenny|Samantha|Female/i).test(v.name))||pool[0];}
 play(lines,options){if(this.key===options.key)return;this.stop();this.key=options.key;this.options=options;this.lines=lines;this.index=0;this.next(this.generation);}
 next(generation){if(generation!==this.generation)return;if(this.index>=this.lines.length){this.key=null;this.options.onDone();return;}const line=this.lines[this.index],asset=this.audio?.asset(line.who,line.text);if(asset){this.audio.playVoice(asset,{isCancelled:()=>generation!==this.generation,onStart:()=>this.started(generation,line,'recorded'),onEnd:()=>this.ended(generation,line),onEnergy:value=>this.options.onEnergy?.(value)}).catch(()=>{if(generation===this.generation)this.device(generation,line);});}else this.device(generation,line);const next=this.lines[this.index+1];if(next)this.audio?.preload(next.who,next.text);}
 started(g,line,mode){if(g!==this.generation)return;this.audio?.duck(true);this.options.onMode?.(mode);this.options.onLine(this.index,line);}
 ended(g,line){if(g!==this.generation)return;clearTimeout(this.timer);this.audio?.duck(false);this.options.onLineEnd?.(line);this.index++;if(this.gap){this.gapPending=true;this.timer=setTimeout(()=>{this.gapPending=false;this.next(g);},this.gap);}else this.next(g);}
 fail(g,message){if(g!==this.generation)return;const callback=this.options.onError;this.stop();callback(message);}
 device(g,line){if(!this.available){this.fail(g,'English voice unavailable. Tap to retry.');return;}const u=new this.Utterance(line.text);this.utterance=u;u.lang='en-US';u.voice=this.voice(line.who)||null;u.rate=.88;u.pitch=1;u.volume=this.audio?this.audio.voiceVolume():1;u.onstart=()=>this.started(g,line,'device');u.onend=()=>this.ended(g,line);u.onerror=()=>this.fail(g,'Tap to hear the voice again.');this.armTimer(g);this.api.speak(u);}
 armTimer(g){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(!this.paused)this.fail(g,'Tap to hear the voice again.');},Math.max(20000,(this.utterance?.text.length||0)*180+10000));}
 pause(){this.paused=true;clearTimeout(this.timer);this.api?.pause();}
 resume(){if(!this.paused)return;this.paused=false;this.api?.resume();if(this.key){if(this.gapPending){this.gapPending=false;this.next(this.generation);}else this.armTimer(this.generation);}}
}
root.HalloweenNarrator=Narrator;
})(typeof window==='undefined'?globalThis:window);
