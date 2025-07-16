// 复杂渐变背景效果 - JavaScript 交互控制
class GradientBackgroundController {
    constructor() {
        this.animationsPaused = false;
        this.currentTheme = 'dark';
        this.animationSpeed = 1;
        this.mousePosition = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMouseTracking();
        this.setup3DCardEffects();
        this.initializeAnimations();
    }
    
    setupEventListeners() {
        // 动画控制按钮
        const toggleButton = document.getElementById('toggleAnimation');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleAnimations());
        }
        
        // 主题切换按钮
        const themeButton = document.getElementById('changeTheme');
        if (themeButton) {
            themeButton.addEventListener('click', () => this.toggleTheme());
        }
        
        // 速度控制滑块
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.addEventListener('input', (e) => this.changeAnimationSpeed(e.target.value));
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupMouseTracking() {
        let mouseMoveTimer;
        
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // 节流处理，避免过频繁的更新
            clearTimeout(mouseMoveTimer);
            mouseMoveTimer = setTimeout(() => {
                this.updateMouseEffects(e);
            }, 16); // 60fps
        });
    }
    
    setup3DCardEffects() {
        const cards = document.querySelectorAll('.card');
        const glassCard = document.getElementById('glass-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.onCardEnter(e));
            card.addEventListener('mousemove', (e) => this.onCardMove(e));
            card.addEventListener('mouseleave', (e) => this.onCardLeave(e));
        });
        
        // 为毛玻璃卡片添加特殊的鼠标跟随效果
        if (glassCard) {
            this.setupGlassCardEffect(glassCard);
        }
    }
    
    setupGlassCardEffect(card) {
        const multiple = 25;
        
        function transformCard(x, y) {
            const box = card.getBoundingClientRect();
            const calcX = -(y - box.y - (box.height / 2)) / multiple;
            const calcY = (x - box.x - (box.width / 2)) / multiple;
            
            // 计算鼠标相对于卡片中心的角度
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            
            card.style.transform = `rotateX(${calcX}deg) rotateY(${calcY}deg)`;
            card.style.setProperty('--angle', `${-angle}deg`);
        }
        
        card.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                transformCard(e.clientX, e.clientY);
            });
        });
        
        card.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                card.style.transform = 'rotateX(0) rotateY(0)';
                card.style.setProperty('--angle', '0deg');
            });
        });
    }
    
    onCardEnter(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-10px) scale(1.02)';
        
        // 添加动态光晕效果
        this.addDynamicGlow(card);
    }
    
    onCardMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = -(x - centerX) / 10;
        
        card.style.transform = `translateY(-10px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // 更新渐变角度
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        card.style.setProperty('--angle', `${angle}deg`);
    }
    
    onCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
        card.style.setProperty('--angle', '0deg');
        
        // 移除动态光晕效果
        this.removeDynamicGlow(card);
    }
    
    addDynamicGlow(card) {
        card.classList.add('dynamic-glow');
        // 动态光晕CSS会通过类名控制
    }
    
    removeDynamicGlow(card) {
        card.classList.remove('dynamic-glow');
    }
    
    updateMouseEffects(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // 更新背景层的响应
        const conicLayer = document.querySelector('.bg-conic-animation');
        const waveLayer = document.querySelector('.bg-linear-waves');
        
        if (conicLayer) {
            const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
            conicLayer.style.setProperty('--angle', `${angle}deg`);
        }
        
        if (waveLayer) {
            const offsetX = (x - 0.5) * 100;
            const offsetY = (y - 0.5) * 100;
            waveLayer.style.setProperty('--wave-offset', `${offsetX}px`);
        }
        
        // 更新浮动元素
        this.updateFloatingOrbs(x, y);
    }
    
    updateFloatingOrbs(mouseX, mouseY) {
        const orbs = document.querySelectorAll('.floating-orb');
        
        orbs.forEach((orb, index) => {
            const rect = orb.getBoundingClientRect();
            const orbCenterX = rect.left + rect.width / 2;
            const orbCenterY = rect.top + rect.height / 2;
            
            const distanceX = (mouseX * window.innerWidth - orbCenterX) * 0.1;
            const distanceY = (mouseY * window.innerHeight - orbCenterY) * 0.1;
            
            orb.style.transform = `translate(${distanceX}px, ${distanceY}px) scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.1})`;
        });
    }
    
    toggleAnimations() {
        this.animationsPaused = !this.animationsPaused;
        
        if (this.animationsPaused) {
            document.body.classList.add('animations-paused');
        } else {
            document.body.classList.remove('animations-paused');
        }
        
        const button = document.getElementById('toggleAnimation');
        if (button) {
            button.textContent = this.animationsPaused ? '播放动画' : '暂停动画';
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${this.currentTheme}`);
        
        const button = document.getElementById('changeTheme');
        if (button) {
            button.textContent = this.currentTheme === 'dark' ? '切换到浅色' : '切换到深色';
        }
        
        // 触发主题切换动画
        this.animateThemeTransition();
    }
    
    animateThemeTransition() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(0.9) rotateY(180deg)';
                setTimeout(() => {
                    card.style.transform = 'scale(1) rotateY(0deg)';
                }, 150);
            }, index * 50);
        });
    }
    
    changeAnimationSpeed(speed) {
        this.animationSpeed = parseFloat(speed);
        document.documentElement.style.setProperty('--animation-speed', speed);
        
        // 实时更新所有动画的播放速度
        const animatedElements = document.querySelectorAll('*');
        animatedElements.forEach(el => {
            const animations = el.getAnimations();
            animations.forEach(animation => {
                animation.playbackRate = this.animationSpeed;
            });
        });
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case ' ': // 空格键暂停/播放
                e.preventDefault();
                this.toggleAnimations();
                break;
            case 't': // T键切换主题
            case 'T':
                this.toggleTheme();
                break;
            case '+':
            case '=':
                // 加快动画速度
                const newSpeed = Math.min(this.animationSpeed + 0.1, 3);
                this.changeAnimationSpeed(newSpeed);
                document.getElementById('speedControl').value = newSpeed;
                break;
            case '-':
                // 减慢动画速度
                const slowSpeed = Math.max(this.animationSpeed - 0.1, 0.5);
                this.changeAnimationSpeed(slowSpeed);
                document.getElementById('speedControl').value = slowSpeed;
                break;
        }
    }
    
    handleResize() {
        // 窗口大小变化时重新计算布局
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.transform = 'none';
            setTimeout(() => {
                card.style.transform = '';
            }, 100);
        });
    }
    
    initializeAnimations() {
        // 为页面添加入场动画
        const cards = document.querySelectorAll('.card');
        const orbs = document.querySelectorAll('.floating-orb');
        
        // 卡片依次出现
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // 浮动元素淡入
        orbs.forEach((orb, index) => {
            orb.style.opacity = '0';
            setTimeout(() => {
                orb.style.transition = 'opacity 1s ease-out';
                orb.style.opacity = '0.7';
            }, 500 + index * 200);
        });
        
        // 背景层渐进激活
        const bgLayers = document.querySelectorAll('.bg-layer');
        bgLayers.forEach((layer, index) => {
            layer.style.opacity = '0';
            setTimeout(() => {
                layer.style.transition = 'opacity 2s ease-out';
                layer.style.opacity = layer.classList.contains('bg-conic-animation') ? '0.3' : '1';
            }, index * 500);
        });
    }
    
    // 性能优化：使用RAF来优化动画
    optimizePerformance() {
        let ticking = false;
        
        function updateAnimations() {
            // 在这里更新所有需要每帧更新的动画
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        }
        
        return requestTick;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new GradientBackgroundController();
    
    // 添加一些额外的样式增强
    const style = document.createElement('style');
    style.textContent = `
        .dynamic-glow {
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.3),
                0 0 60px rgba(255, 0, 255, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.1) !important;
        }
        
        .card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animations-paused .card::before {
            animation-play-state: paused !important;
        }
        
        /* 主题切换过渡效果 */
        * {
            transition: 
                background-color 0.3s ease,
                border-color 0.3s ease,
                color 0.3s ease,
                box-shadow 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // 添加触摸设备支持
    if ('ontouchstart' in window) {
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            controller.updateMouseEffects({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
    }
    
    console.log('🎨 复杂渐变背景效果已启动');
    console.log('⌨️  快捷键: 空格键(暂停/播放), T(切换主题), +/-(调节速度)');
});

// 导出控制器类，便于外部使用
window.GradientBackgroundController = GradientBackgroundController; 