const API_BASE = 'http://localhost:3000/api';

function authHeader() {
  const t = localStorage.getItem('chat_token');
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

function showResult(el, msg, type='muted') {
  el.textContent = msg;
  el.className = type === 'error' ? 'text-danger' : (type === 'success' ? 'text-success' : 'small-muted');
}

(async function(){
  const token = localStorage.getItem('chat_token');
  if(!token) { window.location.href = '/index.html'; return; }

  try {
    const prof = await fetch(`${API_BASE}/users/profile`, {
      headers: { 'Content-Type':'application/json', ...authHeader() }
    });
    if (prof.status !== 200) { localStorage.removeItem('chat_token'); window.location.href = '/index.html'; return; }
    const user = await prof.json();
    if (user.role !== 'admin') { window.location.href = '/chats.html'; return; }
  } catch (e) {
    console.error('profile check failed', e);
    localStorage.removeItem('chat_token'); window.location.href = '/index.html'; return;
  }

  const logoutBtn = document.getElementById('logoutBtn');

  const delUserBtn = document.getElementById('delUserBtn');
  const delUserId = document.getElementById('delUserId');
  const delUserResult = document.getElementById('delUserResult');

  const delChatBtn = document.getElementById('delChatBtn');
  const delChatId = document.getElementById('delChatId');
  const delChatResult = document.getElementById('delChatResult');

  const delMsgBtn = document.getElementById('delMsgBtn');
  const delMsgId = document.getElementById('delMsgId');
  const delMsgResult = document.getElementById('delMsgResult');

  logoutBtn?.addEventListener('click', async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeader() } }); } catch(e){}
    localStorage.removeItem('chat_token');
    window.location.href = '/index.html';
  });

  delUserBtn.addEventListener('click', async () => {
    const id = delUserId.value.trim();
    if(!id) { showResult(delUserResult, 'Enter user id', 'error'); return; }
    delUserBtn.disabled = true;
    showResult(delUserResult, 'Deleting...');
    try {
      const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json', ...authHeader() }
      });
      if(res.status === 200) {
        showResult(delUserResult, 'User deleted', 'success');
        delUserId.value = '';
      } else if(res.status === 403) {
        showResult(delUserResult, 'Forbidden — you are not admin', 'error');
      } else if(res.status === 401) {
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        const d = await res.json().catch(()=>({message:'Failed'}));
        showResult(delUserResult, d.message || 'Failed to delete', 'error');
      }
    } catch(err) {
      console.error(err);
      showResult(delUserResult, 'Network error', 'error');
    } finally { delUserBtn.disabled = false; }
  });

  delChatBtn.addEventListener('click', async () => {
    const id = delChatId.value.trim();
    if(!id) { showResult(delChatResult, 'Enter chat id', 'error'); return; }
    delChatBtn.disabled = true;
    showResult(delChatResult, 'Deleting...');
    try {
      const res = await fetch(`${API_BASE}/admin/chats/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json', ...authHeader() }
      });
      if(res.status === 200) {
        showResult(delChatResult, 'Chat deleted', 'success');
        delChatId.value = '';
      } else if(res.status === 403) {
        showResult(delChatResult, 'Forbidden — you are not admin', 'error');
      } else if(res.status === 401) {
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        const d = await res.json().catch(()=>({message:'Failed'}));
        showResult(delChatResult, d.message || 'Failed to delete', 'error');
      }
    } catch(err) {
      console.error(err);
      showResult(delChatResult, 'Network error', 'error');
    } finally { delChatBtn.disabled = false; }
  });

  delMsgBtn.addEventListener('click', async () => {
    const id = delMsgId.value.trim();
    if(!id) { showResult(delMsgResult, 'Enter message id', 'error'); return; }
    delMsgBtn.disabled = true;
    showResult(delMsgResult, 'Deleting...');
    try {
      const res = await fetch(`${API_BASE}/admin/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json', ...authHeader() }
      });
      if(res.status === 200) {
        showResult(delMsgResult, 'Message deleted', 'success');
        delMsgId.value = '';
      } else if(res.status === 403) {
        showResult(delMsgResult, 'Forbidden — you are not admin', 'error');
      } else if(res.status === 401) {
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        const d = await res.json().catch(()=>({message:'Failed'}));
        showResult(delMsgResult, d.message || 'Failed to delete', 'error');
      }
    } catch(err) {
      console.error(err);
      showResult(delMsgResult, 'Network error', 'error');
    } finally { delMsgBtn.disabled = false; }
  });

})();
