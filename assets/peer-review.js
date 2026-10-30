(()=>{'use strict';
const form=document.querySelector('#peer-review-form'),status=document.querySelector('#peer-status'),button=form.querySelector('[type=submit]');
const endpoint='https://uts-peer-reviews-angelo.swiftcamel2049.chatgpt.site/api/reviews';let id=crypto.randomUUID();let submitting=false;
form.addEventListener('submit',async event=>{event.preventDefault();if(submitting||!form.reportValidity())return;submitting=true;button.disabled=true;status.textContent='Sending your review…';
 const values=Object.fromEntries(new FormData(form));const payload={id,name:values.name,section:values.section,message:values.message,confusing:values.confusing,suggestion:values.suggestion,smallStep:values.smallStep,website:values.website,consent:form.elements.consent.checked,ratings:{}};
 for(const key of ['clarity','relevance','usability','helpfulness'])payload.ratings[key]=Number(values[key]);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Your review could not be saved.');
  form.hidden=true;status.textContent='Thank you. Your review has been sent privately to the project author.';status.focus();document.querySelector('#peer-receipt').hidden=false;document.querySelector('#peer-reference').textContent=result.id;
 }catch(error){status.textContent=error.name==='AbortError'?'The connection timed out. Your answers are still here. Try sending again.':error.message+' Your answers are still here.';}
 finally{clearTimeout(timeout);submitting=false;button.disabled=false;}
});
})();
