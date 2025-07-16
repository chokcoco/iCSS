// 高级渐变效果控制器 - 基于 iCSS 技术

class AdvancedGradientController {
    constructor() {
        this.animationsPaused = false;
        this.animationSpeed = 1;
        this.intensity = 1;
        this.blurAmount = 10;
        this.mousePosition = { x: 0, y: 0 };
        this.colorPalettes = [
            { primary: 280, secondary: 180, accent: 60 },
            { primary: 0, secondary: 120, accent: 240 },
            { primary: 340, secondary: 160, accent: 40 },
            { primary: 200, secondary: 320, accent: 80 },
            { primary: 120, secondary: 280, accent: 0 }
        ];
        this.currentPaletteIndex = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupControlPanel();
        this.setupMouseEffects();
        this.initializeAnimations();
        this.setupCardInteractions();
        
        console.log('🎨 高级渐变效果控制器已启动');
    }
    
    setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleAnimations();
                    break;
                case 'KeyR':
                    this.randomizeColors();
                    break;
                case 'Equal':
                case 'NumpadAdd':
                    this.adjustSpeed(0.1);
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    this.adjustSpeed(-0.1);
                    break;
            }
        });
        
        // 鼠标移动效果
        document.addEventListener('mousemove', (e) => {
            this.updateMouseEffects(e);
        });
        
        // 触摸设备支持
        if ('ontouchstart' in window) {
            document.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                this.updateMouseEffects({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
        }
    }
    
    setupControlPanel() {
        const speedControl = document.getElementById('speedControl');
        const intensityControl = document.getElementById('intensityControl');
        const blurControl = document.getElementById('blurControl');
        const toggleButton = document.getElementById('toggleEffects');
        const randomizeButton = document.getElementById('randomizeColors');
        
        // 速度控制
        speedControl.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            this.updateAnimationSpeed();
        });
        
        // 强度控制
        intensityControl.addEventListener('input', (e) => {
            this.intensity = parseFloat(e.target.value);
            this.updateIntensity();
        });
        
        // 模糊控制
        blurControl.addEventListener('input', (e) => {
            this.blurAmount = parseInt(e.target.value);
            this.updateBlurAmount();
        });
        
        // 暂停/播放按钮
        toggleButton.addEventListener('click', () => {
            this.toggleAnimations();
        });
        
        // 随机颜色按钮
        randomizeButton.addEventListener('click', () => {
            this.randomizeColors();
        });
    }
    
    setupMouseEffects() {
        // 背景响应鼠标移动
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // 更新背景渐变角度
            const conicLayer = document.querySelector('.bg-animated-gradient');
            if (conicLayer) {
                const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
                conicLayer.style.setProperty('--gradient-angle', `${angle}deg`);
            }
            
            // 更新波浪偏移
            const waveLayer = document.querySelector('.bg-noise-texture');
            if (waveLayer) {
                const offsetX = (x - 0.5) * 50;
                const offsetY = (y - 0.5) * 50;
                waveLayer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }
        });
    }
    
    setupCardInteractions() {
        const cards = document.querySelectorAll('.effect-card');
        
        cards.forEach(card => {
            // 鼠标进入效果
            card.addEventListener('mouseenter', () => {
                this.enhanceCard(card);
            });
            
            // 鼠标离开效果
            card.addEventListener('mouseleave', () => {
                this.resetCard(card);
            });
            
            // 鼠标移动3D效果
            card.addEventListener('mousemove', (e) => {
                this.apply3DEffect(card, e);
            });
        });
    }
    
    enhanceCard(card) {
        card.style.transform = 'translateY(-15px) scale(1.05)';
        card.style.boxShadow = `
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(255, 0, 255, 0.3),
            inset 0 0 30px rgba(255, 255, 255, 0.1)
        `;
        
        // 增强内部动画
        const demo = card.querySelector('.effect-demo');
        if (demo) {
            demo.style.animationDuration = '0.5s';
        }
    }
    
    resetCard(card) {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '';
        
        const demo = card.querySelector('.effect-demo');
        if (demo) {
            demo.style.animationDuration = '';
        }
    }
    
    apply3DEffect(card, e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = -(x - centerX) / 15;
        
        card.style.transform = `
            translateY(-15px) 
            scale(1.05) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    }
    
    updateMouseEffects(e) {
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
        
        // 更新浮动元素位置
        this.updateFloatingOrbs();
        
        // 更新背景响应
        this.updateBackgroundResponse();
    }
    
    updateFloatingOrbs() {
        const orbs = document.querySelectorAll('.floating-orb');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        orbs.forEach((orb, index) => {
            const deltaX = (this.mousePosition.x - centerX) * 0.01;
            const deltaY = (this.mousePosition.y - centerY) * 0.01;
            
            orb.style.transform = `
                translate(${deltaX * (index + 1)}px, ${deltaY * (index + 1)}px)
                scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.1})
            `;
        });
    }
    
    updateBackgroundResponse() {
        const x = this.mousePosition.x / window.innerWidth;
        const y = this.mousePosition.y / window.innerHeight;
        
        // 更新背景渐变角度
        const conicLayer = document.querySelector('.bg-animated-gradient');
        if (conicLayer) {
            const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
            conicLayer.style.setProperty('--gradient-angle', `${angle}deg`);
        }
    }
    
    toggleAnimations() {
        this.animationsPaused = !this.animationsPaused;
        const container = document.querySelector('.gradient-container');
        
        if (this.animationsPaused) {
            container.classList.add('animations-paused');
            console.log('⏸️ 动画已暂停');
        } else {
            container.classList.remove('animations-paused');
            console.log('▶️ 动画已恢复');
        }
    }
    
    randomizeColors() {
        this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.colorPalettes.length;
        const palette = this.colorPalettes[this.currentPaletteIndex];
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--primary-hue', palette.primary);
        document.documentElement.style.setProperty('--secondary-hue', palette.secondary);
        document.documentElement.style.setProperty('--accent-hue', palette.accent);
        
        // 添加颜色切换动画
        this.animateColorTransition();
        
        console.log('🎨 颜色已随机化');
    }
    
    animateColorTransition() {
        const cards = document.querySelectorAll('.effect-card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(0.95) rotateY(180deg)';
                setTimeout(() => {
                    card.style.transform = 'scale(1) rotateY(0deg)';
                }, 150);
            }, index * 50);
        });
    }
    
    adjustSpeed(delta) {
        this.animationSpeed = Math.max(0.1, Math.min(3, this.animationSpeed + delta));
        this.updateAnimationSpeed();
        
        // 更新滑块值
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.value = this.animationSpeed;
        }
    }
    
    updateAnimationSpeed() {
        document.documentElement.style.setProperty('--animation-speed', this.animationSpeed);
        
        // 更新所有动画元素的速度
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;
            
            if (animationName && animationName !== 'none') {
                const baseDuration = parseFloat(animationDuration) * this.animationSpeed;
                element.style.animationDuration = `${baseDuration}s`;
            }
        });
    }
    
    updateIntensity() {
        document.documentElement.style.setProperty('--intensity', this.intensity);
        
        // 更新颜色饱和度
        const cards = document.querySelectorAll('.effect-card');
        cards.forEach(card => {
            card.style.filter = `saturate(${this.intensity}) brightness(${0.5 + this.intensity * 0.5})`;
        });
    }
    
    updateBlurAmount() {
        document.documentElement.style.setProperty('--blur-amount', `${this.blurAmount}px`);
        
        // 更新所有使用backdrop-filter的元素
        const glassElements = document.querySelectorAll('[style*="backdrop-filter"]');
        glassElements.forEach(element => {
            element.style.backdropFilter = `blur(${this.blurAmount}px)`;
        });
    }
    
    initializeAnimations() {
        // 为页面添加入场动画
        const cards = document.querySelectorAll('.effect-card');
        const orbs = document.querySelectorAll('.floating-orb');
        const heroText = document.querySelector('.gradient-text');
        
        // 英雄文字动画
        if (heroText) {
            heroText.style.opacity = '0';
            heroText.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                heroText.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                heroText.style.opacity = '1';
                heroText.style.transform = 'translateY(0)';
            }, 200);
        }
        
        // 卡片依次出现
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) rotateX(10deg)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) rotateX(0deg)';
            }, 500 + index * 150);
        });
        
        // 浮动元素淡入
        orbs.forEach((orb, index) => {
            orb.style.opacity = '0';
            orb.style.transform = 'scale(0)';
            
            setTimeout(() => {
                orb.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                orb.style.opacity = '0.7';
                orb.style.transform = 'scale(1)';
            }, 1000 + index * 200);
        });
        
        // 背景层渐进激活
        const bgLayers = document.querySelectorAll('.bg-layer');
        bgLayers.forEach((layer, index) => {
            layer.style.opacity = '0';
            
            setTimeout(() => {
                layer.style.transition = 'opacity 2s ease-out';
                layer.style.opacity = layer.classList.contains('bg-animated-gradient') ? '0.3' : '1';
            }, index * 300);
        });
    }
    
    // 性能监控
    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                console.log(`🎯 当前FPS: ${fps}`);
                
                if (fps < 30) {
                    console.warn('⚠️ 性能警告: FPS过低，建议降低动画复杂度');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new AdvancedGradientController();
    
    // 添加性能监控（可选）
    // controller.startPerformanceMonitoring();
    
    // 添加一些额外的样式增强
    const style = document.createElement('style');
    style.textContent = `
        .effect-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .effect-demo {
            transition: all 0.3s ease;
        }
        
        .animations-paused .effect-card::before,
        .animations-paused .effect-demo,
        .animations-paused .floating-orb {
            animation-play-state: paused !important;
        }
        
        /* 平滑的颜色过渡 */
        * {
            transition: 
                background-color 0.3s ease,
                border-color 0.3s ease,
                color 0.3s ease,
                box-shadow 0.3s ease,
                filter 0.3s ease;
        }
        
        /* 加载状态 */
        .loading {
            opacity: 0;
            transform: translateY(20px);
        }
        
        .loaded {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // 添加页面加载完成标记
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    console.log('🚀 高级渐变效果页面已完全加载');
    console.log('⌨️  快捷键: 空格键(暂停/播放), R(随机颜色), +/- (调节速度)');
});

// 导出控制器类（用于调试）
window.AdvancedGradientController = AdvancedGradientController; 