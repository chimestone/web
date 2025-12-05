// 动画效果控制
var iUp = (function () {
    var time = 0,
        duration = 150,
        clean = function () {
            time = 0;
        },
        up = function (element) {
            setTimeout(function () {
                element.classList.add("up");
            }, time);
            time += duration;
        },
        down = function (element) {
            element.classList.remove("up");
        },
        toggle = function (element) {
            setTimeout(function () {
                element.classList.toggle("up");
            }, time);
            time += duration;
        };
    return {
        clean: clean,
        up: up,
        down: down,
        toggle: toggle
    };
})();

// 笔记管理
class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.init();
    }

    init() {
        this.renderNotes();
        this.bindEvents();
        this.loadRecentNotes();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-note-btn');
        const saveBtn = document.getElementById('save-note');
        const cancelBtn = document.getElementById('cancel-note');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.showNoteForm());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNote());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideNoteForm());
        }
    }

    showNoteForm() {
        const form = document.getElementById('note-form');
        if (form) {
            form.style.display = 'block';
            document.getElementById('note-title').focus();
        }
    }

    hideNoteForm() {
        const form = document.getElementById('note-form');
        if (form) {
            form.style.display = 'none';
            this.clearForm();
        }
    }

    clearForm() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
    }

    saveNote() {
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
            date: new Date().toLocaleDateString('zh-CN')
        };

        this.notes.unshift(note);
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.renderNotes();
        this.hideNoteForm();
        this.loadRecentNotes();
    }

    deleteNote(id) {
        if (confirm('确定要删除这篇笔记吗？')) {
            this.notes = this.notes.filter(note => note.id !== id);
            localStorage.setItem('notes', JSON.stringify(this.notes));
            this.renderNotes();
            this.loadRecentNotes();
        }
    }

    renderNotes() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        if (this.notes.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: #666;">暂无笔记，点击上方按钮创建第一篇笔记</p>';
            return;
        }

        notesList.innerHTML = this.notes.map(note => `
            <div class="note-card">
                <h4>${this.escapeHtml(note.title)}</h4>
                <p class="note-date">${note.date}</p>
                <p class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                <div class="note-actions">
                    <button onclick="notesManager.deleteNote(${note.id})" class="delete-btn">删除</button>
                </div>
            </div>
        `).join('');
    }

    loadRecentNotes() {
        const recentList = document.getElementById('recent-notes-list');
        if (!recentList) return;

        const recentNotes = this.notes.slice(0, 3);
        
        if (recentNotes.length === 0) {
            recentList.innerHTML = '<p>暂无笔记，<a href="notes.html">去创建第一篇笔记</a></p>';
            return;
        }

        recentList.innerHTML = recentNotes.map(note => `
            <div class="note-card">
                <h4>${this.escapeHtml(note.title)}</h4>
                <p class="note-date">${note.date}</p>
                <p class="note-preview">${this.escapeHtml(note.content.substring(0, 80))}${note.content.length > 80 ? '...' : ''}</p>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Bing壁纸功能
var BING_IMAGE_URL_PATTERN = /^\/th\?id=OHR\.[a-zA-Z0-9_\-]+\.jpg(&[a-zA-Z0-9=._\-]+)*$/;

function getBingImages(imgUrls) {
    var panel = document.querySelector('#panel');
    if (!panel || !imgUrls || !Array.isArray(imgUrls) || imgUrls.length === 0) {
        return;
    }
    
    var indexName = "bing-image-index";
    var index = parseInt(sessionStorage.getItem(indexName), 10);
    var maxIndex = imgUrls.length - 1;
    
    if (isNaN(index) || index > maxIndex) {
        index = 0;
    } else {
        index++;
        if (index > maxIndex) {
            index = 0;
        }
    }
    
    var imgUrl = imgUrls[index];
    if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.match(BING_IMAGE_URL_PATTERN)) {
        return;
    }
    
    var url = "https://www.cn.bing.com" + imgUrl;
    panel.style.backgroundImage = "url('" + url.replace(/['\\]/g, '\\$&') + "')";
    panel.style.backgroundPosition = "center center";
    panel.style.backgroundRepeat = "no-repeat";
    panel.style.backgroundColor = "#666";
    panel.style.backgroundSize = "cover";
    sessionStorage.setItem(indexName, index);
}

// 一言API获取
function loadHitokoto() {
    fetch("https://v1.hitokoto.cn")
        .then(response => response.json())
        .then(res => {
            const descElement = document.getElementById('description');
            if (descElement && res.hitokoto && res.from) {
                const textNode = document.createTextNode(res.hitokoto);
                const br = document.createElement('br');
                const fromText = document.createTextNode(' -「');
                const strong = document.createElement('strong');
                strong.textContent = res.from;
                const endText = document.createTextNode('」');
                
                descElement.innerHTML = '';
                descElement.appendChild(textNode);
                descElement.appendChild(br);
                descElement.appendChild(fromText);
                descElement.appendChild(strong);
                descElement.appendChild(endText);
            }
        })
        .catch(error => {
            console.error('Error fetching hitokoto:', error);
        });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 初始化动画
    const iUpElements = document.querySelectorAll(".iUp");
    for (let i = 0; i < iUpElements.length; i++) {
        iUp.up(iUpElements[i]);
    }

    // 初始化笔记管理器
    window.notesManager = new NotesManager();

    // 加载一言（如果页面有相应元素）
    if (document.getElementById('description')) {
        loadHitokoto();
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// 导出给全局使用
window.iUp = iUp;