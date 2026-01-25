// 1. Fungsi Utama untuk Menerjemahkan Seluruh Halaman
function applyTranslations() {
    const lang = document.documentElement.lang || 'id';
    const t = translations[lang] || translations['id'];

    const elements = document.querySelectorAll("[data-key]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-key");
        if (t[key]) {
            // Jika elemen adalah input (seperti placeholder), terjemahkan placeholder-nya
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = t[key];
            } else {
                // Untuk tombol Hapus/Ubah yang ada icon, kita harus hati-hati agar icon tidak hilang
                const icon = el.querySelector(".icon");
                if (icon) {
                    el.innerHTML = `<i class="icon">${icon.innerText}</i>${t[key]}`;
                } else {
                    el.innerText = t[key];
                }
            }
        }
    });
}

// 2. Jalankan fungsi terjemahan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
});

// 3. Fungsi Modal Bank Soal (Sudah Diperbaiki)
function bukaModalBank() {
    const modal = document.getElementById('modal-bank-overlay');
    const content = document.getElementById('modal-bank-content');
    const closeBtn = document.getElementById('modal-bank-close');

    const lang = document.documentElement.lang || 'id';
    const t = translations[lang] || translations['id'];

    const titleEl = document.getElementById('modal-bank-title');
    const subtitleEl = document.getElementById('modal-bank-subtitle');
    if(titleEl) titleEl.innerText = t.bank_soal_title;
    if(subtitleEl) subtitleEl.innerText = t.bank_soal_subtitle;
    
    let options = `<option value="">${t.select_level_default}</option>`;
    for (let i = 1; i <= 10; i++) {
        // Mengambil kata "Level" dari terjemahan
        const levelLabel = t.level_label || "Level"; 
        options += `<option value="${i}">${levelLabel} ${i}</option>`;
    }

    content.innerHTML = `
        <select id="pilih-level" onchange="loadSoalSolo(this.value)" style="width:100%; padding:8px; margin-bottom:15px;">
            ${options}
        </select>
        <form id="form-bank-soal" method="POST" action="proses_bank.php">
            <div id="daftar-soal-bank"></div>
            <button type="submit" class="ubah" style="width:100%; margin-top:15px;">${t.add_selected_questions_button || 'Tambah Soal'}</button>
        </form>
    `;
    modal.style.display = 'flex';

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
}

function loadSoalSolo(lvl) {
    if(!lvl) return;
    fetch(`get_soal_solo.php?lvl=${lvl}`)
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(s => {
                html += `
                    <div class="bank-item">
                        <input type="checkbox" name="selected_soal[]" value="${s.id}"> 
                        <label style="cursor:pointer;">${s.question}</label>
                    </div>`;
            });
            document.getElementById('daftar-soal-bank').innerHTML = html;
        });
}