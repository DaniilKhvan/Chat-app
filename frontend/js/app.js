const API_BASE = CONFIG.API_BASE;;

function showAlert(el, msg, type='danger'){
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove('d-none');
}

function hideAlert(el){
  el.classList.add('d-none');
}

(() => {
  'use strict';

  const registerForm = document.getElementById('registerForm');
  const registerAlert = document.getElementById('registerAlert');

  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    e.stopPropagation();
    hideAlert(registerAlert);

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;

    if(password !== confirm){
      showAlert(registerAlert, 'Passwords do not match.', 'warning');
      return;
    }

    if(!registerForm.checkValidity()){
      registerForm.classList.add('was-validated');
      return;
    }

    const btn = registerForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try{
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username,email,password})
      });

      if(resp.status === 201){
        showAlert(registerAlert,'Account created. Switch to Login.','success');
        const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
        setTimeout(()=> loginTab.show(), 500);
      } else if(resp.status === 409){
        const data = await resp.json().catch(()=>({message:'Email already in use'}));
        showAlert(registerAlert, data.message, 'warning');
      } else {
        const data = await resp.json().catch(()=>({message:'Server error'}));
        showAlert(registerAlert, data.message);
      }
    } catch(err){
      showAlert(registerAlert, 'Cannot reach server.');
      console.error(err);
    } finally{
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  });

  document.getElementById('registerCancel')?.addEventListener('click', ()=>{
    registerForm.reset();
    registerForm.classList.remove('was-validated');
    hideAlert(registerAlert);
  });

  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    e.stopPropagation();
    hideAlert(loginAlert);

    if(!loginForm.checkValidity()){
      loginForm.classList.add('was-validated');
      return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try{
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
      });

      if (resp.status === 200) {
      const data = await resp.json().catch(() => ({}));
      if (data.token) localStorage.setItem('chat_token', data.token);

      let isAdmin = false;

      if (data.user && data.user.role === 'admin') {
        isAdmin = true;
      } else {
        try {
          const profRes = await fetch(`${API_BASE}/users/profile`, {
            headers: { 'Content-Type': 'application/json', ...authHeader() }
          });
          if (profRes.status === 200) {
            const prof = await profRes.json();
            if (prof.role === 'admin') isAdmin = true;
          }
        } catch (e) {
          console.warn('Profile fetch failed', e);
        }
      }

      window.location.href = isAdmin ? '/admin.html' : '/chats.html';
    }
    else if(resp.status === 401){
        showAlert(loginAlert,'Invalid credentials.','warning');
      } else {
        const data = await resp.json().catch(()=>({message:'Login failed'}));
        showAlert(loginAlert, data.message || 'Login failed.');
      }
    } catch(err){
      showAlert(loginAlert,'Cannot reach server.');
      console.error(err);
    } finally{
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
})();
