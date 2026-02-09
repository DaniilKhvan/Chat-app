const API_BASE = 'http://localhost:3000/api';

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

function formatDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

let selectedChat = null;
let pollInterval = null;
let reactionsCache = {}; 

(async function init(){
  const token = localStorage.getItem('chat_token');
  if(!token){ window.location.href = '/index.html'; return; }

  const chatsListEl = document.getElementById('chatsList');
  const chatsEmptyEl = document.getElementById('chatsEmpty');
  const messagesListEl = document.getElementById('messagesList');
  const emptyPreviewEl = document.getElementById('emptyPreview');
  const messageActionsEl = document.getElementById('messageActions');
  const messageInputEl = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendMsgBtn');
  const chatHeaderEl = document.getElementById('chatHeader');
  const chatTitleEl = document.getElementById('chatTitle');
  const chatSubtitleEl = document.getElementById('chatSubtitle');
  const deleteChatBtn = document.getElementById('deleteChatBtn');
  const refreshChatBtn = document.getElementById('refreshChatBtn');
  const emojiPicker = document.getElementById('emojiPicker');

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeader() } }); } catch(e){}
    localStorage.removeItem('chat_token'); window.location.href = '/index.html';
  });

  document.getElementById('newChatBtn').addEventListener('click', () => {
    window.location.href = '/contacts.html';
  });

  refreshChatBtn?.addEventListener('click', async () => {
    if(selectedChat) await loadMessages(selectedChat._id, true);
  });

  deleteChatBtn?.addEventListener('click', async () => {
    if(!selectedChat) return;
    if(!confirm('Delete this chat and its messages?')) return;
    try {
      const res = await fetch(`${API_BASE}/chats/${selectedChat._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json', ...authHeader() }
      });
      if(res.status === 200){
        selectedChat = null;
        clearChatView();
        await loadChats();
      } else if(res.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        alert('Failed to delete chat');
      }
    } catch(err){
      console.error(err);
      alert('Network error');
    }
  });

  sendBtn.addEventListener('click', async () => {
    const text = messageInputEl.value.trim();
    if(!text || !selectedChat) return;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    try {
      const r = await fetch(`${API_BASE}/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', ...authHeader() },
        body: JSON.stringify({ text })
      });
      if(r.status === 201){
        messageInputEl.value = '';
        await loadMessages(selectedChat._id, true);
      } else if(r.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        const d = await r.json().catch(()=>({message:'Failed to send'}));
        alert(d.message || 'Failed to send message');
      }
    } catch(err){
      console.error(err);
      alert('Network error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send';
    }
  });

  messageInputEl.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendBtn.click();
    }
  });

  function clearChatView(){
    chatHeaderEl.classList.add('d-none');
    emptyPreviewEl.classList.remove('d-none');
    messagesListEl.innerHTML = '';
    messageActionsEl.classList.add('d-none');
    reactionsCache = {};
    if(pollInterval){ clearInterval(pollInterval); pollInterval = null; }
  }

  async function loadChats(){
    chatsListEl.innerHTML = '';
    chatsEmptyEl.classList.add('d-none');
    try {
      const res = await fetch(`${API_BASE}/chats`, { headers: { 'Content-Type':'application/json', ...authHeader() }});
      if(res.status === 200){
        const chats = await res.json();
        if(!Array.isArray(chats) || chats.length === 0){
          chatsEmptyEl.classList.remove('d-none');
          return;
        }
        chats.forEach(chat => {
          const title = chat.title || (chat.participants && chat.participants.length ? (chat.participants.map(p => p.userId?.username || p.userId?.email).join(', ')) : 'Private chat');
          const last = chat.lastMessageAt ? formatDate(chat.lastMessageAt) : (chat.createdAt ? formatDate(chat.createdAt) : '');
          const li = document.createElement('li');
          li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
          li.dataset.search = (title + ' ' + last).toLowerCase();
          li.innerHTML = `
            <div class="ms-2 me-auto">
              <div class="fw-semibold small">${escapeHtml(title)}</div>
              <div class="small text-muted mt-1">${escapeHtml(last)}</div>
            </div>
            <div class="text-end small text-muted">${escapeHtml(chat.type ?? '')}</div>
          `;
          li.addEventListener('click', () => openChat(chat));
          chatsListEl.appendChild(li);
        });
      } else if(res.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        chatsEmptyEl.classList.remove('d-none');
      }
    } catch(err){
      chatsEmptyEl.classList.remove('d-none');
      console.error(err);
    }
  }

  async function openChat(chat){
    selectedChat = chat;
    chatHeaderEl.classList.remove('d-none');
    emptyPreviewEl.classList.add('d-none');
    messageActionsEl.classList.remove('d-none');
    chatTitleEl.textContent = chat.title || (chat.participants && chat.participants.length ? (chat.participants.map(p => p.userId?.username || p.userId?.email).join(', ')) : 'Private chat');
    chatSubtitleEl.textContent = chat.participants ? (chat.participants.map(p => p.userId?.email || p.userId?.username).join(', ')) : '';
    await loadMessages(chat._id, true);
    if(pollInterval) clearInterval(pollInterval);
  }

  async function loadMessages(chatId, scrollToBottom){
    messagesListEl.innerHTML = '';
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, { headers: { 'Content-Type':'application/json', ...authHeader() }});
      if(res.status === 200){
        const messages = await res.json();
        for(const msg of messages){
          await renderMessage(msg);
        }
        if(scrollToBottom) messagesListEl.scrollTop = messagesListEl.scrollHeight;
      } else if(res.status === 401){
        localStorage.removeItem('chat_token'); window.location.href = '/index.html';
      } else {
        messagesListEl.innerHTML = '<div class="text-center text-muted">Cannot load messages.</div>';
      }
    } catch(err){
      console.error(err);
      messagesListEl.innerHTML = '<div class="text-center text-muted">Network error.</div>';
    }
  }

  async function renderMessage(msg){
    const row = document.createElement('div');
    row.className = 'msg-row';

    const isMe = (() => {
        try {
            const t = localStorage.getItem('chat_token');
            if(!t) return false;
            const parts = t.split('.');
            if(parts.length !== 3) return false;
            const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
            return (payload.sub === (msg.senderId?._id || msg.senderId));
        } catch(e){ return false; }
    })();

    const msgWrap = document.createElement('div');
    msgWrap.className = 'message ' + (isMe ? 'me' : 'their');
    msgWrap.dataset.messageId = msg._id;

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.innerHTML = escapeHtml(msg.text || '');

    const metaEl = document.createElement('div');
    metaEl.className = 'msg-meta mt-1';
    metaEl.textContent = (msg.senderId && msg.senderId.username ? msg.senderId.username : '') + (msg.createdAt ? ' • ' + formatDate(msg.createdAt) : '');

    const controls = document.createElement('div');
    controls.className = 'message-controls';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-secondary';
    editBtn.textContent = 'Edit';
    editBtn.title = 'Edit message';
    editBtn.addEventListener('click', () => beginEditMessage(msg, textEl));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-outline-danger';
    delBtn.textContent = 'Delete';
    delBtn.title = 'Delete message';
    delBtn.addEventListener('click', () => deleteMessage(msg));

    const reactBtn = document.createElement('button');
    reactBtn.className = 'btn btn-sm btn-outline-info';
    reactBtn.textContent = 'React';
    reactBtn.title = 'Add reaction';
    reactBtn.addEventListener('click', (e) => showEmojiPicker(e, msg));

    controls.appendChild(reactBtn);
    controls.appendChild(editBtn);
    controls.appendChild(delBtn);

    msgWrap.appendChild(textEl);
    msgWrap.appendChild(metaEl);

    const reactionsEl = document.createElement('div');
    reactionsEl.className = 'reactions';
    reactionsEl.dataset.msgId = msg._id;
    msgWrap.appendChild(reactionsEl);

    row.appendChild(msgWrap);
    row.appendChild(controls);
    messagesListEl.appendChild(row);

    msgWrap.addEventListener('dblclick', () => beginEditMessage(msg, textEl));

    setTimeout(() => loadReactions(msg._id), 0);
}

  async function loadReactions(messageId){
  reactionsCache[messageId] = [];
  try {
    const res = await fetch(`${API_BASE}/messages/${messageId}/reactions`, { 
      headers: { 'Content-Type':'application/json', ...authHeader() } 
    });
    
    if(res.status === 200){
      const data = await res.json();
      
      if (Array.isArray(data)) {
        reactionsCache[messageId] = data;
      } else if (data && typeof data === 'object') {
        reactionsCache[messageId] = Object.values(data);
      } else {
        reactionsCache[messageId] = [];
      }
      
      renderReactionsUI(messageId);
    } else if(res.status === 401){
      localStorage.removeItem('chat_token'); 
      window.location.href = '/index.html';
    }
  } catch(err){
    console.error('Error loading reactions:', err);
    reactionsCache[messageId] = [];
  }
}

  function renderReactionsUI(messageId){
    const container = document.querySelector(`.reactions[data-msg-id="${messageId}"]`);
    if(!container) return;
    container.innerHTML = '';
    const arr = reactionsCache[messageId] || [];
    for(const r of arr){
      const btn = document.createElement('span');
      btn.className = 'reaction-badge' + (r.reacted ? ' react-active' : '');
      btn.textContent = `${r.emoji} ${r.count ?? ''}`.trim();
      btn.dataset.reactionId = r._id || r.emoji; 
      btn.addEventListener('click', async () => {
        if(r.reacted){
          try {
            const id = r._id || r.emoji;
            const del = await fetch(`${API_BASE}/messages/${messageId}/reactions/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type':'application/json', ...authHeader() }
            });
            if(del.status === 200){
              await loadReactions(messageId);
            } else if(del.status === 401){ localStorage.removeItem('chat_token'); window.location.href = '/index.html'; }
            else { alert('Failed to remove reaction'); }
          } catch(err){ console.error(err); alert('Network error'); }
        } else {
          try {
            const add = await fetch(`${API_BASE}/messages/${messageId}/reactions`, {
              method: 'POST',
              headers: { 'Content-Type':'application/json', ...authHeader() },
              body: JSON.stringify({ emoji: r.emoji })
            });
            if(add.status === 201){ await loadReactions(messageId); }
            else if(add.status === 409){
              await loadReactions(messageId);
            } else if(add.status === 401){ localStorage.removeItem('chat_token'); window.location.href = '/index.html'; }
            else { alert('Failed to add reaction'); }
          } catch(err){ console.error(err); alert('Network error'); }
        }
      });
      container.appendChild(btn);
    }
  }

  function showEmojiPicker(e, msg){
  const picker = emojiPicker;
  picker.style.display = 'block';
  picker.style.left = (e.pageX + 8) + 'px';
  picker.style.top = (e.pageY + 8) + 'px';
  
  const btns = picker.querySelectorAll('.emojiBtn');
  btns.forEach(b => b.onclick = null);
  
  btns.forEach(b => {
    const handler = async () => {
      const emoji = b.textContent.trim();
      
      if(emoji === '❌'){ 
        picker.style.display='none'; 
        return; 
      }
      
      try {
        const res = await fetch(`${API_BASE}/messages/${msg._id}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', ...authHeader() },
          body: JSON.stringify({ emoji })
        });
        
        if(res.status === 201){
          await loadReactions(msg._id);
        } else if(res.status === 409){
          await loadReactions(msg._id);
        } else if(res.status === 401){ 
          localStorage.removeItem('chat_token'); 
          window.location.href = '/index.html'; 
        } else {
          const error = await res.json().catch(() => ({message: 'Unknown error'}));
          alert(`Failed to add reaction: ${error.message}`);
        }
      } catch(err){
        console.error(err); 
        alert('Network error');
      } finally {
        picker.style.display = 'none';
      }
    };
    
    b.onclick = handler;
  });
  
  const closer = (ev) => {
    if(!picker.contains(ev.target)) {
      picker.style.display = 'none';
      document.removeEventListener('click', closer);
    }
  };
  
  setTimeout(() => document.addEventListener('click', closer), 10);
}
  function beginEditMessage(msg, textEl){
    const orig = msg.text || '';
    const input = document.createElement('textarea');
    input.value = orig;
    input.className = 'form-control';
    input.rows = 2;
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-primary mt-2';
    saveBtn.textContent = 'Save';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-sm btn-outline-secondary mt-2 ms-2';
    cancelBtn.textContent = 'Cancel';

    textEl.style.display = 'none';
    textEl.parentElement.appendChild(input);
    textEl.parentElement.appendChild(saveBtn);
    textEl.parentElement.appendChild(cancelBtn);
    input.focus();

    cancelBtn.addEventListener('click', () => {
      input.remove(); saveBtn.remove(); cancelBtn.remove(); textEl.style.display = '';
    });

    saveBtn.addEventListener('click', async () => {
      const newText = input.value.trim();
      if(newText === orig){ cancelBtn.click(); return; }
      saveBtn.disabled = true; saveBtn.textContent = 'Saving...';
      try {
        const res = await fetch(`${API_BASE}/messages/${msg._id}`, {
          method: 'PUT',
          headers: { 'Content-Type':'application/json', ...authHeader() },
          body: JSON.stringify({ text: newText })
        });
        if(res.status === 200){
          textEl.innerHTML = escapeHtml(newText) + ' <span class="small text-muted">(edited)</span>';
        } else if(res.status === 401){ localStorage.removeItem('chat_token'); window.location.href = '/index.html'; }
        else {
          const d = await res.json().catch(()=>({message:'Failed to update'}));
          alert(d.message || 'Failed to update message');
        }
      } catch(err){
        console.error(err); alert('Network error');
      } finally {
        input.remove(); saveBtn.remove(); cancelBtn.remove(); textEl.style.display = '';
      }
    });
  }

  async function deleteMessage(msg){
    if(!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API_BASE}/messages/${msg._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json', ...authHeader() }
      });
      if(res.status === 200){
        await loadMessages(selectedChat._id, true);
      } else if(res.status === 401){ localStorage.removeItem('chat_token'); window.location.href = '/index.html'; }
      else {
        const d = await res.json().catch(()=>({message:'Failed to delete'}));
        alert(d.message || 'Failed to delete');
      }
    } catch(err){
      console.error(err); alert('Network error');
    }
  }

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    Array.from(chatsListEl.children).forEach(li => {
      const text = li.dataset.search || '';
      li.style.display = text.includes(q) ? '' : 'none';
    });
  });

  clearChatView();
  await loadChats();
})();
