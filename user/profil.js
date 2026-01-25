document.addEventListener("DOMContentLoaded", () => {
  const langSwitcher = document.getElementById("lang-switcher");

  /**
   * Menerapkan terjemahan ke semua elemen dengan atribut data-key.
   * @param {string} lang - Kode bahasa ('id' atau 'en').
   */
  function applyLanguage(lang) {
    if (!translations[lang]) {
      console.error(`Translation for language "${lang}" not found.`);
      return;
    }

    // Ubah atribut lang pada tag <html>
    document.documentElement.lang = lang;

    // Ganti teks pada semua elemen dengan data-key
    document.querySelectorAll("[data-key]").forEach((element) => {
      const key = element.dataset.key;
      if (translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });

    // Ganti placeholder pada semua elemen dengan data-key-placeholder
    document.querySelectorAll("[data-key-placeholder]").forEach((element) => {
      const key = element.dataset.keyPlaceholder;
      if (translations[lang][key]) {
        element.placeholder = translations[lang][key];
      }
    });
  }

  /**
   * Mengirim bahasa yang dipilih ke server untuk disimpan di session.
   * @param {string} lang - Kode bahasa ('id' atau 'en').
   */
  async function updateLanguageOnServer(lang) {
    try {
      const response = await fetch("user/update_language.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang: lang }),
      });

      if (!response.ok) {
        console.error("Failed to update language on server.");
      }
    } catch (error) {
      console.error("Error sending language update:", error);
    }
  }

  // Event listener untuk combo box bahasa, hanya jika elemennya ada
  if (langSwitcher) {
    langSwitcher.addEventListener("change", (event) => {
      const newLang = event.target.value;
      applyLanguage(newLang);
      updateLanguageOnServer(newLang);
    });
  }

  // Terapkan bahasa awal saat halaman dimuat
  const initialLang = document.documentElement.lang || "id";
  applyLanguage(initialLang);
});
