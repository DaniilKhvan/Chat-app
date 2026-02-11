const API_BASE = CONFIG.API_BASE;;

function authHeader() {
  const t = localStorage.getItem('chat_token');
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

function showAlert(el, msg, type='danger'){
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove('d-none');
}

function hideAlert(el){
  el.classList.add('d-none');
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

(async function init(){
  const token = localStorage.getItem('chat_token');
  if(!token){
    window.location.href = '/index.html';
    return;
  }

  const addContactForm = document.getElementById('addContactForm');
  const addContactAlert = document.getElementById('addContactAlert');
  const contactsList = document.getElementById('contactsList');
  const contactsEmpty = document.getElementById('contactsEmpty');

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { 'Content-Type':'application/json', ...authHeader() }});
    } catch(e){}
    localStorage.removeItem('chat_token');
    window.location.href = '/index.html';
  });

  addContactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(addContactAlert);
    const email = document.getElementById('contactEmail').value.trim();
    if(!email) {
      showAlert(addContactAlert, 'Enter a valid email.', 'warning');
      return;
    }
    const btn = document.getElementById('addContactBtn');
    btn.disabled = true;
    btn.textContent = 'Adding...';
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ contactEmail: email })
      });
      if(res.status === 201){
        showAlert(addContactAlert, 'Contact request sent.', 'success');
        addContactForm.reset();
        await loadContacts();
      } else if(res.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        const d = await res.json().catch(()=>({message:'Failed to add contact'}));
        showAlert(addContactAlert, d.message || 'Failed to add contact', 'warning');
      }
    } catch(err){
      showAlert(addContactAlert, 'Network error');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add contact';
    }
  });

  async function loadContacts(){
    contactsList.innerHTML = '';
    contactsEmpty.classList.add('d-none');
    try {
      const res = await fetch(`${API_BASE}/contacts`, { headers: { 'Content-Type':'application/json', ...authHeader() }});
      if(res.status === 200){
        const contacts = await res.json();
        if(!Array.isArray(contacts) || contacts.length === 0){
          contactsEmpty.classList.remove('d-none');
          return;
        }
        contacts.forEach(c => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-start';
          const user = c.contactId || {};
          const title = user.username || user.email || 'Unknown';
          const status = c.status || '';
          li.innerHTML = `
            <div>
              <div class="fw-semibold">${escapeHtml(title)}</div>
              <div class="small text-muted">${escapeHtml(user.email || '')} ${status ? ' • ' + escapeHtml(status) : ''}</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success startChatBtn">Chat</button>
              <button class="btn btn-sm btn-outline-danger deleteContactBtn">Remove</button>
            </div>
          `;
          // start chat
          li.querySelector('.startChatBtn').addEventListener('click', async () => {
            const btn = li.querySelector('.startChatBtn');
            btn.disabled = true;
            btn.textContent = 'Opening...';
            try {
              const r = await fetch(`${API_BASE}/chats`, {
                method: 'POST',
                headers: { 'Content-Type':'application/json', ...authHeader() },
                body: JSON.stringify({ contactId: c._id })
              });
              if(r.status === 201 || r.status === 200){
                // go to chats page and refresh
                window.location.href = '/chats.html';
              } else if(r.status === 401){
                localStorage.removeItem('chat_token'); window.location.href = '/index.html';
              } else {
                const d = await r.json().catch(()=>({message:'Failed to open chat'}));
                showAlert(addContactAlert, d.message || 'Failed to open chat', 'warning');
              }
            } catch(err){
              showAlert(addContactAlert, 'Network error');
              console.error(err);
            } finally {
              btn.disabled = false;
              btn.textContent = 'Chat';
            }
          });

          // delete contact
          li.querySelector('.deleteContactBtn').addEventListener('click', async () => {
            const btn = li.querySelector('.deleteContactBtn');
            if(!confirm('Remove this contact?')) return;
            btn.disabled = true;
            btn.textContent = 'Removing...';
            try {
              const r = await fetch(`${API_BASE}/contacts/${c._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type':'application/json', ...authHeader() },
              });
              if(r.status === 200){
                await loadContacts();
              } else if(r.status === 401){
                localStorage.removeItem('chat_token'); window.location.href = '/index.html';
              } else {
                const d = await r.json().catch(()=>({message:'Failed to remove contact'}));
                showAlert(addContactAlert, d.message || 'Failed to remove contact', 'warning');
                btn.disabled = false;
                btn.textContent = 'Remove';
              }
            } catch(err){
              showAlert(addContactAlert, 'Network error');
              console.error(err);
              btn.disabled = false;
              btn.textContent = 'Remove';
            }
          });

          contactsList.appendChild(li);
        });
      } else if(res.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        contactsEmpty.classList.remove('d-none');
      }
    } catch(err){
      contactsEmpty.classList.remove('d-none');
      console.error(err);
    }
  }

  await loadContacts();
})();
