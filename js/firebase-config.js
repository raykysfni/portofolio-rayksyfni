import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDz8gFeb_rREwChVBGFtCIHIecx_EboiAs",
    authDomain: "portofolioproject-raya.firebaseapp.com",
    projectId: "portofolioproject-raya",
    storageBucket: "portofolioproject-raya.firebasestorage.app",
    messagingSenderId: "159781416251",
    appId: "1:159781416251:web:1589e68e304c4a7963db1e",
    measurementId: "G-PKG63MERDR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Fungsi pembantu umum untuk media dan peta
export function parseMediaUrls(input) {
    if (!input) return [];
    return input.split(/[\n,]+/).map(url => url.trim()).filter(url => url.length > 0);
}

export function isVideoUrl(url) {
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
}

export function updateMapIframe(containerId, iframeId, locationName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const loc = encodeURIComponent(locationName || "Indonesia");
    const targetUrl = `https://maps.google.com/maps?q=${loc}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
    container.innerHTML = `<iframe id="${iframeId}" class="w-full h-full border-0" src="${targetUrl}" loading="lazy" allowfullscreen></iframe>`;
}