import { db, parseMediaUrls } from './firebase-config.js';
import { projectsCache, journeyCache } from './portfolio-public.js';
import { doc, setDoc, collection, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initAdminPanel() {
    // Subtab Admin Navigation
    window.switchAdminSubtab = function(subId) {
        document.querySelectorAll('.admin-subtab').forEach(st => st.classList.remove('active'));
        document.querySelectorAll('.subnav-btn').forEach(btn => {
            btn.classList.remove('bg-apple-accent', 'text-white', 'font-semibold');
            btn.classList.add('text-apple-subtext');
        });

        document.getElementById(`admin-subtab-${subId}`).classList.add('active');
        const activeSub = document.getElementById(`subnav-${subId}`);
        activeSub.classList.add('bg-apple-accent', 'text-white', 'font-semibold');
        activeSub.classList.remove('text-apple-subtext');
    };

    // Simpan Perubahan Profil
    window.saveProfileRealtime = async () => {
        const saveBtn = document.getElementById('btn-save-profile');
        saveBtn.disabled = true;

        try {
            const img = document.getElementById('edit-img').value;
            const name = document.getElementById('edit-name').value;
            const role = document.getElementById('edit-role').value;
            const heroBadge = document.getElementById('edit-hero-badge').value;
            const email = document.getElementById('edit-email').value;
            const ttl = document.getElementById('edit-ttl').value;
            const gender = document.getElementById('edit-gender').value;
            const status = document.getElementById('edit-status').value;
            const bio = document.getElementById('edit-bio').value;
            const hardskills = document.getElementById('edit-hardskills').value;
            const softskills = document.getElementById('edit-softskills').value;
            const birthplaceText = document.getElementById('edit-birthplace-text').value;
            const domicileText = document.getElementById('edit-domicile-text').value;

            await setDoc(doc(db, "portfolio", "profile"), {
                name, role, heroBadge, email, ttl, gender, status, img, bio,
                hardskills, softskills, birthplaceText, domicileText
            });
            alert("✓ Profil berhasil disimpan!");
        } catch (err) { alert("Gagal menyimpan: " + err.message); }
        finally { saveBtn.disabled = false; }
    };

    // Kelola Proyek
    window.addOrUpdateProjectRealtime = async () => {
        const submitBtn = document.getElementById('proj-submit-btn');
        submitBtn.disabled = true;

        try {
            const editId = document.getElementById('edit-proj-id').value;
            const title = document.getElementById('add-proj-title').value;
            const role = document.getElementById('add-proj-role').value;
            const link = document.getElementById('add-proj-link').value;
            const rawMedia = document.getElementById('add-proj-media').value;
            const mediaList = parseMediaUrls(rawMedia);
            const desc = document.getElementById('add-proj-desc').value;

            if(!title) return alert("Judul proyek wajib diisi!");

            const data = { title, role, link, mediaList, desc };

            if(editId) {
                await updateDoc(doc(db, "projects", editId), data);
                alert("✓ Proyek berhasil di-update!");
            } else {
                await addDoc(collection(db, "projects"), data);
                alert("✓ Proyek baru berhasil ditambahkan!");
            }
            window.resetProjForm();
        } catch (err) { alert("Gagal menyimpan: " + err.message); }
        finally { submitBtn.disabled = false; }
    };

    window.prepareEditProject = (id) => {
        const p = projectsCache[id];
        if(!p) return;
        document.getElementById('edit-proj-id').value = id;
        document.getElementById('add-proj-title').value = p.title || '';
        document.getElementById('add-proj-role').value = p.role || '';
        document.getElementById('add-proj-link').value = p.link || '';
        document.getElementById('add-proj-media').value = (p.mediaList || []).join(',\n');
        document.getElementById('add-proj-desc').value = p.desc || '';

        document.getElementById('proj-form-title').innerText = "Edit Proyek: " + p.title;
        document.getElementById('proj-submit-btn').innerText = "Simpan Perubahan";
        document.getElementById('proj-cancel-btn').classList.remove('hidden');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    };

    window.resetProjForm = () => {
        document.getElementById('edit-proj-id').value = '';
        document.getElementById('add-proj-title').value = '';
        document.getElementById('add-proj-role').value = '';
        document.getElementById('add-proj-link').value = '';
        document.getElementById('add-proj-media').value = '';
        document.getElementById('add-proj-desc').value = '';
        document.getElementById('proj-form-title').innerText = "Tambah Proyek Baru";
        document.getElementById('proj-submit-btn').innerText = "Upload Proyek Ke Web";
        document.getElementById('proj-cancel-btn').classList.add('hidden');
    };

    // Kelola Jurnal Perjalanan
    window.addOrUpdateJourneyRealtime = async () => {
        const submitBtn = document.getElementById('journey-submit-btn');
        submitBtn.disabled = true;

        try {
            const editId = document.getElementById('edit-journey-id').value;
            const title = document.getElementById('add-journey-title').value;
            const location = document.getElementById('add-journey-loc').value;
            const rating = document.getElementById('add-journey-rating').value;
            const size = document.getElementById('add-journey-size').value;
            const rawMedia = document.getElementById('add-journey-media').value;
            const mediaList = parseMediaUrls(rawMedia);
            const desc = document.getElementById('add-journey-desc').value;
            const tips = document.getElementById('add-journey-tips').value;

            if(!title || mediaList.length === 0) return alert("Judul & minimal 1 URL media wajib diisi!");

            const data = { title, location, rating, size, mediaList, desc, tips };

            if(editId) {
                await updateDoc(doc(db, "journey", editId), data);
                alert("✓ Perjalanan berhasil di-update!");
            } else {
                data.likes = 0;
                data.comments = [];
                await addDoc(collection(db, "journey"), data);
                alert("✓ Perjalanan baru berhasil ditambahkan!");
            }
            window.resetJourneyForm();
        } catch (err) { alert("Gagal menyimpan: " + err.message); }
        finally { submitBtn.disabled = false; }
    };

    window.prepareEditJourney = (id) => {
        const j = journeyCache[id];
        if(!j) return;
        document.getElementById('edit-journey-id').value = id;
        document.getElementById('add-journey-title').value = j.title || '';
        document.getElementById('add-journey-loc').value = j.location || '';
        document.getElementById('add-journey-rating').value = j.rating || '5';
        document.getElementById('add-journey-size').value = j.size || 'normal';
        document.getElementById('add-journey-media').value = (j.mediaList || []).join(',\n');
        document.getElementById('add-journey-desc').value = j.desc || '';
        document.getElementById('add-journey-tips').value = j.tips || '';

        document.getElementById('journey-form-title').innerText = "Edit Perjalanan: " + j.title;
        document.getElementById('journey-submit-btn').innerText = "Simpan Perubahan";
        document.getElementById('journey-cancel-btn').classList.remove('hidden');
        window.scrollTo({ top: 200, behavior: 'smooth' });
    };

    window.resetJourneyForm = () => {
        document.getElementById('edit-journey-id').value = '';
        document.getElementById('add-journey-title').value = '';
        document.getElementById('add-journey-loc').value = '';
        document.getElementById('add-journey-media').value = '';
        document.getElementById('add-journey-desc').value = '';
        document.getElementById('add-journey-tips').value = '';
        document.getElementById('journey-form-title').innerText = "Tambah Jurnal Perjalanan Baru";
        document.getElementById('journey-submit-btn').innerText = "Upload Perjalanan Ke Web";
        document.getElementById('journey-cancel-btn').classList.add('hidden');
    };

    window.deleteDocRealtime = async (coll, id) => {
        if(confirm("Hapus data ini secara permanen?")) {
            try {
                await deleteDoc(doc(db, coll, id));
            } catch (err) {
                alert("Gagal menghapus: " + err.message);
            }
        }
    };

    // Cropper.js Logic
    let cropperInstance = null;
    window.openCropperModal = function() {
        const rawMedia = document.getElementById('add-journey-media').value;
        const firstUrl = rawMedia.split(/[\n,]+/)[0];
        if(!firstUrl) return alert("Masukkan minimal satu URL Gambar di kolom media terlebih dahulu!");

        const targetImg = document.getElementById('cropper-target-img');
        targetImg.src = firstUrl.trim();
        document.getElementById('cropper-modal').classList.remove('hidden');

        if(cropperInstance) cropperInstance.destroy();
        cropperInstance = new Cropper(targetImg, { aspectRatio: 16 / 9, viewMode: 1 });
    };

    window.closeCropperModal = function() {
        document.getElementById('cropper-modal').classList.add('hidden');
        if(cropperInstance) cropperInstance.destroy();
    };

    window.cropperZoom = function(val) { if(cropperInstance) cropperInstance.zoom(val); };
    window.cropperRotate = function(deg) { if(cropperInstance) cropperInstance.rotate(deg); };

    window.applyCroppedImage = function() {
        if(!cropperInstance) return;
        const canvas = cropperInstance.getCroppedCanvas({ width: 800, height: 450 });
        document.getElementById('add-journey-media').value = canvas.toDataURL('image/jpeg');
        window.closeCropperModal();
        alert("✓ Gambar berhasil di-crop!");
    };
}