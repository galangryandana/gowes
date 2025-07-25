const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwjNuneeTzLlq5mdFDK77d2Fry5EnxWd6eLBA_F--tqA2uhKhtlEOoSLCl9c5HKkBvG/exec";

document.addEventListener("DOMContentLoaded", function () {
  const formPendaftaran = document.getElementById("form-pendaftaran");
  const infoPembayaran = document.getElementById("info-pembayaran");
  const uploadSection = document.getElementById("upload-section");
  const konfirmasiAkhir = document.getElementById("konfirmasi-akhir");
  const registrationForm = document.getElementById("registration-form");
  const submitInitialBtn = document.getElementById("submit-initial-data");
  const btnLanjutUpload = document.getElementById("btn-lanjut-upload");
  const uploadBuktiInput = document.getElementById("upload-bukti");
  const konfirmasiBtn = document.getElementById("konfirmasi-btn");
  const nomorRegistrasiDisplay = document.getElementById(
    "nomor-registrasi-display"
  );
  const nominalPembayaran = document.getElementById("nominal-pembayaran");
  const fileLabel = document.getElementById("file-label");
  const fileNameSpan = document.getElementById("file-name");
  const nomorRegistrasiFinal = document.getElementById(
    "nomor-registrasi-final"
  );

  // --- JAVASCRIPT BARU DITAMBAHKAN ---
  const btnKembali = document.getElementById("btn-kembali");
  // --- AKHIR DARI JAVASCRIPT BARU ---

  let userRegistrationData = {};

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitInitialBtn.disabled = true;
    submitInitialBtn.innerHTML =
      '<span class="loader"></span>&nbsp; Memproses...';

    const formData = {
      action: "register",
      nama: document.getElementById("nama").value,
      alamat: document.getElementById("alamat").value,
      telepon: document.getElementById("telepon").value,
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          userRegistrationData.regNumber = data.regNumber;
          nomorRegistrasiDisplay.textContent = data.regNumber;
          const paymentAmount = parseInt(data.regNumber, 10);
          nominalPembayaran.textContent = `Rp ${paymentAmount},-`;
          formPendaftaran.classList.add("hidden");
          infoPembayaran.classList.remove("hidden");
        } else {
          throw new Error(
            data.message || "Gagal mendapatkan nomor registrasi."
          );
        }
      })
      .catch((error) => {
        alert("Terjadi kesalahan: " + error.message);
      })
      .finally(() => {
        submitInitialBtn.disabled = false;
        submitInitialBtn.textContent = "Lanjut ke Pembayaran Donasi PMI";
      });
  });

  btnLanjutUpload.addEventListener("click", () => {
    infoPembayaran.classList.add("hidden");
    uploadSection.classList.remove("hidden");
  });

  // --- JAVASCRIPT BARU DITAMBAHKAN ---
  btnKembali.addEventListener("click", () => {
    uploadSection.classList.add("hidden");
    infoPembayaran.classList.remove("hidden");
  });
  // --- AKHIR DARI JAVASCRIPT BARU ---

  uploadBuktiInput.addEventListener("change", function (event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      fileLabel.textContent = `✓ File Terpilih`;
      fileNameSpan.textContent = file.name;
      konfirmasiBtn.disabled = false;
    } else {
      fileLabel.textContent = "Pilih File Bukti Pembayaran";
      fileNameSpan.textContent = "Maksimal 2MB (JPG, PNG).";
      konfirmasiBtn.disabled = true;
    }
  });

  konfirmasiBtn.addEventListener("click", function () {
    const file = uploadBuktiInput.files[0];
    if (!file) {
      alert("Mohon pilih file bukti pembayaran terlebih dahulu.");
      return;
    }

    konfirmasiBtn.disabled = true;
    konfirmasiBtn.innerHTML =
      '<span class="loader"></span>&nbsp; Mengirim Data...';

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      const fileData = reader.result.split(",")[1];

      const finalData = {
        action: "upload",
        regNumber: userRegistrationData.regNumber,
        file: fileData,
        type: file.type,
      };

      fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(finalData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result === "success") {
            nomorRegistrasiFinal.textContent = userRegistrationData.regNumber;
            uploadSection.classList.add("hidden");
            konfirmasiAkhir.classList.remove("hidden");
          } else {
            throw new Error(data.message || "Gagal mengunggah bukti.");
          }
        })
        .catch((error) => {
          alert("Gagal mengirim data: " + error.message);
          konfirmasiBtn.disabled = false;
          konfirmasiBtn.textContent = "Kirim Bukti & Selesaikan Pendaftaran";
        });
    };

    reader.onerror = function (error) {
      alert("Gagal membaca file: " + error);
      konfirmasiBtn.disabled = false;
      konfirmasiBtn.textContent = "Kirim Bukti & Selesaikan Pendaftaran";
    };
  });
});
