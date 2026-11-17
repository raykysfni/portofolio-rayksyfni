import { initAuth, hasAdminAccess } from './auth.js';
import { initUI } from './ui-settings.js';
import { initPublicPortfolio } from './portfolio-public.js';
import { initAdminPanel } from './admin-panel.js';

window.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initUI(hasAdminAccess);
    initPublicPortfolio();
    initAdminPanel();
});