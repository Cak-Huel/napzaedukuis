document.addEventListener("DOMContentLoaded", () => {
  const kodeEl = document.getElementById("kode_room");
  const namaEl = document.getElementById("nama_guest");
  const btnJoin = document.querySelector(".btn-join");

  // buat elemen error kecil jika belum ada
  let errEl = document.querySelector(".join-error");
  if (!errEl) {
    errEl = document.createElement("div");
    errEl.className = "join-error";
    errEl.style.color = "red";
    errEl.style.marginTop = "8px";
    const left = document.querySelector(".join-left");
    if (left) left.appendChild(errEl);
  }

  function showError(msg) {
    errEl.textContent = msg || "";
  }

  function setButtonBusy(busy) {
    btnJoin.disabled = busy;
    btnJoin.textContent = busy ? "Menghubungkan..." : "Join";
  }

  async function doJoin(e) {
    if (e) e.preventDefault();
    showError("");

    const kode = (kodeEl.value || "").trim().toUpperCase();
    const nama = (namaEl.value || "").trim();

    if (!kode) {
      showError("Masukkan kode room.");
      kodeEl.focus();
      return;
    }
    if (!nama) {
      showError("Masukkan nama peserta.");
      namaEl.focus();
      return;
    }

    setButtonBusy(true);

    try {
      const formData = new FormData();
      formData.append("kode_room", kode);
      formData.append("nama_guest", nama);

      const response = await fetch("join_room_trigger.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect ke waiting room dengan id_room dan id_peserta dari server
        const id_room = encodeURIComponent(data.id_room);
        const id_peserta = encodeURIComponent(data.id_peserta);
        window.location.href = `waiting_room.php?id_room=${id_room}&id_peserta=${id_peserta}`;
      } else {
        throw new Error(data.message || "Gagal bergabung dengan room.");
      }
    } catch (error) {
      showError(error.message);
      console.error("Join room error:", error);
    } finally {
      setButtonBusy(false);
    }
  }

  // klik tombol
  btnJoin.addEventListener("click", doJoin);

  // enter pada input akan submit
  [kodeEl, namaEl].forEach((el) =>
    el.addEventListener("keypress", (ev) => {
      if (ev.key === "Enter") doJoin(ev);
    })
  );
});
