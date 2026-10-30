(()=>{'use strict';
const form=document.querySelector('#peer-review-form'),status=document.querySelector('#peer-status'),button=form.querySelector('[type=submit]');
const service='https://uts-peer-reviews-angelo.swiftcamel2049.chatgpt.site';
const board=document.querySelector('#peer-stickers'),boardStatus=document.querySelector('#peer-board-status'),refresh=document.querySelector('#peer-refresh');
function reviewId(){if(crypto.randomUUID)return crypto.randomUUID();const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');}
let id=reviewId(),submitting=false,loading=false;
function element(tag,text,className){const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;}
function sticker(review){
 const paper=['butter','sage','rose','sky'].includes(review.color)?review.color:'butter';
 const card=element('article',null,'peer-sticker '+paper);
 const header=element('div',null,'sticker-header');header.append(element('h4',review.name||'Anonymous reader'));
 const date=new Date(review.createdAt);if(!Number.isNaN(date.getTime())){const time=element('time',new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',year:'numeric'}).format(date));time.dateTime=review.createdAt;header.append(time);}card.append(header);
 card.append(element('p','“'+review.message+'”','sticker-message'));
 const ratings=element('div',null,'sticker-ratings');for(const [key,label] of [['clarity','Clarity'],['relevance','Relevance'],['usability','Ease of use'],['helpfulness','Helpfulness']])ratings.append(element('span',label+' '+review.ratings[key]+'/5'));card.append(ratings);
 const detail=element('details'),summary=element('summary',review.guideVersion===1?'Read all six answers':'Read the full feedback');detail.append(summary);
 const answers=review.guideVersion===1?[["1. Message clarity",review.message],["2. Issue and UTS concepts",review.utsConnection],["3. Solution and audience",review.solution],["4. Measures of success",review.successMeasures],["5. Format and presentation",review.presentation],["6. Most helpful improvement",review.suggestion],["A small step",review.smallStep]]:[['Anything confusing?',review.confusing],['One improvement',review.suggestion],['A small step',review.smallStep]];
 for(const [label,text] of answers){if(!text)continue;detail.append(element('h5',label),element('p',text));}card.append(detail);return card;
}
async function loadBoard(){if(loading)return;loading=true;refresh.disabled=true;boardStatus.textContent='Loading notes…';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(service+'/api/board',{signal:controller.signal});const data=await response.json();if(!response.ok||!Array.isArray(data.reviews))throw Error('Could not load the board.');board.replaceChildren(...data.reviews.map(sticker));boardStatus.textContent=data.reviews.length?data.reviews.length+' reader '+(data.reviews.length===1?'note':'notes')+(data.truncated?' · Showing the latest available notes.':''):'No stickers yet. Be the first to leave a note.';}
 catch{boardStatus.textContent='The notes could not load. Tap Refresh notes to try again.';}finally{clearTimeout(timeout);loading=false;refresh.disabled=false;}}
refresh.addEventListener('click',loadBoard);loadBoard();
form.addEventListener('submit',async event=>{event.preventDefault();if(submitting||!form.reportValidity())return;submitting=true;button.disabled=true;status.textContent='Posting your sticker…';
 const values=Object.fromEntries(new FormData(form));const payload={id,name:values.name,section:values.section,guideVersion:1,message:values.message,utsConnection:values.utsConnection,solution:values.solution,successMeasures:values.successMeasures,presentation:values.presentation,suggestion:values.suggestion,smallStep:values.smallStep,website:values.website,color:values.color,publish:true,consent:form.elements.consent.checked,ratings:{}};
 for(const key of ['clarity','relevance','usability','helpfulness'])payload.ratings[key]=Number(values[key]);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(service+'/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Your review could not be saved.');
  form.hidden=true;status.textContent='Thank you. Your sticker has been posted publicly on the review board.';status.focus();document.querySelector('#peer-receipt').hidden=false;document.querySelector('#peer-reference').textContent=result.id;await loadBoard();
 }catch(error){status.textContent=error.name==='AbortError'?'The connection timed out. Your answers are still here. Try posting again.':error.message+' Your answers are still here.';}
 finally{clearTimeout(timeout);submitting=false;button.disabled=false;}
});
})();
