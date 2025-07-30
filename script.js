document.addEventListener("DOMContentLoaded", function () {
  // --- KONFIGURASI ---
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwifvVM20041Tz7wRUzrbU8kA0-79eXXrSPm12sv2vUOy3-cvW8prMuJrKgIR9Qt-dD/exec";
  const STORAGE_KEY = "gowesRegistrationData";

  // --- Elemen Tampilan ---
  const formPendaftaran = document.getElementById("form-pendaftaran");
  const infoPembayaran = document.getElementById("info-pembayaran");
  const uploadSection = document.getElementById("upload-section");
  const konfirmasiAkhir = document.getElementById("konfirmasi-akhir");

  // --- Tombol & Form ---
  const registrationForm = document.getElementById("registration-form");
  const submitInitialBtn = document.getElementById("submit-initial-data");
  const btnLanjutUpload = document.getElementById("btn-lanjut-upload");
  const btnEditData = document.getElementById("btn-edit-data"); // Tombol edit baru
  const uploadBuktiInput = document.getElementById("upload-bukti");
  const konfirmasiBtn = document.getElementById("konfirmasi-btn");
  const btnKembali = document.getElementById("btn-kembali");

  // --- Tampilan Dinamis ---
  const nomorRegistrasiDisplay = document.getElementById(
    "nomor-registrasi-display"
  );
  const nominalPembayaran = document.getElementById("nominal-pembayaran");
  const fileLabel = document.getElementById("file-label");
  const fileNameSpan = document.getElementById("file-name");
  const nomorRegistrasiFinal = document.getElementById(
    "nomor-registrasi-final"
  );

  let userRegistrationData = {};

  // Fungsi untuk menampilkan halaman pembayaran
  function displayPaymentInfo(regNumber) {
    nomorRegistrasiDisplay.textContent = regNumber;
    const paymentAmount = parseInt(regNumber, 10);
    nominalPembayaran.textContent = `Rp ${paymentAmount},-`;
    formPendaftaran.classList.add("hidden");
    infoPembayaran.classList.remove("hidden");
    uploadSection.classList.add("hidden");
    konfirmasiAkhir.classList.add("hidden");
  }

  // Memeriksa localStorage saat halaman dimuat
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    userRegistrationData = JSON.parse(savedData);
    displayPaymentInfo(userRegistrationData.regNumber);
  }

  // Proses pengiriman data awal ATAU pembaruan data
  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitInitialBtn.disabled = true;
    submitInitialBtn.innerHTML =
      '<span class="loader"></span>&nbsp; Memproses...';

    const isUpdate = !!userRegistrationData.regNumber; // Cek apakah ini pembaruan

    const formData = {
      action: isUpdate ? "update_data" : "register", // Tentukan aksi yang benar
      nama: document.getElementById("nama").value,
      alamat: document.getElementById("alamat").value,
      telepon: document.getElementById("telepon").value,
    };

    // Jika ini pembaruan, tambahkan nomor registrasi ke data yang dikirim
    if (isUpdate) {
      formData.regNumber = userRegistrationData.regNumber;
    }

    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          // Simpan semua data yang relevan ke localStorage
          userRegistrationData = {
            regNumber: data.regNumber,
            nama: formData.nama,
            alamat: formData.alamat,
            telepon: formData.telepon,
          };
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(userRegistrationData)
          );
          displayPaymentInfo(data.regNumber);
        } else {
          throw new Error(data.message || "Gagal memproses data.");
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

  // **** LOGIKA BARU UNTUK TOMBOL EDIT ****
  btnEditData.addEventListener("click", () => {
    // Ambil data dari variabel global (yang sudah di-load dari localStorage)
    const dataToEdit = userRegistrationData;
    if (dataToEdit) {
      // Isi kembali form dengan data yang tersimpan
      document.getElementById("nama").value = dataToEdit.nama || "";
      document.getElementById("alamat").value = dataToEdit.alamat || "";
      document.getElementById("telepon").value = dataToEdit.telepon || "";
    }
    // Tampilkan kembali form pendaftaran
    infoPembayaran.classList.add("hidden");
    formPendaftaran.classList.remove("hidden");
  });

  // Navigasi dari halaman info pembayaran ke upload
  btnLanjutUpload.addEventListener("click", () => {
    infoPembayaran.classList.add("hidden");
    uploadSection.classList.remove("hidden");
  });

  // Navigasi dari halaman upload kembali ke info pembayaran
  btnKembali.addEventListener("click", () => {
    uploadSection.classList.add("hidden");
    infoPembayaran.classList.remove("hidden");
  });

  // Handle pemilihan file bukti pembayaran
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

  // Proses pengiriman bukti pembayaran
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
            localStorage.removeItem(STORAGE_KEY);
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
