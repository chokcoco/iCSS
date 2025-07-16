// 渐变边框效果控制器 - 基于 iCSS 技术

class GradientBorderController {
    constructor() {
        this.animationsPaused = false;
        this.borderWidth = 4;
        this.animationSpeed = 1;
        this.glowIntensity = 30;
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
        this.setupBorderInteractions();
        
        console.log('🎨 渐变边框效果控制器已启动');
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
                    this.adjustBorderWidth(1);
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    this.adjustBorderWidth(-1);
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
        const borderWidthControl = document.getElementById('borderWidth');
        const animationSpeedControl = document.getElementById('animationSpeed');
        const glowIntensityControl = document.getElementById('glowIntensity');
        const toggleButton = document.getElementById('toggleAnimation');
        const randomizeButton = document.getElementById('randomizeColors');
        
        // 边框宽度控制
        borderWidthControl.addEventListener('input', (e) => {
            this.borderWidth = parseInt(e.target.value);
            this.updateBorderWidth();
        });
        
        // 动画速度控制
        animationSpeedControl.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            this.updateAnimationSpeed();
        });
        
        // 发光强度控制
        glowIntensityControl.addEventListener('input', (e) => {
            this.glowIntensity = parseInt(e.target.value);
            this.updateGlowIntensity();
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
            const conicLayer = document.querySelector('.bg-gradient-background');
            if (conicLayer) {
                const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
                conicLayer.style.setProperty('--border-angle', `${angle}deg`);
            }
        });
    }
    
    setupBorderInteractions() {
        const borderDemos = document.querySelectorAll('.border-demo');
        
        borderDemos.forEach(demo => {
            // 鼠标进入效果
            demo.addEventListener('mouseenter', () => {
                this.enhanceBorder(demo);
            });
            
            // 鼠标离开效果
            demo.addEventListener('mouseleave', () => {
                this.resetBorder(demo);
            });
            
            // 鼠标移动3D效果
            demo.addEventListener('mousemove', (e) => {
                this.apply3DEffect(demo, e);
            });
            
            // 点击效果
            demo.addEventListener('click', () => {
                this.triggerClickEffect(demo);
            });
        });
    }
    
    enhanceBorder(demo) {
        demo.style.transform = 'scale(1.1)';
        demo.style.boxShadow = `
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(255, 0, 255, 0.3),
            inset 0 0 30px rgba(255, 255, 255, 0.1)
        `;
        
        // 增强内部动画
        const innerContent = demo.querySelector('.inner-content');
        if (innerContent) {
            innerContent.style.transform = 'scale(1.05)';
            innerContent.style.transition = 'transform 0.3s ease';
        }
    }
    
    resetBorder(demo) {
        demo.style.transform = 'scale(1)';
        demo.style.boxShadow = '';
        
        const innerContent = demo.querySelector('.inner-content');
        if (innerContent) {
            innerContent.style.transform = 'scale(1)';
        }
    }
    
    apply3DEffect(demo, e) {
        const rect = demo.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = -(x - centerX) / 20;
        
        demo.style.transform = `
            scale(1.1) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    }
    
    triggerClickEffect(demo) {
        // 创建点击波纹效果
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rippleExpand 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 10;
        `;
        
        demo.appendChild(ripple);
        
        // 移除波纹元素
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // 添加点击动画
        demo.style.animation = 'borderClick 0.3s ease-out';
        setTimeout(() => {
            demo.style.animation = '';
        }, 300);
    }
    
    updateMouseEffects(e) {
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
        
        // 更新装饰元素位置
        this.updateFloatingShapes();
        
        // 更新背景响应
        this.updateBackgroundResponse();
    }
    
    updateFloatingShapes() {
        const shapes = document.querySelectorAll('.floating-shape');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        shapes.forEach((shape, index) => {
            const deltaX = (this.mousePosition.x - centerX) * 0.005;
            const deltaY = (this.mousePosition.y - centerY) * 0.005;
            
            shape.style.transform = `
                translate(${deltaX * (index + 1)}px, ${deltaY * (index + 1)}px)
                scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.1})
            `;
        });
    }
    
    updateBackgroundResponse() {
        const x = this.mousePosition.x / window.innerWidth;
        const y = this.mousePosition.y / window.innerHeight;
        
        // 更新背景渐变角度
        const conicLayer = document.querySelector('.bg-gradient-background');
        if (conicLayer) {
            const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
            conicLayer.style.setProperty('--border-angle', `${angle}deg`);
        }
    }
    
    toggleAnimations() {
        this.animationsPaused = !this.animationsPaused;
        const container = document.querySelector('.border-container');
        
        if (this.animationsPaused) {
            container.classList.add('animations-paused');
            console.log('⏸️ 边框动画已暂停');
        } else {
            container.classList.remove('animations-paused');
            console.log('▶️ 边框动画已恢复');
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
        
        console.log('🎨 边框颜色已随机化');
    }
    
    animateColorTransition() {
        const borderItems = document.querySelectorAll('.border-item');
        
        borderItems.forEach((item, index) => {
            setTimeout(() => {
                const demo = item.querySelector('.border-demo');
                if (demo) {
                    demo.style.transform = 'scale(0.9) rotateY(180deg)';
                    setTimeout(() => {
                        demo.style.transform = 'scale(1) rotateY(0deg)';
                    }, 150);
                }
            }, index * 100);
        });
    }
    
    adjustBorderWidth(delta) {
        this.borderWidth = Math.max(2, Math.min(20, this.borderWidth + delta));
        this.updateBorderWidth();
        
        // 更新滑块值
        const borderWidthControl = document.getElementById('borderWidth');
        if (borderWidthControl) {
            borderWidthControl.value = this.borderWidth;
        }
    }
    
    updateBorderWidth() {
        document.documentElement.style.setProperty('--border-width', `${this.borderWidth}px`);
        
        // 更新所有边框演示的宽度
        const borderDemos = document.querySelectorAll('.border-demo');
        borderDemos.forEach(demo => {
            demo.style.padding = `${this.borderWidth}px`;
            
            // 更新内部内容的圆角
            const innerContent = demo.querySelector('.inner-content');
            if (innerContent) {
                innerContent.style.borderRadius = `${Math.max(0, 20 - this.borderWidth)}px`;
            }
        });
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
    
    updateGlowIntensity() {
        document.documentElement.style.setProperty('--glow-intensity', `${this.glowIntensity}px`);
        
        // 更新发光边框的阴影
        const glowDemo = document.querySelector('.glow-demo');
        if (glowDemo) {
            glowDemo.style.boxShadow = `
                0 0 ${this.glowIntensity}px var(--primary-color),
                0 0 ${this.glowIntensity * 2}px var(--secondary-color),
                0 0 ${this.glowIntensity * 3}px var(--accent-color)
            `;
        }
    }
    
    initializeAnimations() {
        // 为页面添加入场动画
        const borderItems = document.querySelectorAll('.border-item');
        const shapes = document.querySelectorAll('.floating-shape');
        const title = document.querySelector('.title');
        
        // 标题动画
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                title.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 200);
        }
        
        // 边框项目依次出现
        borderItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(50px) rotateX(10deg)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) rotateX(0deg)';
            }, 500 + index * 150);
        });
        
        // 装饰元素淡入
        shapes.forEach((shape, index) => {
            shape.style.opacity = '0';
            shape.style.transform = 'scale(0)';
            
            setTimeout(() => {
                shape.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                shape.style.opacity = '0.7';
                shape.style.transform = 'scale(1)';
            }, 1000 + index * 200);
        });
        
        // 背景层渐进激活
        const bgLayers = document.querySelectorAll('.bg-layer');
        bgLayers.forEach((layer, index) => {
            layer.style.opacity = '0';
            
            setTimeout(() => {
                layer.style.transition = 'opacity 2s ease-out';
                layer.style.opacity = layer.classList.contains('bg-gradient-background') ? '0.2' : '1';
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
    const controller = new GradientBorderController();
    
    // 添加性能监控（可选）
    // controller.startPerformanceMonitoring();
    
    // 添加一些额外的样式增强
    const style = document.createElement('style');
    style.textContent = `
        .border-demo {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .inner-content {
            transition: all 0.3s ease;
        }
        
        .animations-paused .border-demo,
        .animations-paused .floating-shape {
            animation-play-state: paused !important;
        }
        
        /* 点击波纹动画 */
        @keyframes rippleExpand {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        /* 边框点击动画 */
        @keyframes borderClick {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
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
    
    console.log('🚀 渐变边框效果页面已完全加载');
    console.log('⌨️  快捷键: 空格键(暂停/播放), R(随机颜色), +/- (调节边框宽度)');
});

// 导出控制器类（用于调试）
window.GradientBorderController = GradientBorderController; 