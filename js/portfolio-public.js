import { db, parseMediaUrls, isVideoUrl, updateMapIframe } from './firebase-config.js';
import { doc, onSnapshot, collection, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const projectsCache = {};
export const journeyCache = {};

export function initPublicPortfolio() {
    let activeJourneyId = null;
    let activeModalIndex = 0;
    let cardSlideshowIntervals = {};
    let projectSlideshowIntervals = {};

    // 1. Profil Realtime Sync
    onSnapshot(doc(db, "portfolio", "profile"), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const name = data.name || "Muhammad Raya Kasyafani";
            const role = data.role || "Pelajar SMA | Web Enthusiast & Digital Traveler";
            const heroBadge = data.heroBadge || "Siswa SMA & Pengembara Digital";
            const email = data.email || "rayakasyafani2021@gmail.com";
            const ttl = data.ttl || "Bogor, 30 Juli 2008";
            const gender = data.gender || "Laki-Laki";
            const status = data.status || "Pelajar SMA";
            const img = data.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
            const bio = data.bio || "Selamat datang di portofolio digital saya.";
            const hardskills = data.hardskills || "HTML5, Tailwind CSS, JS, Photo & Video Editing, CAD";
            const softskills = data.softskills || "Manajemen Waktu, Komunikasi, Problem Solving";
            const birthText = data.birthplaceText || "Bogor, Jawa Barat";
            const domText = data.domicileText || "Jember, Jawa Timur";

            document.getElementById('sidebar-display-name').innerText = name;
            document.getElementById('display-name').innerText = name;
            document.getElementById('display-role').innerText = role;
            document.getElementById('display-hero-badge').innerText = heroBadge;
            
            const profileImgElem = document.getElementById('display-profile-img');
            if (profileImgElem) {
                profileImgElem.src = img;
                profileImgElem.onerror = () => { profileImgElem.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500"; };
            }

            document.getElementById('display-hero-bio').innerText = bio;
            document.getElementById('display-summary').innerText = bio;
            document.getElementById('display-email').innerText = email;
            document.getElementById('display-email-link').href = `mailto:${email}`;
            document.getElementById('display-ttl').innerText = ttl;
            document.getElementById('display-gender').innerText = gender;
            document.getElementById('display-status').innerText = status;
            document.getElementById('display-hardskills').innerText = hardskills;
            document.getElementById('display-softskills').innerText = softskills;
            document.getElementById('display-birthplace-text').innerText = birthText;
            document.getElementById('display-domicile-text').innerText = domText;

            updateMapIframe('birthplace-map-container', 'display-birthplace-map', birthText);
            updateMapIframe('domicile-map-container', 'display-domicile-map', domText);

            // Isi form admin jika tersedia
            const editName = document.getElementById('edit-name');
            if (editName) {
                editName.value = name;
                document.getElementById('edit-role').value = role;
                document.getElementById('edit-hero-badge').value = heroBadge;
                document.getElementById('edit-email').value = email;
                document.getElementById('edit-ttl').value = ttl;
                document.getElementById('edit-gender').value = gender;
                document.getElementById('edit-status').value = status;
                document.getElementById('edit-img').value = data.img || "";
                document.getElementById('edit-bio').value = bio;
                document.getElementById('edit-hardskills').value = hardskills;
                document.getElementById('edit-softskills').value = softskills;
                document.getElementById('edit-birthplace-text').value = birthText;
                document.getElementById('edit-domicile-text').value = domText;
            }
        }
    });

    // 2. Projects Realtime Sync
    onSnapshot(collection(db, "projects"), (snapshot) => {
        const pubContainer = document.getElementById('projects-container');
        const adminContainer = document.getElementById('admin-projects-list');
        pubContainer.innerHTML = '';
        if (adminContainer) adminContainer.innerHTML = '';
        
        Object.values(projectSlideshowIntervals).forEach(clearInterval);
        projectSlideshowIntervals = {};
        Object.keys(projectsCache).forEach(k => delete projectsCache[k]);

        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const id = docSnap.id;
            projectsCache[id] = p;

            const mediaList = p.mediaList || parseMediaUrls(p.media) || [];
            const projLink = p.link || '#';

            let slidesHtml = '';
            if (mediaList.length > 0) {
                mediaList.forEach((url) => {
                    slidesHtml += isVideoUrl(url)
                        ? `<video class="w-full h-full object-cover shrink-0" src="${url}" muted loop playsinline></video>`
                        : `<img src="${url}" class="w-full h-full object-cover shrink-0">`;
                });
            } else {
                slidesHtml = `<div class="w-full h-full bg-purple-950/20 flex items-center justify-center text-purple-400 font-mono text-xs"><i class="fa-solid fa-code text-2xl"></i></div>`;
            }

            pubContainer.innerHTML += `
                <div class="bg-white dark:bg-apple-darkcard border border-apple-border dark:border-apple-darkborder p-5 rounded-2xl shadow-sm space-y-4">
                    ${mediaList.length > 0 ? `
                    <div class="relative aspect-video rounded-xl overflow-hidden bg-black">
                        <div id="proj-slider-${id}" class="w-full h-full flex transition-transform duration-500">
                            ${slidesHtml}
                        </div>
                        <div class="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-[10px] font-mono backdrop-blur-sm">
                            <i class="fa-solid fa-layer-group mr-1"></i> ${mediaList.length} Media
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="flex justify-between items-center text-xs font-mono">
                        <span class="font-bold text-base text-purple-600">${p.title}</span>
                        <span class="text-apple-subtext">${p.role}</span>
                    </div>
                    <p class="text-apple-subtext text-xs leading-relaxed">${p.desc}</p>
                    
                    <div class="flex items-center justify-between pt-3 border-t border-apple-border/40 dark:border-apple-darkborder/40">
                        <a href="${projLink}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-purple-600 text-white text-xs font-medium rounded-xl hover:bg-purple-700 transition-all inline-flex items-center gap-2">
                            <span>Kunjungi Proyek</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </a>
                    </div>
                </div>
            `;

            if (mediaList.length > 1) {
                let slideIdx = 0;
                projectSlideshowIntervals[id] = setInterval(() => {
                    slideIdx = (slideIdx + 1) % mediaList.length;
                    const slider = document.getElementById(`proj-slider-${id}`);
                    if (slider) slider.style.transform = `translateX(-${slideIdx * 100}%)`;
                }, 3500);
            }

            if (adminContainer) {
                adminContainer.innerHTML += `
                    <div class="bg-white dark:bg-apple-darkcard border border-apple-border dark:border-apple-darkborder p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div>
                            <strong class="text-purple-600 font-bold block">${p.title}</strong>
                            <span class="text-apple-subtext text-[11px]">${p.role} • ${mediaList.length} Media</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="prepareEditProject('${id}')" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-apple-accent rounded-lg font-medium"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit</button>
                            <button onclick="deleteDocRealtime('projects', '${id}')" class="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-lg font-medium"><i class="fa-solid fa-trash mr-1"></i> Hapus</button>
                        </div>
                    </div>
                `;
            }
        });
    });

    // 3. Journey Realtime Sync
    onSnapshot(collection(db, "journey"), (snapshot) => {
        const pubContainer = document.getElementById('journey-container');
        const adminContainer = document.getElementById('admin-journey-list');
        pubContainer.innerHTML = '';
        if (adminContainer) adminContainer.innerHTML = '';
        
        Object.values(cardSlideshowIntervals).forEach(clearInterval);
        cardSlideshowIntervals = {};
        Object.keys(journeyCache).forEach(k => delete journeyCache[k]);

        snapshot.forEach(docSnap => {
            const j = docSnap.data();
            const id = docSnap.id;
            journeyCache[id] = j;

            const mediaList = j.mediaList || parseMediaUrls(j.media) || ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"];
            const colSpanClass = j.size === 'full' ? 'md:col-span-2' : '';
            const starsHtml = '⭐'.repeat(parseInt(j.rating || 5));

            let slidesHtml = '';
            mediaList.forEach((url) => {
                slidesHtml += isVideoUrl(url)
                    ? `<video class="w-full h-full object-cover shrink-0" src="${url}" muted loop playsinline></video>`
                    : `<img src="${url}" class="w-full h-full object-cover shrink-0">`;
            });

            pubContainer.innerHTML += `
                <div onclick="openJourneyModal('${id}')" class="bg-white dark:bg-apple-darkcard border border-apple-border dark:border-apple-darkborder p-5 rounded-2xl shadow-sm space-y-3 cursor-pointer group hover:shadow-md transition-all ${colSpanClass}">
                    <div class="relative aspect-video rounded-xl overflow-hidden bg-black">
                        <div id="card-slider-${id}" class="w-full h-full flex transition-transform duration-500">
                            ${slidesHtml}
                        </div>
                        <div class="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-[10px] font-mono backdrop-blur-sm">
                            <i class="fa-solid fa-layer-group mr-1"></i> ${mediaList.length} Media
                        </div>
                    </div>
                    <div class="flex justify-between items-center text-xs font-mono text-apple-subtext">
                        <span><i class="fa-solid fa-location-dot text-emerald-500 mr-1"></i> ${j.location}</span>
                        <span class="text-amber-500">${starsHtml}</span>
                    </div>
                    <h3 class="font-jakarta font-bold text-base group-hover:text-emerald-600 transition-colors">${j.title}</h3>
                    <p class="text-apple-subtext text-xs leading-relaxed line-clamp-2">${j.desc}</p>
                    <div class="flex justify-between items-center text-[11px] font-mono text-apple-subtext pt-2 border-t border-apple-border/40 dark:border-apple-darkborder/40">
                        <span>❤️ ${j.likes || 0} Suka</span>
                        <span class="text-emerald-600 font-semibold">Lihat Detail & Komentar <i class="fa-solid fa-arrow-right ml-1"></i></span>
                    </div>
                </div>
            `;

            if (mediaList.length > 1) {
                let slideIdx = 0;
                cardSlideshowIntervals[id] = setInterval(() => {
                    slideIdx = (slideIdx + 1) % mediaList.length;
                    const slider = document.getElementById(`card-slider-${id}`);
                    if (slider) slider.style.transform = `translateX(-${slideIdx * 100}%)`;
                }, 3000);
            }

            if (adminContainer) {
                adminContainer.innerHTML += `
                    <div class="bg-white dark:bg-apple-darkcard border border-apple-border dark:border-apple-darkborder p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div>
                            <strong class="font-bold block">${j.title}</strong>
                            <span class="text-apple-subtext text-[11px]">${j.location} • ${mediaList.length} Media • Rating: ${j.rating || 5}/5</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="prepareEditJourney('${id}')" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-apple-accent rounded-lg font-medium"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit</button>
                            <button onclick="deleteDocRealtime('journey', '${id}')" class="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-lg font-medium"><i class="fa-solid fa-trash mr-1"></i> Hapus</button>
                        </div>
                    </div>
                `;
            }
        });
    });

    // Modal Detail Journey
    window.openJourneyModal = (id) => {
        const j = journeyCache[id];
        if (!j) return;
        activeJourneyId = id;
        activeModalIndex = 0;

        const mediaList = j.mediaList || parseMediaUrls(j.media) || [];
        
        document.getElementById('modal-journey-loc').innerText = j.location || 'Indonesia';
        document.getElementById('modal-journey-title').innerText = j.title || 'Petualangan';
        document.getElementById('modal-journey-stars').innerText = '⭐'.repeat(parseInt(j.rating || 5));
        document.getElementById('modal-journey-likes').innerText = `${j.likes || 0} Suka`;
        document.getElementById('modal-journey-desc').innerText = j.desc || 'Belum ada catatan.';
        document.getElementById('modal-journey-tips').innerText = j.tips || 'Tidak ada tips khusus.';

        const slider = document.getElementById('modal-slideshow-container');
        const dots = document.getElementById('modal-slideshow-dots');
        slider.innerHTML = '';
        dots.innerHTML = '';

        mediaList.forEach((url, i) => {
            slider.innerHTML += isVideoUrl(url)
                ? `<video controls class="w-full h-full object-contain shrink-0 bg-black" src="${url}"></video>`
                : `<img src="${url}" class="w-full h-full object-contain shrink-0 bg-black">`;
            
            dots.innerHTML += `<div onclick="setModalSlide(${i})" class="w-2 h-2 rounded-full cursor-pointer transition-all ${i === 0 ? 'bg-white w-5' : 'bg-white/50'}"></div>`;
        });

        updateMapIframe('modal-map-container', 'modal-journey-map', j.location);
        renderModalComments(j.comments || []);

        document.getElementById('journey-detail-modal').classList.remove('hidden');
        updateModalSliderPosition();
    };

    window.closeJourneyModal = () => {
        document.getElementById('journey-detail-modal').classList.add('hidden');
        activeJourneyId = null;
    };

    window.changeModalSlide = (dir) => {
        const j = journeyCache[activeJourneyId];
        if (!j) return;
        const mediaList = j.mediaList || parseMediaUrls(j.media) || [];
        activeModalIndex = (activeModalIndex + dir + mediaList.length) % mediaList.length;
        updateModalSliderPosition();
    };

    window.setModalSlide = (idx) => {
        activeModalIndex = idx;
        updateModalSliderPosition();
    };

    function updateModalSliderPosition() {
        const slider = document.getElementById('modal-slideshow-container');
        if (slider) slider.style.transform = `translateX(-${activeModalIndex * 100}%)`;
        
        const dots = document.getElementById('modal-slideshow-dots').children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = `w-2 h-2 rounded-full cursor-pointer transition-all ${i === activeModalIndex ? 'bg-white w-5' : 'bg-white/50'}`;
        }
    }

    window.toggleLikeCurrentJourney = async () => {
        if (!activeJourneyId) return;
        await updateDoc(doc(db, "journey", activeJourneyId), { likes: increment(1) });
        const likesElem = document.getElementById('modal-journey-likes');
        const currentLikes = parseInt(likesElem.innerText) || 0;
        likesElem.innerText = `${currentLikes + 1} Suka`;
    };

    window.addCommentCurrentJourney = async (e) => {
        e.preventDefault();
        if (!activeJourneyId) return;
        const name = document.getElementById('input-comment-name').value;
        const text = document.getElementById('input-comment-text').value;

        const newComment = { name, text, date: new Date().toLocaleDateString('id-ID') };
        await updateDoc(doc(db, "journey", activeJourneyId), { comments: arrayUnion(newComment) });

        document.getElementById('input-comment-text').value = '';
        const j = journeyCache[activeJourneyId];
        if(j) {
            j.comments = j.comments || [];
            j.comments.push(newComment);
            renderModalComments(j.comments);
        }
    };

    function renderModalComments(comments) {
        const list = document.getElementById('modal-comments-list');
        list.innerHTML = '';
        if (!comments || comments.length === 0) {
            list.innerHTML = `<p class="text-apple-subtext italic">Belum ada komentar. Jadilah yang pertama!</p>`;
            return;
        }
        comments.forEach(c => {
            list.innerHTML += `
                <div class="bg-apple-bg dark:bg-apple-darkbg p-3 rounded-xl border border-apple-border dark:border-apple-darkborder">
                    <div class="flex justify-between items-center font-bold mb-1">
                        <span>${c.name}</span>
                        <span class="text-[10px] text-apple-subtext font-mono">${c.date || ''}</span>
                    </div>
                    <p class="text-apple-subtext">${c.text}</p>
                </div>
            `;
        });
    }

    // Form Contact Pengunjung
    window.handleContactSubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const status = document.getElementById('contact-status');
        const btn = document.getElementById('contact-btn');

        status.className = "p-3 rounded-xl text-xs font-mono bg-blue-50 text-apple-accent block";
        status.innerText = "Mengirim pesan...";
        btn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if(response.ok) {
                status.className = "p-3 rounded-xl text-xs font-mono bg-emerald-50 text-emerald-600 block";
                status.innerText = "✓ Pesan berhasil terkirim!";
                form.reset();
            } else { throw new Error(); }
        } catch {
            status.className = "p-3 rounded-xl text-xs font-mono bg-emerald-50 text-emerald-600 block";
            status.innerText = "✓ Pesan berhasil dikirim!";
            form.reset();
        } finally { btn.disabled = false; }
    };
}