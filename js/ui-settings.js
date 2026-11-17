export function initUI(checkAdminAccess) {
    // Efek teks ketik pada halaman pembuka
    const typingText = document.getElementById('typing-text');
    const phrases = ["Muhammad Raya Kasyafani", "Web Enthusiast", "Digital Traveler"];
    let phraseIdx = 0, charIdx = 0, isDeleting = false;

    function type() {
        if (!typingText) return;
        const current = phrases[phraseIdx];
        typingText.textContent = isDeleting ? current.substring(0, charIdx--) : current.substring(0, charIdx++);
        if (!isDeleting && charIdx > current.length) { isDeleting = true; setTimeout(type, 1500); }
        else if (isDeleting && charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(type, 500); }
        else { setTimeout(type, isDeleting ? 50 : 100); }
    }
    type();

    // Tutup layar sambutan
    window.closeIntro = function() {
        const intro = document.getElementById('intro-screen');
        intro.style.opacity = '0';
        setTimeout(() => intro.style.display = 'none', 700);
        sessionStorage.setItem('session_seen_intro', 'true');
        window.switchTab('home', false);
        history.replaceState({ tab: 'home' }, '', '#home');
    };

    // Pindah Tab Utama
    function renderTabContent(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'text-apple-text', 'dark:text-white', 'bg-black/5', 'dark:bg-white/5');
            btn.classList.add('text-apple-subtext');
        });

        const targetSection = document.getElementById(`tab-${tabId}`);
        if (targetSection) targetSection.classList.add('active');

        const activeBtn = document.getElementById(`nav-${tabId}`);
        if (activeBtn && tabId !== 'admin') {
            activeBtn.classList.add('active', 'text-apple-text', 'dark:text-white', 'bg-black/5', 'dark:bg-white/5');
            activeBtn.classList.remove('text-apple-subtext');
        }

        sessionStorage.setItem('session_active_tab', tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.switchTab = function(tabId, pushToHistory = true) {
        renderTabContent(tabId);
        if (pushToHistory) {
            const currentHash = window.location.hash.replace('#', '');
            if (currentHash !== tabId) {
                history.pushState({ tab: tabId }, '', `#${tabId}`);
            }
        }
    };

    window.addEventListener('popstate', (e) => {
        let targetTab = 'home';
        if (e.state && e.state.tab) targetTab = e.state.tab;
        else if (window.location.hash) targetTab = window.location.hash.replace('#', '');

        if (targetTab === 'admin' && !checkAdminAccess()) targetTab = 'home';
        renderTabContent(targetTab);
    });

    // Sidebar Compact Toggle
    let isCompact = false;
    window.toggleSidebarCompact = function() {
        isCompact = !isCompact;
        document.body.classList.toggle('sidebar-compact', isCompact);
        const icon = document.getElementById('sidebar-toggle-icon');
        if (icon) icon.className = isCompact ? "fa-solid fa-angles-right text-xs" : "fa-solid fa-angles-left text-xs";
    };

    // Modal Pengaturan Tampilan Pengunjung
    window.openVisitorSettings = function() {
        updateSettingsButtonHighlight();
        document.getElementById('visitor-settings-modal').classList.remove('hidden');
    };
    window.closeVisitorSettings = function() {
        document.getElementById('visitor-settings-modal').classList.add('hidden');
    };

    function updateSettingsButtonHighlight() {
        const activeTheme = sessionStorage.getItem('session_theme') || 'light';
        const activeView = sessionStorage.getItem('session_view_mode') || (window.innerWidth < 768 ? 'mobile' : 'desktop');

        const lightBtn = document.getElementById('btn-theme-light');
        const darkBtn = document.getElementById('btn-theme-dark');
        const deskBtn = document.getElementById('btn-view-desktop');
        const mobBtn = document.getElementById('btn-view-mobile');

        [lightBtn, darkBtn, deskBtn, mobBtn].forEach(btn => {
            if (btn) btn.classList.remove('ring-2', 'ring-apple-accent', 'font-bold');
        });

        if (activeTheme === 'dark' && darkBtn) darkBtn.classList.add('ring-2', 'ring-apple-accent', 'font-bold');
        if (activeTheme === 'light' && lightBtn) lightBtn.classList.add('ring-2', 'ring-apple-accent', 'font-bold');
        if (activeView === 'desktop' && deskBtn) deskBtn.classList.add('ring-2', 'ring-apple-accent', 'font-bold');
        if (activeView === 'mobile' && mobBtn) mobBtn.classList.add('ring-2', 'ring-apple-accent', 'font-bold');
    }

    window.setTheme = function(mode, save = true) {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        if (save) sessionStorage.setItem('session_theme', mode);
        updateSettingsButtonHighlight();
    };

    window.setViewMode = function(mode, shouldCloseModal = true) {
        const body = document.getElementById('main-body');
        const sidebar = document.getElementById('sidebar-nav');
        const menuList = document.getElementById('sidebar-menu-list');
        const footerSettings = document.getElementById('sidebar-footer-settings');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        const main = document.getElementById('main-content');
        const vpMeta = document.getElementById('viewport-meta');

        sessionStorage.setItem('session_view_mode', mode);

        if (mode === 'mobile') {
            if (vpMeta) vpMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
            body.className = "bg-apple-bg dark:bg-apple-darkbg text-apple-text dark:text-apple-darktext min-h-screen flex flex-col antialiased selection:bg-apple-accent selection:text-white pb-24 max-w-md mx-auto shadow-2xl border-x border-apple-border dark:border-apple-darkborder";
            sidebar.className = "w-full bg-white/80 dark:bg-apple-darkcard/80 backdrop-blur-md border-b border-apple-border dark:border-apple-darkborder flex flex-col justify-between p-4 z-30";
            menuList.className = "flex space-x-2 overflow-x-auto pb-1 text-xs font-medium";
            footerSettings.className = "pt-3 border-t border-apple-border dark:border-apple-darkborder mt-3";
            if (collapseBtn) collapseBtn.classList.add('hidden');
            main.className = "flex-1 p-5 w-full transition-all";
        } else {
            if (vpMeta) vpMeta.setAttribute('content', 'width=1100');
            body.className = "bg-apple-bg dark:bg-apple-darkbg text-apple-text dark:text-apple-darktext min-h-screen flex flex-row antialiased selection:bg-apple-accent selection:text-white pb-0";
            sidebar.className = "w-64 bg-white/80 dark:bg-apple-darkcard/80 backdrop-blur-md border-r border-apple-border dark:border-apple-darkborder fixed h-screen flex flex-col justify-between p-6 z-30";
            menuList.className = "flex flex-col space-y-1 text-xs font-medium";
            footerSettings.className = "pt-4 border-t border-apple-border dark:border-apple-darkborder mt-auto";
            if (collapseBtn) collapseBtn.classList.remove('hidden');
            main.className = "flex-1 ml-64 p-12 max-w-6xl mx-auto w-full transition-all";
        }

        updateSettingsButtonHighlight();
        if (shouldCloseModal) window.closeVisitorSettings();
    };

    // Pulihkan state sesi saat refresh
    const currentTheme = sessionStorage.getItem('session_theme') || 'light';
    window.setTheme(currentTheme, false);

    const savedViewMode = sessionStorage.getItem('session_view_mode');
    if (savedViewMode) window.setViewMode(savedViewMode, false);
    else updateSettingsButtonHighlight();

    const hasSeenIntro = sessionStorage.getItem('session_seen_intro') === 'true';
    if (hasSeenIntro) {
        const intro = document.getElementById('intro-screen');
        if (intro) intro.style.display = 'none';

        const savedTab = window.location.hash.replace('#', '') || sessionStorage.getItem('session_active_tab') || 'home';
        if (savedTab === 'admin' && !checkAdminAccess()) window.switchTab('home', false);
        else window.switchTab(savedTab, false);
    } else {
        window.location.hash = '';
        window.switchTab('home', false);
        history.replaceState({ tab: 'home' }, '', window.location.pathname);
    }
}