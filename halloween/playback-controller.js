(function(root){
'use strict';
class PlaybackController {
 constructor(clock=()=>performance.now()){this.clock=clock;this.generation=0;this.frame=null;this.key=null;this.offset=0;this.paused=false;this.pending=0;}
 start(key,duration,events,done){if(this.key===key)return;this.stop();this.key=key;this.duration=duration;this.events=events.map(e=>({...e,fired:false}));this.done=done;this.started=this.clock();this.paused=false;const generation=this.generation;const tick=()=>{if(generation!==this.generation||this.paused)return;const t=this.elapsed();for(const e of this.events){if(!e.fired&&t>=e.at){e.fired=true;const result=e.run();if(result&&typeof result.then==='function'){this.pending++;Promise.resolve(result).catch(()=>{}).finally(()=>{if(generation===this.generation)this.pending--;});}}}if(t>=this.duration&&this.pending===0){this.key=null;this.done();return;}this.frame=requestAnimationFrame(tick);};this.tick=tick;this.frame=requestAnimationFrame(tick);}
 elapsed(){return this.key?this.offset+(this.paused?0:this.clock()-this.started):0;}
 pause(){if(!this.key||this.paused)return;this.offset=this.elapsed();this.paused=true;cancelAnimationFrame(this.frame);}
 resume(){if(!this.key||!this.paused)return;this.paused=false;this.started=this.clock();this.frame=requestAnimationFrame(this.tick);}
 stop(){this.generation++;if(this.frame!==null)cancelAnimationFrame(this.frame);this.key=null;this.offset=0;this.pending=0;this.elapsedOffset=0;}
}
root.HalloweenPlaybackController=PlaybackController;
})(typeof window==='undefined'?globalThis:window);
