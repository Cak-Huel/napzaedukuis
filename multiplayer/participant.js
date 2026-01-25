document.addEventListener("DOMContentLoaded", () => {
    // Ambil elemen dari HTML
    const roomCodeEl = document.querySelector(".room-box h1");
    const participantListEl = document.getElementById("participant-list");
    const participantCountEl = document.getElementById("total-peserta");
    const startGameBtn = document.getElementById("start-game-btn");

    // Ambil id_room dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const id_room = urlParams.get("id_room");

    if (!id_room) {
        alert("Error: ID Room tidak ditemukan di URL.");
        return;
    }

    // --- Fungsi Bantuan ---
    function renderParticipants(participants = []) {
        participantListEl.innerHTML = "";
        participants.forEach(name => {
            addParticipantToList(name);
        });
        updateParticipantCount();
    }

    function addParticipantToList(name) {
        const li = document.createElement("li");
        li.textContent = name;
        participantListEl.appendChild(li);
    }
    
    function updateParticipantCount() {
        const count = participantListEl.getElementsByTagName("li").length;
        participantCountEl.textContent = count;
    }


    // --- Langkah 1: Ambil data awal saat halaman dimuat ---
    async function getInitialData() {
        try {
            const response = await fetch(`get_room_details.php?id_room=${id_room}`);
            if (!response.ok) {
                throw new Error("Gagal mengambil data room dari server.");
            }
            const data = await response.json();
            
            if (data.success) {
                roomCodeEl.textContent = data.kode_room;
                renderParticipants(data.peserta);
                setupPusher(data.kode_room); // Mulai koneksi Pusher setelah dapat kode_room
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert(`Terjadi kesalahan saat memuat halaman: ${error.message}`);
        }
    }
    
    // --- Langkah 2: Konfigurasi dan koneksi ke Pusher ---
    function setupPusher(kode_room) {
        // Inisialisasi Pusher langsung di JS agar mandiri
        const pusher = new Pusher('48dc0e7685cb274b770b', { // GANTI DENGAN APP KEY
            cluster: 'ap1', // GANTI DENGAN CLUSTER
            channelAuthorization: {
            endpoint: 'pusher_auth.php', // Tentukan alamat file otorisasi kita
            transport: 'ajax'
     }
        });

        // nama channel yang lebih aman
        const channelName = `private-quiz-${kode_room}`;
        const channel = pusher.subscribe(channelName);

        // Hanya terima nama peserta baru, bukan seluruh list
        channel.bind('participant-joined', function(data) {
            console.log("Event 'participant-joined' diterima:", data);
            if (data.nama_guest) {
                addParticipantToList(data.nama_guest);
                updateParticipantCount();
            }
        });
        
        // permaianan berakhir
        channel.bind('game-ended', function(data) {
            alert("Permainan diakhiri oleh host.");
            window.location.href = "selection.php";
        });

        console.log(`Berhasil terhubung dan mendengarkan channel: ${channelName}`);
    }

    // --- Langkah 3: Event listener untuk tombol "Mulai Game" ---
    startGameBtn.addEventListener("click", async () => {
        startGameBtn.disabled = true;
        startGameBtn.textContent = "Memulai...";

        try {
            const response = await fetch("start_game_trigger.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id_room=${id_room}`,
            });

            const result = await response.json();
            if (response.ok && result.success) {
                window.location.href = `scorebord.php?id_room=${id_room}`;
            } else {
                throw new Error(result.message || "Gagal memulai permainan.");
            }
        } catch (error) {
            console.error("Error saat memulai game:", error);
            alert(`Gagal memulai permainan: ${error.message}`);
            startGameBtn.disabled = false;
            startGameBtn.textContent = "Mulai Game";
        }
    });

    // Jalankan fungsi untuk mengambil data awal
    getInitialData();
});