import json,time,urllib.request,websocket,base64
w=websocket.create_connection(next(t['webSocketDebuggerUrl'] for t in json.load(urllib.request.urlopen('http://localhost:9227/json')) if t['type']=='page'),origin='http://localhost:9227');seq=0
def call(m,p={}):
 global seq
 seq+=1;w.send(json.dumps({'id':seq,'method':m,'params':p}))
 while True:
  r=json.loads(w.recv())
  if r.get('id')==seq:return r.get('result',{})
def ev(s):
 r=call('Runtime.evaluate',{'expression':s,'awaitPromise':True,'returnByValue':True})
 if 'exceptionDetails' in r:raise Exception(r)
 return r.get('result',{}).get('value')
def click(label):ev('document.querySelector('+json.dumps('button[aria-label="'+label+'"]')+').click()');time.sleep(.3)
def shot(name):open('.tmp-'+name+'.png','wb').write(base64.b64decode(call('Page.captureScreenshot',{'format':'png'})['data']))
call('Network.setBypassServiceWorker',{'bypass':True})
ev('new Promise(resolve=>{const r=indexedDB.open("finedu-wallet",1);r.onsuccess=()=>{const tx=r.result.transaction("appstate","readwrite"),store=tx.objectStore("appstate"),q=store.get("main");q.onsuccess=()=>{const s=q.result;for(const [i,categoria] of ["compras","moradia","jogos","saude"].entries()) if(!s.transactions.some(t=>t.id==="panel-test"+i)) s.transactions.push({id:"panel-test"+i,tipo:"despesa",valor:10,categoria,data:"2026-10-05T12:00:00"});store.put(s,"main");};tx.oncomplete=()=>resolve(true);};})')
for width,height in [(360,640),(320,568),(390,844)]:
 call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':True})
 call('Page.navigate',{'url':'http://127.0.0.1:4175/#/dashboard?month=2026-10'});time.sleep(.3);call('Page.reload',{'ignoreCache':True});time.sleep(.8)
 for panel in ['closed','calendar','categories']:
  if panel=='calendar':
   if height>780:continue
   click('Expandir calendário do mês')
  if panel=='categories':click('Expandir todas as categorias')
  shot(f'{height}-{panel}')
  print(height,panel,ev('({scroll:document.documentElement.scrollHeight,height:innerHeight,days:document.querySelectorAll(".calendar-day").length,categoryRows:document.querySelectorAll(".category-legend > button").length,bottom:document.querySelector(".home-insights").getBoundingClientRect().bottom,nav:document.querySelector("nav[aria-label=\\"Navegação principal\\"]").getBoundingClientRect().top})'))
  if panel=='calendar':click('Recolher calendário para a semana')
  if panel=='categories':click('Recolher categorias')
