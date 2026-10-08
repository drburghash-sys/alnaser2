const AS_OF="6 أكتوبر 2026";
const SOURCES={
  splTeam:"https://www.spl.com.sa/ar/teams/al-nassr/index?compSeason=858",
  splFixtures:"https://www.spl.com.sa/ar/fixtures-results?team=3495",
  splStats:"https://www.spl.com.sa/en/stats/index",
  saffSuper:"https://www.saff.com.sa/championship.php?id=55&season=all",
  afcHistory:"https://www.the-afc.com/en/club/fifa_club_world_cup/news/al_nassrs_unique_run_to_the_global_stage.html",
  saudipedia:"https://saudipedia.com/نادي-النصر"
};

let players=[],legends=[],foreigners=[],trophies=[],fixtures=[],history=[],seasons=[];

function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}
function stat(v){return v==null?"—":v}
function fallbackMark(p){return p.no&&p.no!=="—"?esc(p.no):"★"}

async function loadData(){
  const paths=["current-players","legends","historical-foreigners","trophies","fixtures","history","seasons"];
  const rows=await Promise.all(paths.map(async function(name){
    const r=await fetch("./data/"+name+".json",{cache:"no-store"});
    if(!r.ok) throw new Error("تعذر تحميل "+name);
    return r.json();
  }));
  [players,legends,foreigners,trophies,fixtures,history,seasons]=rows;
  renderAll();
}

function playerCard(p){
  const photo=p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.name)+'" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="fallbackNo" style="display:none">'+fallbackMark(p)+'</div>':'<div class="fallbackNo">'+fallbackMark(p)+'</div>';
  const sub=p.tier?(esc(p.tier)+' · '+esc(p.era||p.position)):(esc(p.position)+' · '+esc(p.nation));
  const assistText=p.tier?((p.assistRecords&&p.assistRecords.length)?"الصناعة: سجل موسمي موثق":(p.assists==null?"الصناعة: غير موثقة":"الصناعة: "+esc(p.assists))):"الصناعة: "+stat(p.assists);
  return '<button class="playerCard" data-player="'+esc(p.id)+'"><div class="photo"><span class="shirtNo">'+fallbackMark(p)+'</span>'+photo+'</div><div class="caption"><strong>'+esc(p.name)+'</strong><small>'+sub+'</small><small class="assistLine">🎯 '+assistText+'</small></div></button>';
}
function renderFeatured(){
  const ids=["ronaldo","felix","mane","angelo","coman"];
  const list=ids.map(function(id){return players.find(function(p){return p.id===id})}).filter(Boolean);
  document.getElementById("featured").innerHTML=list.map(playerCard).join("");
}
function historicalForeigners(){
  const map=new Map();
  foreigners.concat(legends.filter(function(p){return p.nation&&p.nation!=="السعودية"})).forEach(function(p){if(!map.has(p.id))map.set(p.id,p)});
  return Array.from(map.values());
}
function renderSquad(filter){
  let list;
  if(filter==="legend") list=legends.slice();
  else if(filter==="foreign") list=historicalForeigners();
  else list=players.filter(function(p){return filter==="all"||p.pos===filter});
  if(filter==="legend"){
    const order={"أسطورة":1,"رمز تاريخي":2,"جيل العالمية":3,"نجم تاريخي":4,"نجم حقبة المحترفين":5,"نجم عالمي سابق":6,"نجم حديث":7};
    list.sort(function(a,b){return (order[a.tier]||99)-(order[b.tier]||99)||a.name.localeCompare(b.name,"ar")});
    document.getElementById("playersMeta").textContent=legends.length+" اسمًا تاريخيًا";
  }else if(filter==="foreign"){
    list.sort(function(a,b){return String(a.era||"").localeCompare(String(b.era||""),"ar")});
    document.getElementById("playersMeta").textContent=list.length+" أجنبيًا تاريخيًا في الأرشيف";
  }else{
    document.getElementById("playersMeta").textContent=players.length+" لاعبًا في القاعدة الحالية";
  }
  document.getElementById("playersGrid").innerHTML=list.length?list.map(playerCard).join(""):'<div class="empty">لا توجد عناصر.</div>';
}
function renderTrophies(){
  document.getElementById("trophyList").innerHTML=trophies.map(function(t){
    const shown=t.count!=null?t.count:(t.secondaryCount!=null?t.secondaryCount:"—");
    const sourceBadge=t.official?"موقع النصر الرسمي":"مرجع ثانوي";
    const details=t.seasons?esc(t.seasons)+"<br>":"";
    return '<article class="trophyItem"><div class="cupCount"><b>'+shown+'</b></div><div><strong>'+esc(t.title)+'</strong><p>'+details+esc(t.note)+'</p><span class="seasonStatus">'+sourceBadge+'</span> <a href="'+esc(t.source)+'" target="_blank" rel="noopener">'+esc(t.sourceName||"المصدر")+' ↗</a></div></article>';
  }).join("");
}
function renderFixtures(){
  document.getElementById("fixtures").innerHTML=fixtures.map(function(f){return '<div class="fixture"><div class="when"><b>'+esc(f.date)+'</b><small>'+esc(f.round)+'</small></div><div class="teams"><strong>'+esc(f.home)+' × '+esc(f.away)+'</strong><small>'+esc(f.where)+'</small></div><div class="tag">'+esc(f.state)+'</div></div>'}).join("");
}
function renderLeaders(){
  const list=players.filter(function(p){return p.matches!=null}).sort(function(a,b){return ((b.goals||0)+(b.assists||0))-((a.goals||0)+(a.assists||0))});
  document.getElementById("statLeaders").innerHTML=list.map(function(p){return '<button class="leader" data-player="'+esc(p.id)+'"><div class="miniNo">'+fallbackMark(p)+'</div><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.position)+'</small></div><div class="metric"><b>'+stat(p.matches)+'</b><small>مباراة</small></div><div class="metric"><b>'+stat(p.goals)+'</b><small>هدف</small></div><div class="metric"><b>'+stat(p.assists)+'</b><small>صناعة</small></div></button>'}).join("");
}
function renderHistory(){document.getElementById("historyList").innerHTML=history.map(function(h){return '<article class="event"><b>'+esc(h.year)+'</b><strong>'+esc(h.title)+'</strong><small>'+esc(h.text)+'</small></article>'}).join("")}

function seasonMatchesFilter(s,filter){
  if(filter==="all") return true;
  if(filter==="title") return Array.isArray(s.honours)&&s.honours.length>0;
  if(filter==="asia") return s.continental&&s.continental!=="—";
  if(filter==="modern") return parseInt(s.label,10)>=2010;
  return true;
}
function renderSeasons(filter){
  filter=filter||"all";
  const list=seasons.filter(function(s){return seasonMatchesFilter(s,filter)}).slice().reverse();
  document.getElementById("seasonArchiveMeta").textContent=list.length+" موسمًا";
  document.getElementById("seasonArchive").innerHTML=list.map(function(s){
    const badges=(s.honours||[]).concat(s.continental&&s.continental!=="—"?[s.continental]:[]).slice(0,3);
    return '<button class="seasonArchiveCard" data-season="'+esc(s.id)+'"><div class="seasonArchiveTop"><div><small>'+esc(s.era)+'</small><h3>'+esc(s.label)+'</h3></div><span class="seasonStatus">'+esc(s.status)+'</span></div><p>'+esc(s.note)+'</p><div class="seasonBadges">'+badges.map(function(x){return '<span>'+esc(x)+'</span>'}).join("")+'</div></button>';
  }).join("");
}
function openSeason(id){
  const s=seasons.find(function(x){return x.id===id}); if(!s)return;
  closeModal("playerModal");
  const stars=(s.stars||[]).map(findPlayer).filter(Boolean);
  const starHtml=stars.length?'<div class="seasonStars"><strong>نجوم هذا الموسم</strong><div class="starChips">'+stars.map(function(p){return '<button data-player="'+esc(p.id)+'">'+esc(p.name)+'</button>'}).join("")+'</div></div>':'';
  const sourceHtml=(s.sources||[]).length?'<div class="seasonSources">'+s.sources.map(function(src,i){return '<a href="'+esc(src)+'" target="_blank" rel="noopener">المصدر '+(i+1)+' ↗</a>'}).join("")+'</div>':'';
  document.getElementById("seasonDetail").innerHTML='<div class="seasonDetailHead"><small>'+esc(s.era)+' · '+esc(s.status)+'</small><h2>'+esc(s.label)+'</h2><p>'+esc(s.note)+'</p></div><div class="seasonDetailGrid"><div><b>'+esc(s.division||s.league)+'</b><small>المسابقة</small></div><div><b>'+esc(s.leaguePosition)+'</b><small>المركز</small></div><div><b>'+stat(s.points)+'</b><small>النقاط</small></div><div><b>'+esc(s.played||"—")+'</b><small>لعب</small></div><div><b>'+esc(s.continental)+'</b><small>آسيا / دولي</small></div><div><b>'+esc((s.honours||[]).join("، ")||"—")+'</b><small>البطولات</small></div></div>'+starHtml+sourceHtml;
  document.getElementById("seasonModal").classList.add("open");
  document.getElementById("seasonModal").setAttribute("aria-hidden","false");
}
function renderSources(){
  const links=[["المصدر الأول: موقع نادي النصر الرسمي","https://alnassr.sa/AROYA"],["صفحة النصر في رابطة الدوري",SOURCES.splTeam],["المباريات والنتائج",SOURCES.splFixtures],["مركز إحصائيات الدوري",SOURCES.splStats],["سجل السوبر السعودي",SOURCES.saffSuper],["تاريخ النصر في الاتحاد الآسيوي",SOURCES.afcHistory],["سعوديبيديا: نادي النصر",SOURCES.saudipedia]];
  document.getElementById("sourceLinks").innerHTML=links.map(function(x){return '<a href="'+x[1]+'" target="_blank" rel="noopener">'+esc(x[0])+' ↗</a>'}).join("");
}
function renderAll(){
  renderFeatured();renderSquad("all");renderTrophies();renderFixtures();renderLeaders();renderHistory();renderSeasons("all");renderSources();
}
function go(id){
  document.querySelectorAll(".screen").forEach(function(s){s.classList.toggle("active",s.id===id)});
  document.querySelectorAll(".bottom button").forEach(function(b){b.classList.toggle("active",b.dataset.go===id||(id==="season"&&b.dataset.go==="seasons"))});
  window.scrollTo({top:0,behavior:"smooth"});
}
function findPlayer(id){return players.concat(legends,foreigners).find(function(p){return p.id===id})}
function openPlayer(id){
  const p=findPlayer(id); if(!p)return;
  const photo=p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.name)+'">':'<div class="fallbackNo">'+fallbackMark(p)+'</div>';
  const isLegend=!!p.tier;
  const hasAssistRecords=Array.isArray(p.assistRecords)&&p.assistRecords.length>0;
  const stats=isLegend
    ?'<div class="detailStats"><div><b>'+esc(p.tier)+'</b><small>التصنيف</small></div><div><b>'+esc(p.era||"—")+'</b><small>الحقبة</small></div><div><b>'+esc(p.position)+'</b><small>المركز</small></div><div><b>'+(hasAssistRecords?"موثق موسميًا":(p.assists==null?"غير موثق":esc(p.assists)))+'</b><small>صناعة أهداف</small></div></div>'
    :'<div class="detailStats"><div><b>'+stat(p.matches)+'</b><small>مباراة</small></div><div><b>'+stat(p.goals)+'</b><small>هدف</small></div><div><b>'+stat(p.assists)+'</b><small>صناعة</small></div></div>';
  const assistHistory=hasAssistRecords?'<div class="assistHistory"><strong>سجل صناعة الأهداف الموثق</strong>'+p.assistRecords.map(function(r){return '<div class="assistRecord"><span>'+esc(r.season)+' · '+esc(r.scope)+'</span><b>'+esc(r.assists)+' صناعة</b></div>'}).join("")+'</div>':'';
  const career=seasons.filter(function(s){return (s.stars||[]).includes(p.id)});
  const careerHtml=career.length?'<div class="seasonStars"><strong>في أرشيف المواسم</strong><div class="starChips">'+career.map(function(s){return '<button data-season="'+esc(s.id)+'">'+esc(s.label)+'</button>'}).join("")+'</div></div>':'';
  document.getElementById("playerDetail").innerHTML='<div class="detailTop"><div class="detailPhoto">'+photo+'</div><div class="detailText"><span class="pill dark">'+(isLegend?esc(p.tier):"#"+esc(p.no))+'</span><h2>'+esc(p.name)+'</h2><p>'+esc(p.position)+' · '+esc(p.nation)+'</p></div></div>'+stats+'<p class="detailNote">'+esc(p.note)+(isLegend?'<br><br>صناعة الأهداف للاعبين التاريخيين تُعرض فقط عندما نجد سجلًا موثقًا. كثير من مواسم الجيل القديم لم تكن تسجل التمريرات الحاسمة إحصائيًا، لذلك نكتب «غير موثق» بدل وضع صفر غير صحيح.':'<br><br>المباريات والأهداف والصناعة المعروضة تخص موسم 2026/27 وفق مصدر الإحصاءات المرتبط باللاعب.')+'</p>'+assistHistory+careerHtml+'<a class="linkBtn" href="'+esc(p.source)+'" target="_blank" rel="noopener">فتح المصدر ↗</a>';
  document.getElementById("playerModal").classList.add("open");
  document.getElementById("playerModal").setAttribute("aria-hidden","false");
}
function closeModal(id){const m=document.getElementById(id);m.classList.remove("open");m.setAttribute("aria-hidden","true")}
function search(term){
  const q=term.trim().toLowerCase(); if(!q){go("home");return}
  const rows=[];
  players.concat(legends,foreigners).forEach(function(p){const txt=[p.name,(p.aliases||[]).join(" "),p.no,p.position,p.nation,p.note,p.tier,p.era].join(" ").toLowerCase();if(txt.includes(q))rows.push({type:p.tier||"لاعب حالي",title:p.name,desc:(p.tier?((p.era||"")+" · "):("#"+p.no+" · "))+p.position,id:p.id})});
  trophies.forEach(function(t){const txt=[t.title,t.seasons,t.note].join(" ").toLowerCase();if(txt.includes(q))rows.push({type:"بطولة",title:t.title,desc:t.seasons})});
  history.forEach(function(h){const txt=[h.year,h.title,h.text].join(" ").toLowerCase();if(txt.includes(q))rows.push({type:"تاريخ",title:h.year+" · "+h.title,desc:h.text})});
  fixtures.forEach(function(f){const txt=[f.date,f.round,f.home,f.away,f.where].join(" ").toLowerCase();if(txt.includes(q))rows.push({type:"مباراة",title:f.home+" × "+f.away,desc:f.date+" · "+f.round})});
  seasons.forEach(function(s){const txt=[s.label,s.era,s.league,s.continental,s.note,(s.honours||[]).join(" ")].join(" ").toLowerCase();if(txt.includes(q))rows.push({type:"موسم",title:s.label+" · "+s.era,desc:s.league,seasonId:s.id})});
  document.getElementById("searchCount").textContent=rows.length+" نتيجة";
  document.getElementById("searchResults").innerHTML=rows.length?rows.map(function(r){return '<button class="searchRow" '+(r.id?'data-player="'+esc(r.id)+'"':(r.seasonId?'data-season="'+esc(r.seasonId)+'"':''))+'><b>'+esc(r.title)+'</b><small>'+esc(r.type)+' · '+esc(r.desc)+'</small></button>'}).join(""):'<div class="empty">لم أجد نتيجة. جرّب اسم لاعب أو بطولة أو سنة.</div>';
  go("search");
}

document.addEventListener("click",function(e){
  const nav=e.target.closest("[data-go]"); if(nav){go(nav.dataset.go);return}
  const pl=e.target.closest("[data-player]"); if(pl){closeModal("seasonModal");openPlayer(pl.dataset.player);return}
  const sn=e.target.closest("[data-season]"); if(sn){openSeason(sn.dataset.season);return}
  if(e.target.closest("[data-close-modal]")){closeModal("playerModal");return}
  if(e.target.closest("[data-close-season]")){closeModal("seasonModal");return}
  if(e.target.closest("[data-close-info]")){closeModal("infoModal");return}
});
document.getElementById("infoBtn").addEventListener("click",function(){document.getElementById("infoModal").classList.add("open");document.getElementById("infoModal").setAttribute("aria-hidden","false")});
document.getElementById("q").addEventListener("input",function(){search(this.value)});
document.getElementById("squadFilter").addEventListener("click",function(e){const b=e.target.closest("[data-filter]");if(!b)return;this.querySelectorAll("button").forEach(function(x){x.classList.toggle("active",x===b)});renderSquad(b.dataset.filter)});
document.getElementById("seasonFilter").addEventListener("click",function(e){const b=e.target.closest("[data-season-filter]");if(!b)return;this.querySelectorAll("button").forEach(function(x){x.classList.toggle("active",x===b)});renderSeasons(b.dataset.seasonFilter)});

loadData().catch(function(err){
  console.error(err);
  document.getElementById("playersGrid").innerHTML='<div class="empty">تعذر تحميل قاعدة البيانات. أعد تحميل الصفحة.</div>';
});
if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js")})}
