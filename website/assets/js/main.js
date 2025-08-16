// Main JavaScript functionality for Quantum Compression website

class QuantumWebsite {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupAnimationObserver();
        this.setupSmoothScrolling();
        this.setupStatsCounter();
    }
    
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
                if (navToggle) {
                    navToggle.classList.remove('active');
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navToggle && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (navbar) {
                // Add/remove scrolled class for navbar styling
                if (currentScrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                // Hide/show navbar on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    setupAnimationObserver() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.feature-card, .metric-card, .hero-stats .stat'
        );
        
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupStatsCounter() {
        const stats = document.querySelectorAll('.stat-number');
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => {
            statsObserver.observe(stat);
        });
    }
    
    animateCounter(element) {
        const target = element.textContent;
        const isPercentage = target.includes('%');
        const isMultiplier = target.includes('x');
        
        let numericTarget;
        if (isPercentage) {
            numericTarget = parseInt(target.replace('%', ''));
        } else if (isMultiplier) {
            numericTarget = parseInt(target.replace('x', ''));
        } else {
            numericTarget = parseInt(target);
        }
        
        if (isNaN(numericTarget)) return;
        
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepValue = numericTarget / steps;
        const stepDuration = duration / steps;
        
        let current = 0;
        const timer = setInterval(() => {
            current += stepValue;
            
            if (current >= numericTarget) {
                current = numericTarget;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current);
            if (isPercentage) {
                element.textContent = displayValue + '%';
            } else if (isMultiplier) {
                element.textContent = displayValue + 'x';
            } else {
                element.textContent = displayValue + '%';
            }
        }, stepDuration);
    }
}

// Quantum-themed interactive effects
class QuantumEffects {
    constructor() {
        this.setupHoverEffects();
        this.setupClickEffects();
    }
    
    setupHoverEffects() {
        // Add quantum glow effect to buttons
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createQuantumRipple(e.target, 'hover');
            });
        });
        
        // Add particle burst effect to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createParticleBurst(e.target);
            });
        });
    }
    
    setupClickEffects() {
        // Add quantum ripple effect to clickable elements
        const clickableElements = document.querySelectorAll('.btn, .nav-link');
        
        clickableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.createQuantumRipple(e.target, 'click');
            });
        });
    }
    
    createQuantumRipple(element, type) {
        const ripple = document.createElement('div');
        ripple.className = `quantum-ripple ${type}`;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // Animate the ripple
        requestAnimationFrame(() => {
            ripple.style.transform = 'translate(-50%, -50%) scale(1)';
            ripple.style.opacity = '0';
        });
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    createParticleBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'var(--primary-color)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            document.body.appendChild(particle);
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const duration = 800 + Math.random() * 400;
            
            particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * distance - 50}%, ${Math.sin(angle) * distance - 50}%) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.setupLazyLoading();
        this.setupPreloadCriticalResources();
    }
    
    setupLazyLoading() {
        // Lazy load images and heavy content
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        element.src = element.dataset.lazy;
                        element.classList.remove('lazy');
                        lazyObserver.unobserve(element);
                    }
                });
            });
            
            lazyElements.forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }
    
    setupPreloadCriticalResources() {
        // Preload critical resources
        const criticalResources = [
            'assets/css/main.css',
            'assets/css/animations.css'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumWebsite();
    new QuantumEffects();
    new PerformanceOptimizer();
});

// Add CSS for dynamic effects
const dynamicStyles = `
.quantum-ripple {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
    transition: transform 0.6s ease-out, opacity 0.6s ease-out;
    pointer-events: none;
}

.quantum-ripple.click {
    background: radial-gradient(circle, rgba(255, 0, 110, 0.4) 0%, transparent 70%);
}

.animate-in {
    animation: slideInUp 0.8s ease-out forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.navbar.scrolled {
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(25px);
}

.navbar {
    transition: transform 0.3s ease, background 0.3s ease;
}

@media (max-width: 768px) {
    .nav-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    
    .nav-toggle.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
}
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);