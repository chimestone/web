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
        this.folders = JSON.parse(localStorage.getItem('folders')) || [];
        this.init();
    }

    init() {
        this.renderNotes();
        this.bindEvents();
        this.loadRecentNotes();
        this.updateFolderSelect();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-note-btn');
        const saveBtn = document.getElementById('save-note');
        const cancelBtn = document.getElementById('cancel-note');
        const addFolderBtn = document.getElementById('add-folder-btn');
        const saveFolderBtn = document.getElementById('save-folder');
        const cancelFolderBtn = document.getElementById('cancel-folder');
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => this.showNoteForm());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNote());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideNoteForm());
        }
        if (addFolderBtn) {
            addFolderBtn.addEventListener('click', () => this.showFolderForm());
        }
        if (saveFolderBtn) {
            saveFolderBtn.addEventListener('click', () => this.saveFolder());
        }
        if (cancelFolderBtn) {
            cancelFolderBtn.addEventListener('click', () => this.hideFolderForm());
        }
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => fileInput.click());
        }
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    showNoteForm() {
        this.hideAllForms();
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

    showFolderForm() {
        this.hideAllForms();
        const form = document.getElementById('folder-form');
        if (form) {
            form.style.display = 'block';
            document.getElementById('folder-name').focus();
        }
    }

    hideFolderForm() {
        const form = document.getElementById('folder-form');
        if (form) {
            form.style.display = 'none';
            document.getElementById('folder-name').value = '';
        }
    }

    hideAllForms() {
        this.hideNoteForm();
        this.hideFolderForm();
    }

    clearForm() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        document.getElementById('folder-select').value = '';
    }

    saveNote() {
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        const folder = document.getElementById('folder-select').value;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const note = {
            id: Date.now(),
            title: title,
            content: content,
            folder: folder,
            date: new Date().toLocaleDateString('zh-CN')
        };

        this.notes.unshift(note);
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.renderNotes();
        this.hideNoteForm();
        this.loadRecentNotes();
    }

    saveFolder() {
        const name = document.getElementById('folder-name').value.trim();
        if (!name) {
            alert('请输入文件夹名称');
            return;
        }

        if (this.folders.includes(name)) {
            alert('文件夹已存在');
            return;
        }

        this.folders.push(name);
        localStorage.setItem('folders', JSON.stringify(this.folders));
        this.updateFolderSelect();
        this.hideFolderForm();
        this.renderNotes();
    }

    updateFolderSelect() {
        const select = document.getElementById('folder-select');
        if (!select) return;

        select.innerHTML = '<option value="">选择文件夹（可选）</option>';
        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            select.appendChild(option);
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(md|markdown)$/i)) {
            alert('请选择markdown文件（.md或.markdown）');
            return;
        }

        try {
            const content = await this.readFileContent(file);
            const title = file.name.replace(/\.(md|markdown)$/i, '');
            
            // 自动填充表单
            this.showNoteForm();
            document.getElementById('note-title').value = title;
            document.getElementById('note-content').value = content;
        } catch (error) {
            alert('读取文件失败: ' + error.message);
        }
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    async fetchMarkdownContent(url) {
        console.log('原始URL:', url);
        
        // 将GitHub URL转换为raw URL
        let rawUrl = url;
        if (url.includes('github.com') && url.includes('/blob/')) {
            rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        
        console.log('Raw URL:', rawUrl);

        // 尝试多种方法读取文件
        const methods = [
            () => this.fetchDirect(rawUrl),
            () => this.fetchWithProxy(rawUrl),
            () => this.fetchPrivateMarkdown(url)
        ];

        for (let i = 0; i < methods.length; i++) {
            try {
                console.log(`尝试方法 ${i + 1}...`);
                const result = await methods[i]();
                if (result) {
                    console.log('成功读取文件');
                    return result;
                }
            } catch (error) {
                console.log(`方法 ${i + 1} 失败:`, error.message);
            }
        }
        
        throw new Error('所有方法都失败了');
    }

    async fetchDirect(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }

    async fetchWithProxy(url) {
        // 使用CORS代理
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Proxy error! status: ${response.status}`);
        }
        return await response.text();
    }

    async fetchPrivateMarkdown(url) {
        // 提取仓库信息
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
        if (!match) {
            throw new Error('无效的GitHub URL格式');
        }

        const [, owner, repo, branch, path] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

        // 这里需要你的GitHub token（可选）
        const token = localStorage.getItem('github-token');
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API error! status: ${response.status}`);
        }

        const data = await response.json();
        return atob(data.content.replace(/\s/g, ''));
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

        // 按文件夹分组显示
        const groupedNotes = this.groupNotesByFolder();
        let html = '';
        
        Object.keys(groupedNotes).forEach(folder => {
            if (folder) {
                html += `<div class="folder-header">📁 ${this.escapeHtml(folder)}</div>`;
            }
            
            groupedNotes[folder].forEach(note => {
                html += `
                    <div class="note-card">
                        <h4>${this.escapeHtml(note.title)}</h4>
                        <p class="note-date">${note.date}</p>
                        <p class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                        <div class="note-actions">
                            <button onclick="notesManager.deleteNote(${note.id})" class="delete-btn">删除</button>
                        </div>
                    </div>
                `;
            });
        });
        
        notesList.innerHTML = html;
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

    groupNotesByFolder() {
        const grouped = { '': [] }; // 默认分组（无文件夹）
        
        this.notes.forEach(note => {
            const folder = note.folder || '';
            if (!grouped[folder]) {
                grouped[folder] = [];
            }
            grouped[folder].push(note);
        });
        
        return grouped;
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