// 笔记管理功能
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('notes.html')) {
        displayNotes();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        displayRecentNotes();
    }
});

// 添加笔记
function addNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleString('zh-CN')
    };
    
    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // 清空表单
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    
    displayNotes();
}

// 删除笔记
function deleteNote(id) {
    if (confirm('确定要删除这篇笔记吗？')) {
        notes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
    }
}

// 显示所有笔记
function displayNotes() {
    const container = document.getElementById('notes-container');
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p>暂无笔记</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="note-item">
            <h4>${note.title}</h4>
            <div class="note-date">${note.date}</div>
            <div class="note-content">${note.content}</div>
            <button class="delete-btn" onclick="deleteNote(${note.id})">删除</button>
        </div>
    `).join('');
}

// 在主页显示最近的笔记
function displayRecentNotes() {
    const container = document.getElementById('recent-notes-list');
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p>暂无笔记，<a href="notes.html">去创建第一篇笔记</a></p>';
        return;
    }
    
    const recentNotes = notes.slice(0, 3);
    container.innerHTML = recentNotes.map(note => `
        <div class="note-item">
            <h4>${note.title}</h4>
            <div class="note-date">${note.date}</div>
            <div class="note-content">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
        </div>
    `).join('') + '<p><a href="notes.html">查看所有笔记</a></p>';
}