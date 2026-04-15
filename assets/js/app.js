/**
 * Al-Muntadhar Network - Professional SPA Engine
 * Frontend Architect: Professional Software Engineer
 */

const App = {
    config: {
        pagesDir: 'pages',
        dataDir: 'data',
        defaultPage: 'home',
        themeKey: 'al_muntadhar_theme',
        tasbeehKey: 'al_muntadhar_tasbeeh'
    },

    state: {
        currentPage: '',
        isTransitioning: false
    },

    /**
     * Initialize the application
     */
    init() {
        this.initTheme();
        this.bindEvents();
        this.loadInitialPage();
        console.log('🚀 Al-Muntadhar Network Initialized');
    },

    /**
     * Bind global events
     */
    bindEvents() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.loadPage(event.state.page, false);
            }
        });
    },

    /**
     * Theme Management
     */
    initTheme() {
        const savedTheme = localStorage.getItem(this.config.themeKey) || 'dark-mode';
        document.body.className = savedTheme;
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light-mode' : 'dark-mode';
        document.body.className = newTheme;
        localStorage.setItem(this.config.themeKey, newTheme);
        this.updateThemeIcon(newTheme);
    },

    updateThemeIcon(theme) {
        const btn = document.getElementById('theme-btn');
        if (btn) {
            btn.innerText = theme === 'dark-mode' ? '☀️' : '🌙';
        }
    },

    /**
     * SPA Router
     */
    async loadPage(pageName, pushState = true) {
        if (this.state.isTransitioning) return;
        
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        this.state.isTransitioning = true;
        this.state.currentPage = pageName;

        // Show Loader
        appContainer.innerHTML = `
            <div class="loader-container">
                <span class="loader"></span>
            </div>
        `;

        try {
            const response = await fetch(`${this.config.pagesDir}/${pageName}.html`);
            if (!response.ok) throw new Error(`Page ${pageName} not found`);
            
            const html = await response.text();
            
            // Apply Fade-out effect (optional, here we just replace)
            appContainer.innerHTML = `<div class="fade-in">${html}</div>`;

            // Update History
            if (pushState) {
                window.history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            // Initialize Page Specific Logic
            this.initPageLogic(pageName);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Navigation Error:', error);
            appContainer.innerHTML = `
                <div class="content-card" style="text-align:center; border-right-color: #e74c3c;">
                    <h3 style="color:#e74c3c">عذراً، حدث خطأ!</h3>
                    <p>تعذر تحميل الصفحة المطلوبة. يرجى التأكد من اتصالك بالإنترنت.</p>
                    <button class="back-btn" onclick="App.loadPage('home')">العودة للرئيسية</button>
                </div>
            `;
        } finally {
            this.state.isTransitioning = false;
        }
    },

    loadInitialPage() {
        const hash = window.location.hash.replace('#', '');
        const page = hash || this.config.defaultPage;
        this.loadPage(page);
    },

    /**
     * Page Logic Dispatcher
     */
    initPageLogic(pageName) {
        switch (pageName) {
            case 'sahaba':
                this.fetchAndRender(`${this.config.dataDir}/sahaba.json`, this.renderers.cards);
                break;
            case 'mazalim':
                this.fetchAndRender(`${this.config.dataDir}/mazalim.json`, this.renderers.timeline);
                break;
            case 'research':
                this.fetchAndRender(`${this.config.dataDir}/research.json`, this.renderers.articles);
                break;
            case 'aqeeda':
            case 'shubuhat':
            case 'fadhail':
            case 'daif':
            case 'mukhalifeen':
                this.fetchContentSection(pageName);
                break;
            case 'shia':
                this.initShiaPage();
                break;
            case 'misbaha':
                this.initMisbaha();
                break;
        }
    },

    /**
     * Data Fetching
     */
    async fetchAndRender(url, renderer) {
        const container = document.getElementById('data-container');
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (container) {
                container.innerHTML = renderer(data);
            }
        } catch (error) {
            console.error('Data Fetch Error:', error);
            if (container) container.innerHTML = '<p style="text-align:center">فشل تحميل البيانات.</p>';
        }
    },

    async fetchContentSection(sectionKey) {
        const container = document.getElementById('data-container');
        try {
            const response = await fetch(`${this.config.dataDir}/content.json`);
            const data = await response.json();
            if (container && data[sectionKey]) {
                container.innerHTML = this.renderers.cards(data[sectionKey]);
            }
        } catch (error) {
            console.error('Content Fetch Error:', error);
        }
    },

    /**
     * Renderers
     */
    renderers: {
        cards(data) {
            if (!Array.isArray(data)) return '';
            return data.map(item => `
                <div class="content-card">
                    <h3>${item.title || item.name}</h3>
                    <p>${item.desc || item.details}</p>
                    ${item.source ? `<span class="source">المصدر: ${item.source}</span>` : ''}
                </div>
            `).join('');
        },

        timeline(data) {
            if (!Array.isArray(data)) return '';
            return data.map(item => `
                <div class="timeline-item">
                    <span class="timeline-date">${item.date}</span>
                    <div class="content-card">
                        <h3>${item.title}</h3>
                        <p>${item.desc}</p>
                        ${item.source ? `<span class="source">المصدر: ${item.source}</span>` : ''}
                    </div>
                </div>
            `).join('');
        },

        articles(data) {
            if (!Array.isArray(data)) return '';
            return data.map(item => `
                <div class="content-card" style="border-right-width: 8px;">
                    <h3>${item.title}</h3>
                    <div style="margin-bottom: 15px; font-size: 0.9rem; color: var(--secondary); font-weight: bold;">
                        بلمسة: ${item.author}
                    </div>
                    <div style="white-space: pre-line; border-top: 1px solid var(--border); padding-top: 15px;">
                        ${item.body}
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Feature: Misbaha (Electronic Rosary)
     */
    initMisbaha() {
        const countDisplay = document.getElementById('tasbeeh-count');
        if (!countDisplay) return;

        let count = parseInt(localStorage.getItem(this.config.tasbeehKey)) || 0;
        countDisplay.innerText = count;

        window.handleTasbeeh = (action) => {
            if (action === 'add') {
                count++;
                // Haptic feedback simulation
                if ('vibrate' in navigator) navigator.vibrate(50);
            } else if (action === 'reset') {
                if (confirm('هل تريد تصفير العداد؟')) count = 0;
            }
            countDisplay.innerText = count;
            localStorage.setItem(this.config.tasbeehKey, count);
        };
    },

    initShiaPage() {
        // Any specific logic for Shia page if needed
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());
