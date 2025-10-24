// ===== Enhanced JavaScript for Smart Attendance System =====

// ===== Global Variables =====
let videoStream = null;
let isProcessing = false;

// ===== Theme Management =====
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
        this.init();
    }

    init() {
        if (!this.themeToggle) return;
        
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(currentTheme);
        
        // Add click event listener
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add a subtle animation to the toggle button
        this.themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);
    }
}

// ===== Loading Manager =====
class LoadingManager {
    constructor() {
        this.overlay = document.getElementById('loadingOverlay');
        this.spinner = this.overlay?.querySelector('.spinner');
        this.loadingText = this.overlay?.querySelector('.loading-text');
    }

    show(message = 'Processing...') {
        if (!this.overlay) return;
        
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
        
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add a subtle animation
        setTimeout(() => {
            if (this.spinner) {
                this.spinner.style.animation = 'spin 1s linear infinite';
            }
        }, 100);
    }

    hide() {
        if (!this.overlay) return;
        
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.spinner) {
            this.spinner.style.animation = '';
        }
    }
}

// ===== Camera Manager =====
class CameraManager {
    constructor() {
        this.video = document.getElementById('video');
        this.videoReg = document.getElementById('videoReg');
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            videoStream = stream;
            
            if (this.video) {
                this.video.srcObject = stream;
                this.video.play();
            }
            
            if (this.videoReg) {
                this.videoReg.srcObject = stream;
                this.videoReg.play();
            }
            
            this.isInitialized = true;
            console.log('Camera initialized successfully');
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showCameraError(error);
        }
    }

    showCameraError(error) {
        const errorMessage = this.getCameraErrorMessage(error);
        this.showNotification(errorMessage, 'error');
    }

    getCameraErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Camera access denied. Please allow camera permissions and refresh the page.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is being used by another application. Please close other applications and try again.';
        } else {
            return 'Camera error: ' + error.message;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// ===== Form Manager =====
class FormManager {
    constructor() {
        this.loadingManager = new LoadingManager();
        this.init();
    }

    init() {
        // Recognition form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleRecognitionSubmit(e));
        }

        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
        }

        // Capture buttons
        const captureBtn = document.getElementById('capture');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.handleCaptureRecognition());
        }

        const captureRegBtn = document.getElementById('captureReg');
        if (captureRegBtn) {
            captureRegBtn.addEventListener('click', () => this.handleCaptureRegistration());
        }
    }

    async handleRecognitionSubmit(e) {
        e.preventDefault();
        
        if (isProcessing) return;
        
        const formData = new FormData(e.target);
        const fileInput = formData.get('image');
        
        if (!fileInput || fileInput.size === 0) {
            this.showError('Please select an image file');
            return;
        }

        await this.submitForm('/', formData, 'result');
    }

    async handleRegistrationSubmit(e) {
        e.preventDefault();
        
        if (isProcessing) return;
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const fileInput = formData.get('image');
        
        if (!name || name.trim() === '') {
            this.showError('Please enter a name');
            return;
        }
        
        if (!fileInput || fileInput.size === 0) {
            this.showError('Please select an image file');
            return;
        }

        await this.submitForm('/register', formData, 'registerResult');
    }

    async handleCaptureRecognition() {
        if (isProcessing) return;
        
        const video = document.getElementById('video');
        if (!video || !video.srcObject) {
            this.showError('Camera not available. Please refresh the page.');
            return;
        }

        await this.captureAndSend(video, '/', 'result');
    }

    async handleCaptureRegistration() {
        if (isProcessing) return;
        
        const name = document.getElementById('regName')?.value?.trim();
  if (!name) {
            this.showError('Please enter your name before capturing');
            return;
        }

        const video = document.getElementById('videoReg');
        if (!video || !video.srcObject) {
            this.showError('Camera not available. Please refresh the page.');
    return;
  }

        await this.captureAndSend(video, '/register', 'registerResult', name);
    }

    async submitForm(url, formData, resultElementId) {
        isProcessing = true;
        this.loadingManager.show('Processing your request...');
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.text();
            this.displayResult(resultElementId, result);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('An error occurred while processing your request. Please try again.');
        } finally {
            isProcessing = false;
            this.loadingManager.hide();
        }
    }

    async captureAndSend(videoElem, url, resultElemId, name = null) {
        isProcessing = true;
        this.loadingManager.show('Capturing and processing...');
        
        try {
  const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
            
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            });
            
            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg');
            if (name) formData.append('name', name);
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.text();
            this.displayResult(resultElemId, result);
            
        } catch (error) {
            console.error('Capture error:', error);
            this.showError('An error occurred while capturing. Please try again.');
        } finally {
            isProcessing = false;
            this.loadingManager.hide();
        }
    }

    displayResult(elementId, result) {
        const resultElement = document.getElementById(elementId);
        if (!resultElement) return;
        
        // Add animation class
        resultElement.style.opacity = '0';
        resultElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultElement.innerHTML = result;
            resultElement.style.transition = 'all 0.3s ease-out';
            resultElement.style.opacity = '1';
            resultElement.style.transform = 'translateY(0)';
            
            // Add success/error styling based on content
            if (result.toLowerCase().includes('success') || result.toLowerCase().includes('recognized')) {
                resultElement.classList.add('success');
            } else if (result.toLowerCase().includes('error') || result.toLowerCase().includes('failed')) {
                resultElement.classList.add('error');
            }
        }, 100);
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// ===== File Input Enhancement =====
class FileInputEnhancer {
    constructor() {
        this.init();
    }

    init() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => this.enhanceFileInput(input));
    }

    enhanceFileInput(input) {
        const label = input.previousElementSibling;
        if (!label || !label.classList.contains('file-label')) return;
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Update label text
                const fileName = file.name.length > 20 ? 
                    file.name.substring(0, 20) + '...' : 
                    file.name;
                label.innerHTML = `
                    <span class="file-icon">📁</span>
                    ${fileName}
                `;
                
                // Add success styling
                label.style.borderColor = 'var(--secondary-color)';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                
                // Preview image if it's an image file
                if (file.type.startsWith('image/')) {
                    this.previewImage(file, label);
                }
            }
        });
    }

    previewImage(file, label) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-top: 8px;
                ">
            `;
            label.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
}

// ===== Animation Manager =====
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // Add CSS animations
        this.addAnimationStyles();
        
        // Initialize intersection observer for scroll animations
        this.initScrollAnimations();
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .notification-icon {
                font-size: 1.2em;
            }
            
            .notification-message {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                }
            });
        }, { threshold: 0.1 });

        // Observe sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => observer.observe(section));
    }
}

// ===== Touch Enhancement =====
class TouchEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => this.addTouchFeedback(button));
        
        // Add touch feedback to file labels
        const fileLabels = document.querySelectorAll('.file-label');
        fileLabels.forEach(label => this.addTouchFeedback(label));
    }

    addTouchFeedback(element) {
        element.addEventListener('touchstart', () => {
            element.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        });
        
        element.addEventListener('touchcancel', () => {
            element.style.transform = '';
        });
    }
}

// ===== Application Initialization =====
class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.cameraManager = new CameraManager();
        this.formManager = new FormManager();
        this.fileInputEnhancer = new FileInputEnhancer();
        this.animationManager = new AnimationManager();
        this.touchEnhancer = new TouchEnhancer();
        
        this.init();
    }

    async init() {
        // Initialize camera
        await this.cameraManager.init();
        
        // Add page load animation
        this.addPageLoadAnimation();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        console.log('Smart Attendance System initialized successfully');
    }

    addPageLoadAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.style.transition = 'all 0.6s ease-out';
            document.body.style.opacity = '1';
            document.body.style.transform = 'translateY(0)';
        }, 100);
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit forms
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.form) {
                    activeElement.form.dispatchEvent(new Event('submit'));
                }
            }
            
            // Escape to close notifications
            if (e.key === 'Escape') {
                const notifications = document.querySelectorAll('.notification');
                notifications.forEach(notification => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                });
            }
        });
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// ===== Cleanup on page unload =====
window.addEventListener('beforeunload', () => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
});