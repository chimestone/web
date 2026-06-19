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

// 打字机效果
function typeWriter(element, text, speed, callback) {
    var i = 0;
    element.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    element.appendChild(cursor);

    function type() {
        if (i < text.length) {
            element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            setTimeout(type, speed);
        } else {
            // 打字完成后闪烁几次后移除光标
            setTimeout(function () {
                cursor.remove();
                if (callback) callback();
            }, 2000);
        }
    }
    type();
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

    // 安全构造URL：只允许Bing域名的合法路径
    var url = "https://www.cn.bing.com" + imgUrl;
    // 额外安全检查：确保最终URL仍然是合法的Bing URL
    if (!/^https:\/\/www\.cn\.bing\.com\/th\?id=OHR\./.test(url)) {
        return;
    }
    panel.style.backgroundImage = "url('" + url.replace(/['\\]/g, '\\$&') + "')";
    panel.style.backgroundPosition = "center center";
    panel.style.backgroundRepeat = "no-repeat";
    panel.style.backgroundColor = "#666";
    panel.style.backgroundSize = "cover";
    sessionStorage.setItem(indexName, index);
}

// 一言API获取
function loadHitokoto() {
    var descElement = document.getElementById('description');
    if (!descElement) return;

    var refreshBtn = document.querySelector('.hitokoto-refresh');
    if (refreshBtn) {
        refreshBtn.classList.add('spinning');
    }

    fetch("https://v1.hitokoto.cn")
        .then(function (response) { return response.json(); })
        .then(function (res) {
            if (res.hitokoto && res.from) {
                // 淡出
                descElement.style.opacity = '0';
                descElement.style.transition = 'opacity 0.3s ease';

                setTimeout(function () {
                    var textNode = document.createTextNode(res.hitokoto);
                    var br = document.createElement('br');
                    var fromText = document.createTextNode(' -「');
                    var strong = document.createElement('strong');
                    strong.textContent = res.from;
                    var endText = document.createTextNode('」');

                    descElement.innerHTML = '';
                    descElement.appendChild(textNode);
                    descElement.appendChild(br);
                    descElement.appendChild(fromText);
                    descElement.appendChild(strong);
                    descElement.appendChild(endText);

                    // 淡入
                    descElement.style.opacity = '1';
                }, 300);
            }
        })
        .catch(function (error) {
            console.error('Error fetching hitokoto:', error);
        })
        .finally(function () {
            if (refreshBtn) {
                setTimeout(function () {
                    refreshBtn.classList.remove('spinning');
                }, 600);
            }
        });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 初始化动画
    var iUpElements = document.querySelectorAll(".iUp");
    for (var i = 0; i < iUpElements.length; i++) {
        iUp.up(iUpElements[i]);
    }

    // 打字机效果：在动画播放期间开始打字
    var subtitle = document.getElementById('subtitle');
    if (subtitle) {
        var text = subtitle.getAttribute('data-text') || subtitle.textContent.trim();
        // 等入场动画进行到一半左右开始打字
        setTimeout(function () {
            typeWriter(subtitle, text, 80);
        }, iUpElements.length * 150 + 400);
    }

    // 加载一言
    if (document.getElementById('description')) {
        loadHitokoto();
    }

    // 一言刷新按钮
    var refreshBtn = document.querySelector('.hitokoto-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            loadHitokoto();
        });
    }
});

// 导出给全局使用
window.iUp = iUp;
