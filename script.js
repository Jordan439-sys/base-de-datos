// ===== PAGE ROUTER =====
const pages = ['home','perfil','u1','u2','u3','u4'];
const navIds = ['nav-home','nav-perfil','nav-u1','nav-u2','nav-u3','nav-u4'];

function show(id){
  pages.forEach(p=>{
    document.getElementById('page-'+p).classList.toggle('active',p===id);
  });
  navIds.forEach((n,i)=>{
    const el=document.getElementById(n);
    if(el) el.classList.toggle('active-nav',pages[i]===id);
  });
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>initReveal(),100);
}

// ===== LOGIN =====
let isAdmin=false;
function doLogin(){
  const u=document.getElementById('inp-user').value.trim();
  const p=document.getElementById('inp-pass').value.trim();
  const err=document.getElementById('login-err');
  if(u==='admin'&&p==='1234'){
    isAdmin=true;
    document.getElementById('modal').classList.remove('open');
    document.getElementById('btnLogin').style.display='none';
    document.getElementById('btnSalir').style.display='flex';
    document.getElementById('adminBadge').classList.add('show');
    err.style.display='none';
  } else {
    err.style.display='block';
  }
}
function logout(){
  isAdmin=false;
  document.getElementById('btnLogin').style.display='';
  document.getElementById('btnSalir').style.display='none';
  document.getElementById('adminBadge').classList.remove('show');
}
document.getElementById('inp-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

// ===== REVEAL ON SCROLL =====
function initReveal(){
  const els=document.querySelectorAll('.page.active .rv');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting) setTimeout(()=>e.target.classList.add('vis'),i*70);
    });
  },{threshold:0.1});
  els.forEach(el=>{el.classList.remove('vis');obs.observe(el);});
}
initReveal();
