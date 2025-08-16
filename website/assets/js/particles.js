class QuantumParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.connections = [];
        this.quantumStates = [];
        this.maxParticles = this.getMaxParticles();
        this.animationId = null;
        
        this.init();
        this.createInterferencePattern();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.maxParticles = this.getMaxParticles();
            this.adjustParticleCount();
        });
    }
    
    getMaxParticles() {
        const width = window.innerWidth;
        if (width < 768) return 15;
        if (width < 1024) return 25;
        return 35;
    }
    
    init() {
        this.createParticles();
        this.createQuantumStates();
        this.createEntanglementPairs();
        this.createWaveFunctions();
        this.createQuantumTunnels();
        this.createDecoherenceEffects();
    }
    
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = this.getParticleClass();
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.animationDuration = `${6 + Math.random() * 4}s`;
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }
    
    getParticleClass() {
        const classes = ['particle', 'particle quantum', 'particle entangled'];
        return classes[Math.floor(Math.random() * classes.length)];
    }
    
    createQuantumStates() {
        for (let i = 0; i < 8; i++) {
            const state = document.createElement('div');
            state.className = 'quantum-state';
            state.style.left = `${Math.random() * 100}%`;
            state.style.top = `${Math.random() * 100}%`;
            state.style.animationDelay = `${Math.random() * 4}s`;
            
            this.container.appendChild(state);
            this.quantumStates.push(state);
        }
    }
    
    createEntanglementPairs() {
        for (let i = 0; i < 3; i++) {
            const pair = document.createElement('div');
            pair.className = 'entanglement-pair';
            pair.style.left = `${Math.random() * 80}%`;
            pair.style.top = `${Math.random() * 80}%`;
            pair.style.animationDelay = `${Math.random() * 8}s`;
            
            const particle1 = document.createElement('div');
            particle1.className = 'entangled-particle';
            
            const line = document.createElement('div');
            line.className = 'entanglement-line';
            
            const particle2 = document.createElement('div');
            particle2.className = 'entangled-particle';
            
            pair.appendChild(particle1);
            pair.appendChild(line);
            pair.appendChild(particle2);
            
            this.container.appendChild(pair);
        }
    }
    
    createWaveFunctions() {
        for (let i = 0; i < 5; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave-function';
            wave.style.left = `${Math.random() * 90}%`;
            wave.style.top = `${Math.random() * 90}%`;
            wave.style.animationDelay = `${Math.random() * 5}s`;
            wave.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            this.container.appendChild(wave);
        }
    }
    
    createQuantumTunnels() {
        for (let i = 0; i < 4; i++) {
            const tunnel = document.createElement('div');
            tunnel.className = 'quantum-tunnel';
            tunnel.style.top = `${Math.random() * 100}%`;
            tunnel.style.animationDelay = `${Math.random() * 7}s`;
            
            this.container.appendChild(tunnel);
        }
    }
    
    createDecoherenceEffects() {
        for (let i = 0; i < 3; i++) {
            const decoherence = document.createElement('div');
            decoherence.className = 'decoherence';
            decoherence.style.left = `${Math.random() * 100}%`;
            decoherence.style.top = `${Math.random() * 100}%`;
            decoherence.style.animationDelay = `${Math.random() * 9}s`;
            
            this.container.appendChild(decoherence);
        }
    }
    
    createInterferencePattern() {
        const pattern = document.createElement('div');
        pattern.className = 'interference-pattern';
        this.container.appendChild(pattern);
    }
    
    createSuperpositionEffects() {
        for (let i = 0; i < 6; i++) {
            const superposition = document.createElement('div');
            superposition.className = 'superposition';
            superposition.style.top = `${Math.random() * 100}%`;
            superposition.style.animationDelay = `${Math.random() * 6}s`;
            
            this.container.appendChild(superposition);
        }
    }
    
    adjustParticleCount() {
        const currentCount = this.particles.length;
        
        if (currentCount < this.maxParticles) {
            // Add particles
            for (let i = currentCount; i < this.maxParticles; i++) {
                this.createParticle();
            }
        } else if (currentCount > this.maxParticles) {
            // Remove particles
            for (let i = currentCount - 1; i >= this.maxParticles; i--) {
                const particle = this.particles[i];
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                this.particles.splice(i, 1);
            }
        }
    }
    
    animate() {
        // Create dynamic quantum connections
        this.updateQuantumConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateQuantumConnections() {
        // Remove old connections
        this.connections.forEach(connection => {
            if (connection.parentNode) {
                connection.parentNode.removeChild(connection);
            }
        });
        this.connections = [];
        
        // Create new connections between nearby particles
        if (Math.random() < 0.1) { // 10% chance each frame
            const particle1 = this.particles[Math.floor(Math.random() * this.particles.length)];
            const particle2 = this.particles[Math.floor(Math.random() * this.particles.length)];
            
            if (particle1 && particle2 && particle1 !== particle2) {
                this.createQuantumConnection(particle1, particle2);
            }
        }
    }
    
    createQuantumConnection(particle1, particle2) {
        const rect1 = particle1.getBoundingClientRect();
        const rect2 = particle2.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        const x1 = rect1.left - containerRect.left + rect1.width / 2;
        const y1 = rect1.top - containerRect.top + rect1.height / 2;
        const x2 = rect2.left - containerRect.left + rect2.width / 2;
        const y2 = rect2.top - containerRect.top + rect2.height / 2;
        
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        if (distance < 200) { // Only connect nearby particles
            const connection = document.createElement('div');
            connection.className = 'quantum-connection';
            connection.style.width = `${distance}px`;
            connection.style.left = `${x1}px`;
            connection.style.top = `${y1}px`;
            connection.style.transformOrigin = '0 0';
            connection.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
            connection.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            this.container.appendChild(connection);
            this.connections.push(connection);
            
            // Remove connection after animation
            setTimeout(() => {
                if (connection.parentNode) {
                    connection.parentNode.removeChild(connection);
                }
                const index = this.connections.indexOf(connection);
                if (index > -1) {
                    this.connections.splice(index, 1);
                }
            }, 3000);
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up all elements
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.connections.forEach(connection => {
            if (connection.parentNode) {
                connection.parentNode.removeChild(connection);
            }
        });
        
        this.quantumStates.forEach(state => {
            if (state.parentNode) {
                state.parentNode.removeChild(state);
            }
        });
        
        // Clear arrays
        this.particles = [];
        this.connections = [];
        this.quantumStates = [];
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            new QuantumParticleSystem(particlesContainer);
        }
    }
});