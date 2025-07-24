// =====================================================================
// GANTI DENGAN URL APLIKASI WEB DARI GOOGLE APPS SCRIPT ANDA
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyUBBwv1mF1q_Tt4czCKgdWNFJWAqXwPUlom0ZvGRzpsDv07K8uOV6PdZTSNnP_Vgmw/exec";
// =====================================================================

document.addEventListener("DOMContentLoaded", function () {
  const formPendaftaran = document.getElementById("form-pendaftaran");
  const infoPembayaran = document.getElementById("info-pembayaran");
  const konfirmasiAkhir = document.getElementById("konfirmasi-akhir");
  const registrationForm = document.getElementById("registration-form");
  const nomorRegistrasiSpan = document.getElementById("nomor-registrasi");
  const uploadBuktiInput = document.getElementById("upload-bukti");
  const fileNameSpan = document.getElementById("file-name");
  const fileLabel = document.getElementById("file-label");
  const konfirmasiBtn = document.getElementById("konfirmasi-btn");

  let formData = {};

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    formData.nama = document.getElementById("nama").value;
    formData.telepon = document.getElementById("telepon").value;
    formData.dob = document.getElementById("dob").value;

    formPendaftaran.classList.add("hidden");
    infoPembayaran.classList.remove("hidden");
  });

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
      const fileData = reader.result;
      formData.file = fileData;
      formData.type = file.type;

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        redirect: "follow",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result === "success") {
            nomorRegistrasiSpan.textContent = data.regNumber;
            infoPembayaran.classList.add("hidden");
            konfirmasiAkhir.classList.remove("hidden");
          } else {
            throw new Error(
              data.message || "Terjadi kesalahan saat mengirim data."
            );
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
