/* ========================================
   骗子酒馆 · 开枪模拟器 — 游戏逻辑
   ======================================== */

// 玩家颜色
var PLAYER_COLORS = [
    '#e74c3c', // 红
    '#3498db', // 蓝
    '#2ecc71', // 绿
    '#f39c12', // 橙
    '#9b59b6', // 紫
    '#1abc9c', // 青
];

var PLAYER_EMOJI = ['😎', '🤠', '😈', '🃏', '👻', '🎭'];

// ---- 游戏状态 ----
var game = {
    players: [],
    selectedPlayerId: null,
    round: 1,
    history: [],
    isAnimating: false,
};

// ---- 工具函数 ----
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRevolver() {
    return {
        livePosition: randomInt(1, 6),
        currentChamber: 0,
        shotsFired: 0,
    };
}

// ---- DOM 引用 ----
var $ = function (id) { return document.getElementById(id); };

// ---- 初始化 ----
function init() {
    showScreen('setup-screen');
    renderNameInputs(3); // 默认3人
    bindSetupEvents();
    bindGameEvents();
    bindResultEvents();
}

// ---- 页面切换 ----
function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = $(screenId);
    if (target) target.classList.add('active');
    // 隐藏开枪结果弹窗
    var overlay = $('shot-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ========================================
//  设置页
// ========================================

function bindSetupEvents() {
    // 人数选择
    var countBtns = document.querySelectorAll('.count-btn');
    for (var i = 0; i < countBtns.length; i++) {
        countBtns[i].addEventListener('click', function () {
            var count = parseInt(this.getAttribute('data-count'), 10);
            // 更新激活状态
            for (var j = 0; j < countBtns.length; j++) {
                countBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            renderNameInputs(count);
        });
    }

    // 开始游戏
    $('btn-start').addEventListener('click', startGame);
}

function renderNameInputs(count) {
    var container = $('name-inputs');
    container.innerHTML = '';

    for (var i = 0; i < count; i++) {
        var row = document.createElement('div');
        row.className = 'name-input-row';

        var avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.style.background = PLAYER_COLORS[i];
        avatar.textContent = PLAYER_EMOJI[i];

        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '玩家 ' + (i + 1) + ' 名字';
        input.value = '玩家' + (i + 1);
        input.setAttribute('data-index', i);

        row.appendChild(avatar);
        row.appendChild(input);
        container.appendChild(row);
    }
}

function startGame() {
    var inputs = document.querySelectorAll('#name-inputs input');
    var names = [];
    for (var i = 0; i < inputs.length; i++) {
        var name = inputs[i].value.trim();
        if (!name) {
            name = '玩家' + (i + 1);
        }
        names.push(name);
    }

    // 初始化游戏状态
    game.players = [];
    for (var i = 0; i < names.length; i++) {
        game.players.push({
            id: i,
            name: names[i],
            color: PLAYER_COLORS[i],
            emoji: PLAYER_EMOJI[i],
            alive: true,
            revolver: createRevolver(),
            totalShots: 0,
        });
    }
    game.selectedPlayerId = null;
    game.round = 1;
    game.history = [];
    game.isAnimating = false;

    showScreen('game-screen');
    renderGame();
}

// ========================================
//  游戏页
// ========================================

function bindGameEvents() {
    $('btn-shoot').addEventListener('click', executeShot);
    $('btn-continue').addEventListener('click', hideShotOverlay);
}

function renderGame() {
    renderPlayers();
    renderShootButton();
    renderHistory();
    updateRoundInfo();
}

function renderPlayers() {
    var area = $('players-area');
    area.innerHTML = '';

    for (var i = 0; i < game.players.length; i++) {
        var p = game.players[i];
        var card = document.createElement('div');
        card.className = 'player-card';
        if (!p.alive) {
            card.className += ' dead';
        }
        if (game.selectedPlayerId === p.id) {
            card.className += ' selected';
        }
        card.setAttribute('data-player-id', p.id);

        // 头像
        var avatar = document.createElement('div');
        avatar.className = 'card-avatar';
        avatar.style.background = p.alive ? p.color : '#555';
        avatar.textContent = p.emoji;

        // 名字
        var name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = p.name;

        // 状态
        var status = document.createElement('div');
        if (p.alive) {
            status.className = 'card-status alive';
            status.textContent = '存活';
        } else {
            status.className = 'card-status dead-label';
            status.textContent = '💀 淘汰';
        }

        // 弹巢指示器
        var chamberDiv = document.createElement('div');
        chamberDiv.className = 'chamber-indicator';
        if (p.alive) {
            for (var c = 1; c <= 6; c++) {
                var dot = document.createElement('div');
                dot.className = 'chamber-dot';
                if (c <= p.revolver.currentChamber) {
                    dot.classList.add('spent');
                }
                if (c === p.revolver.currentChamber + 1 && c <= 6) {
                    dot.classList.add('current');
                }
                chamberDiv.appendChild(dot);
            }
        } else {
            // 已淘汰：全部灰掉
            for (var c = 1; c <= 6; c++) {
                var dot = document.createElement('div');
                dot.className = 'chamber-dot spent';
                chamberDiv.appendChild(dot);
            }
        }

        // 危险度进度条
        var dangerBar = document.createElement('div');
        dangerBar.className = 'danger-bar';
        var fill = document.createElement('div');
        fill.className = 'danger-bar-fill';
        if (p.alive) {
            var pct = (p.revolver.currentChamber / 6) * 100;
            fill.style.width = pct + '%';
            if (pct >= 67) {
                fill.classList.add('high');
            } else if (pct >= 34) {
                fill.classList.add('medium');
            }
        } else {
            fill.style.width = '100%';
            fill.classList.add('high');
        }
        dangerBar.appendChild(fill);

        card.appendChild(avatar);
        card.appendChild(name);
        card.appendChild(status);
        card.appendChild(chamberDiv);
        card.appendChild(dangerBar);

        // 点击事件（selectPlayer 内部有 isAnimating 守卫，这里不需要额外判断）
        if (p.alive) {
            card.addEventListener('click', function () {
                var pid = parseInt(this.getAttribute('data-player-id'), 10);
                selectPlayer(pid);
            });
        }

        area.appendChild(card);
    }
}

function selectPlayer(id) {
    if (game.isAnimating) return;
    var player = game.players[id];
    if (!player || !player.alive) return;

    game.selectedPlayerId = id;
    renderPlayers();
    renderShootButton();
}

function renderShootButton() {
    var btn = $('btn-shoot');
    var hint = $('shoot-hint');
    if (game.selectedPlayerId !== null) {
        var p = game.players[game.selectedPlayerId];
        btn.disabled = false;
        btn.textContent = '🔫 ' + p.name + ' 开枪！';
        hint.style.display = 'none';
    } else {
        btn.disabled = true;
        btn.textContent = '选择玩家后开枪';
        hint.style.display = 'block';
    }
}

function updateRoundInfo() {
    var titleEl = document.querySelector('.gs-nav-title');
    if (titleEl) {
        titleEl.textContent = '第 ' + game.round + ' 回合';
    }
}

// ---- 开枪执行 ----
function executeShot() {
    if (game.isAnimating) return;
    if (game.selectedPlayerId === null) return;

    game.isAnimating = true;
    var player = game.players[game.selectedPlayerId];

    // 推进弹巢
    player.revolver.currentChamber++;
    player.revolver.shotsFired++;
    player.totalShots++;

    var isLive = player.revolver.currentChamber === player.revolver.livePosition;
    var remainingChambers = 6 - player.revolver.currentChamber;

    // 播放动画
    animateRevolver(function () {
        if (isLive) {
            // 实弹！
            player.alive = false;
            triggerBloodEffect();
        }

        // 记录
        game.history.push({
            playerId: player.id,
            playerName: player.name,
            playerColor: player.color,
            isLive: isLive,
            shotNumber: player.revolver.shotsFired,
            remainingChambers: remainingChambers,
        });

        // 更新 UI
        renderPlayers();
        renderHistory();
        updateRoundInfo();

        // 检查是否游戏结束
        var aliveCount = 0;
        var lastAlive = null;
        for (var i = 0; i < game.players.length; i++) {
            if (game.players[i].alive) {
                aliveCount++;
                lastAlive = game.players[i];
            }
        }

        if (aliveCount <= 1) {
            // 游戏结束，延迟跳结算
            setTimeout(function () {
                showResult(lastAlive);
            }, isLive ? 1200 : 600);
            // 游戏结束时也显示结果弹窗，然后自动跳转
            showShotResult(player, isLive, remainingChambers, true);
        } else if (isLive) {
            // 有人淘汰，进入新回合，重新装填
            game.round++;
            for (var i = 0; i < game.players.length; i++) {
                if (game.players[i].alive) {
                    game.players[i].revolver = createRevolver();
                }
            }
            game.selectedPlayerId = null;
            game.isAnimating = false;
            showShotResult(player, isLive, remainingChambers, false);
            setTimeout(function () {
                renderPlayers();
                renderShootButton();
            }, 400);
        } else {
            // 空弹，继续
            game.selectedPlayerId = null;
            game.isAnimating = false;
            renderPlayers();
            renderShootButton();
            showShotResult(player, isLive, remainingChambers, false);
        }
    });
}

// ---- 开枪动画 ----
function animateRevolver(callback) {
    var cylinder = document.querySelector('.rev-cylinder-group');
    var hammer = document.querySelector('.rev-hammer');
    var revolver = document.querySelector('.revolver');
    var flash = $('muzzle-flash');

    // 阶段1：击锤后拉
    if (hammer) hammer.classList.add('cocked');

    setTimeout(function () {
        // 阶段2：弹巢旋转
        if (cylinder) cylinder.classList.add('spinning');

        setTimeout(function () {
            // 阶段3：击发
            if (hammer) hammer.classList.remove('cocked');
            if (revolver) revolver.classList.add('recoil');
            if (flash) flash.classList.add('fire');

            setTimeout(function () {
                // 清理
                if (cylinder) cylinder.classList.remove('spinning');
                if (revolver) revolver.classList.remove('recoil');
                if (flash) flash.classList.remove('fire');
                callback();
            }, 200);
        }, 300);
    }, 200);
}

// ---- 结果弹窗 ----
function showShotResult(player, isLive, remaining, isGameOver) {
    var overlay = $('shot-overlay');
    var icon = $('shot-result-icon');
    var text = $('shot-result-text');
    var detail = $('shot-result-detail');

    if (isLive) {
        icon.textContent = '💀';
        text.textContent = '实弹！！';
        text.className = 'shot-result-text danger';
        detail.innerHTML =
            '<strong>' + player.name + '</strong> 被淘汰！<br>' +
            '实弹在第 <strong>' + player.revolver.livePosition + '</strong> 个弹巢';
    } else {
        icon.textContent = '😮‍💨';
        text.textContent = '空弹，安全！';
        text.className = 'shot-result-text safe';
        var nextChance = remaining > 0 ? Math.round((1 / remaining) * 100) : 100;
        detail.innerHTML =
            '<strong>' + player.name + '</strong> 逃过一劫<br>' +
            '剩余弹巢：<strong>' + remaining + '</strong> / 6' +
            '（下次中弹概率约 ' + nextChance + '%）';
    }

    overlay.classList.add('active');
    var continueBtn = $('btn-continue');
    if (isGameOver) {
        continueBtn.textContent = '查看结果';
    } else if (isLive) {
        continueBtn.textContent = '继续游戏';
    } else {
        continueBtn.textContent = '知道了';
    }
}

function hideShotOverlay() {
    $('shot-overlay').classList.remove('active');
}

// ---- 血溅特效 ----
function triggerBloodEffect() {
    var splatter = document.createElement('div');
    splatter.className = 'blood-splatter active';

    // 随机生成血滴
    for (var i = 0; i < 30; i++) {
        var drop = document.createElement('div');
        drop.className = 'blood-drop';
        var size = randomInt(8, 40);
        drop.style.width = size + 'px';
        drop.style.height = size + 'px';
        drop.style.left = randomInt(10, 90) + '%';
        drop.style.top = randomInt(10, 80) + '%';
        drop.style.animationDelay = randomInt(0, 300) + 'ms';
        drop.style.animationDuration = (0.5 + Math.random() * 0.8) + 's';
        splatter.appendChild(drop);
    }

    document.body.appendChild(splatter);

    setTimeout(function () {
        if (splatter.parentNode) {
            splatter.parentNode.removeChild(splatter);
        }
    }, 1200);
}

// ---- 记录面板 ----
function renderHistory() {
    var list = $('history-list');
    list.innerHTML = '';

    if (game.history.length === 0) {
        list.innerHTML = '<p class="history-empty">还没有人开过枪</p>';
        return;
    }

    // 倒序显示（最新的在上面）
    for (var i = game.history.length - 1; i >= 0; i--) {
        var h = game.history[i];
        var item = document.createElement('div');
        item.className = 'history-item';

        var playerSpan = document.createElement('span');
        playerSpan.className = 'hi-player';
        playerSpan.style.color = h.playerColor;
        playerSpan.textContent = h.playerName;

        var resultSpan = document.createElement('span');
        if (h.isLive) {
            resultSpan.className = 'hi-result live';
            resultSpan.textContent = '💀 实弹';
        } else {
            resultSpan.className = 'hi-result empty';
            resultSpan.textContent = '空弹';
        }

        var chanceSpan = document.createElement('span');
        chanceSpan.className = 'hi-chance';
        chanceSpan.textContent = '第' + h.shotNumber + '枪';

        item.appendChild(playerSpan);
        item.appendChild(resultSpan);
        item.appendChild(chanceSpan);
        list.appendChild(item);
    }
}

// ========================================
//  结算页
// ========================================

function bindResultEvents() {
    $('btn-replay').addEventListener('click', function () {
        showScreen('setup-screen');
    });
}

function showResult(winner) {
    game.isAnimating = false;

    if (winner) {
        $('result-winner').textContent = winner.emoji + ' ' + winner.name;
    } else {
        $('result-title').textContent = '平局？';
        $('result-winner').textContent = '无人幸存';
    }

    // 统计
    var statsDiv = $('result-stats');
    statsDiv.innerHTML = '';

    // 按开枪次数排序
    var sorted = game.players.slice().sort(function (a, b) {
        return b.totalShots - a.totalShots;
    });

    for (var i = 0; i < sorted.length; i++) {
        var p = sorted[i];
        var row = document.createElement('div');
        row.className = 'stat-row';
        if (!p.alive) {
            row.className += ' dead-row';
        }

        var nameSpan = document.createElement('span');
        nameSpan.className = 'stat-name';

        var avatar = document.createElement('span');
        avatar.className = 'stat-avatar';
        avatar.style.background = p.alive ? p.color : '#555';
        avatar.textContent = p.emoji;
        nameSpan.appendChild(avatar);
        nameSpan.appendChild(document.createTextNode(' ' + p.name));

        var valueSpan = document.createElement('span');
        valueSpan.className = 'stat-value';
        valueSpan.textContent = '开了 ' + p.totalShots + ' 枪';
        if (!p.alive) {
            valueSpan.textContent += '（淘汰）';
        } else {
            valueSpan.textContent += ' 🏆';
        }

        row.appendChild(nameSpan);
        row.appendChild(valueSpan);
        statsDiv.appendChild(row);
    }

    showScreen('result-screen');
}

// ---- 启动 ----
document.addEventListener('DOMContentLoaded', init);
