document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navLinks = nav.querySelector('.hidden');
            if (navLinks) {
                navLinks.classList.toggle('hidden');
                navLinks.classList.toggle('flex');
                navLinks.classList.toggle('flex-col');
                navLinks.classList.toggle('absolute');
                navLinks.classList.toggle('top-full');
                navLinks.classList.toggle('left-0');
                navLinks.classList.toggle('right-0');
                navLinks.classList.toggle('bg-slate-900');
                navLinks.classList.toggle('p-6');
                navLinks.classList.toggle('shadow-2xl');
                navLinks.classList.toggle('border-b');
                navLinks.classList.toggle('border-slate-800');
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const navLinks = nav.querySelector('.flex-col');
                if (navLinks) {
                    navLinks.classList.add('hidden');
                    navLinks.classList.remove('flex');
                }
            }
        });
    });

    // Horizontal scroll with mouse wheel for tech giants section
    const techGiants = document.getElementById('tech-giants');
    let autoScrollInterval;
    let isUserInteracting = false;
    
    if (techGiants) {
        // Clone cards for seamless infinite loop
        const originalCards = Array.from(techGiants.children);
        
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            techGiants.appendChild(clone);
        });

        // Calculate card width for smooth reset
        const firstCard = techGiants.children[0];
        const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 272; // card width + gap
        const originalWidth = cardWidth * originalCards.length;

        // Mouse wheel support
        techGiants.addEventListener('wheel', function(e) {
            if (window.innerWidth < 768) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    this.scrollLeft += e.deltaY;
                }
            }
        });

        // Auto-scroll functionality with seamless loop
        function autoScroll() {
            if (!isUserInteracting && techGiants) {
                const scrollAmount = 1; // 每次滚动的像素数
                
                techGiants.scrollLeft += scrollAmount;
                
                // 无缝循环：当滚动到原始内容的末尾时，瞬间重置到开头
                if (techGiants.scrollLeft >= originalWidth) {
                    techGiants.scrollLeft = 0;
                }
            }
        }

        // 启动自动滚动
        autoScrollInterval = setInterval(autoScroll, 30);

        // 用户交互时暂停自动滚动
        techGiants.addEventListener('mouseenter', function() {
            isUserInteracting = true;
        });

        techGiants.addEventListener('mouseleave', function() {
            isUserInteracting = false;
        });

        // 触摸事件支持
        techGiants.addEventListener('touchstart', function() {
            isUserInteracting = true;
        });

        techGiants.addEventListener('touchend', function() {
            setTimeout(() => {
                isUserInteracting = false;
            }, 3000); // 触摸结束后3秒恢复自动滚动
        });

        // 点击卡片时暂停
        techGiants.addEventListener('click', function() {
            isUserInteracting = true;
            setTimeout(() => {
                isUserInteracting = false;
            }, 5000); // 点击后5秒恢复自动滚动
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up-dark');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('section > div > div, .bg-slate-900\\/80, .bg-slate-900\\/90').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Counter animation for stats
    const counters = document.querySelectorAll('.text-4xl, .text-5xl');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const number = parseInt(text);
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            current = number;
                            clearInterval(timer);
                        }
                        target.textContent = Math.floor(current) + (text.includes('%') ? '%' : '+');
                    }, 30);
                }
                
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // Cursor proximity effect for cards
    document.querySelectorAll('.group').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Create floating particles for dark theme
    function createParticles() {
        const particleCount = 30;
        const container = document.body;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-dark';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 15 + 15) + 's';
            particle.style.opacity = Math.random() * 0.4 + 0.1;
            container.appendChild(particle);
        }
    }
    
    createParticles();

    // Navbar background change on scroll
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-2xl');
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.classList.remove('shadow-2xl');
            navbar.style.background = 'rgba(15, 23, 42, 0.9)';
        }
    });

    // Button ripple effect
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            ripple.style.cssText = `
                position: absolute;
                background: rgba(6, 182, 212, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 100px;
                height: 100px;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple-dark 0.6s ease-out;
            `;
            
            ripple.style.left = e.clientX - rect.left + 'px';
            ripple.style.top = e.clientY - rect.top + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-dark {
            to {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Lazy load images (if any are added later)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Performance optimization: throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                ticking = false;
            });
            ticking = true;
        }
    });

    // Accessibility: handle escape key for mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const navLinks = nav.querySelector('.flex-col');
            if (navLinks) {
                navLinks.classList.add('hidden');
                navLinks.classList.remove('flex');
            }
        }
    });

    // Add staggered animation classes to elements
    const animatedElements = document.querySelectorAll('.fade-in-up-dark');
    animatedElements.forEach((el, index) => {
        el.classList.add(`stagger-dark-${(index % 6) + 1}`);
    });

    // Map marker hover effects
    document.querySelectorAll('.group.cursor-pointer').forEach(marker => {
        marker.addEventListener('mouseenter', function() {
            const tooltip = this.querySelector('.absolute.-top-10');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translate(-50%, -100%) scale(1.05)';
            }
        });
        
        marker.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.absolute.-top-10');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
            }
        });
    });

    // Service card hover effects
    document.querySelectorAll('.group.cursor-pointer').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const gradient = this.querySelector('.absolute.-inset-0\\.5');
            if (gradient) {
                gradient.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const gradient = this.querySelector('.absolute.-inset-0\\.5');
            if (gradient) {
                gradient.style.opacity = '0';
            }
        });
    });

});