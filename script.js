// Isi pilihan Golongan, Unit Kerja, Bulan Gaji, Tahun Gaji saat halaman load
document.addEventListener("DOMContentLoaded", function() {
  const golonganOptions = ["Ia", "Ib", "Ic", "Id", "IIa", "IIb", "IIc", "IId", "IIIa", "IIIb", "IIIc", "IIId", "IVa", "IVb", "IVc", "IVd", "IVe"];
  const unitKerjaOptions = [
    "Puskesmas Sowi", "Puskesmas Amban", "Puskesmas Maripi", "Puskesmas Wosi",
    "Puskesmas Warmare", "Puskesmas Masni", "Puskesmas Sidey",
    "Puskesmas Tanah Merah Baru", "Puskesmas Manokwari Selatan", "Puskesmas Udopi"
  ];
  const bulanOptions = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const tahunOptions = ["2025", "2026", "2027", "2028", "2029", "2030"];

  const golonganSelect = document.getElementById("golongan");
  const unitKerjaSelect = document.getElementById("unitKerja");
  const gajiBulanSelect = document.getElementById("gajiBulan");
  const tahunGajiSelect = document.getElementById("tahunGaji");

  golonganOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    golonganSelect.appendChild(option);
  });

  unitKerjaOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    unitKerjaSelect.appendChild(option);
  });

  bulanOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    gajiBulanSelect.appendChild(option);
  });

  tahunOptions.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    tahunGajiSelect.appendChild(option);
  });

  renderTable();
  loadDarkMode();
});

// Format angka ke Rupiah otomatis
function formatRupiah(angka, prefix = "Rp. ") {
  let number_string = angka.replace(/[^,\d]/g, "").toString(),
      split = number_string.split(","),
      sisa = split[0].length % 3,
      rupiah = split[0].substr(0, sisa),
      ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    let separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }
  rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  return prefix + rupiah;
}

// Live formatting input Gaji dan Potongan Kredit
document.addEventListener("input", function(e) {
  if (e.target.id === "gaji" || e.target.classList.contains("potonganInput")) {
    e.target.value = formatRupiah(e.target.value.replace(/[^,\d]/g, ""));
  }

  if (e.target.id === "beras") {
    const berasKg = parseInt(e.target.value) || 0;
    document.getElementById("potonganAngkut").value = formatRupiah((berasKg * 1000).toString());
  }
});

// Tambah Potongan Kredit + Dropdown Bank
function tambahPotonganField() {
  const potonganList = document.getElementById("potonganList");
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Nominal (Rp)" class="potonganInput" style="width: 45%;" />
    <select class="bankInput" style="width: 45%;">
      <option value="">Pilih Bank</option>
      <option value="Bank Papua">Bank Papua</option>
      <option value="Bank Modern Papua">Bank Modern Papua</option>
      <option value="Bank Mandiri">Bank Mandiri</option>
      <option value="Bank BRI">Bank BRI</option>
      <option value="Bank BNI">Bank BNI</option>
      <option value="Bank BTN">Bank BTN</option>
    </select>
    <button type="button" onclick="this.parentElement.remove()">Hapus</button>
  `;
  potonganList.appendChild(div);
}

// Backup database
function backupDatabase() {
  const data = localStorage.getItem("pegawai");
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "backup-pegawai.json";
  link.click();
}

// Restore database
function restoreDatabase(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);
    localStorage.setItem("pegawai", JSON.stringify(data));
    renderTable();
    alert("Database berhasil direstore!");
  };
  reader.readAsText(file);
}

// Ambil data localStorage
function getData() {
  return JSON.parse(localStorage.getItem("pegawai")) || [];
}

// Simpan data localStorage
function saveData(data) {
  localStorage.setItem("pegawai", JSON.stringify(data));
}

// Render tabel
function renderTable() {
  const tbody = document.querySelector("#tabelGaji tbody");
  tbody.innerHTML = "";
  const data = getData();

  data.forEach((pegawai, index) => {
    const potonganKreditList = pegawai.potonganKredit.map(pk => `${pk.bank} - ${formatRupiah(pk.nominal.toString())}`).join("<br>");
    const totalPotonganKredit = pegawai.potonganKredit.reduce((acc, pk) => acc + pk.nominal, 0);
    const totalPotongan = pegawai.potonganAngkut + totalPotonganKredit;
    const gajiBersih = pegawai.gaji - totalPotongan;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${pegawai.nama}</td>
      <td>${pegawai.nomorRekening}</td>
      <td>${pegawai.golongan}</td>
      <td>${pegawai.unitKerja}</td>
      <td>${formatRupiah(pegawai.gaji.toString())}</td>
      <td>${pegawai.beras}</td>
      <td>${formatRupiah(pegawai.potonganAngkut.toString())}</td>
      <td>${potonganKreditList}</td>
      <td>${formatRupiah(totalPotongan.toString())}</td>
      <td>${formatRupiah(gajiBersih.toString())}</td>
      <td class="no-print">
        <button onclick="hapusData(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Hapus pegawai
function hapusData(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    const data = getData();
    data.splice(index, 1);
    saveData(data);
    renderTable();
  }
}

// Handle form submit
document.getElementById("formPegawai").addEventListener("submit", function(e) {
  e.preventDefault();

  const nama = document.getElementById("nama").value;
  const nomorRekening = document.getElementById("nomorRekening").value;
  const golongan = document.getElementById("golongan").value;
  const unitKerja = document.getElementById("unitKerja").value;
  const gajiBulan = document.getElementById("gajiBulan").value;
  const tahunGaji = document.getElementById("tahunGaji").value;
  const gaji = parseInt(document.getElementById("gaji").value.replace(/[^,\d]/g, "").replaceAll(".", ""));
  const beras = parseInt(document.getElementById("beras").value) || 0;
  const potonganAngkut = beras * 1000;

  const potonganInputs = document.querySelectorAll(".potonganInput");
  const bankInputs = document.querySelectorAll(".bankInput");
  let potonganKredit = [];

  potonganInputs.forEach((input, idx) => {
    const nominal = parseInt(input.value.replace(/[^,\d]/g, "").replaceAll(".", "")) || 0;
    const bank = bankInputs[idx].value || "Lainnya";
    potonganKredit.push({ bank, nominal });
  });

  const pegawai = { nama, nomorRekening, golongan, unitKerja, gajiBulan, tahunGaji, gaji, beras, potonganAngkut, potonganKredit };
  const data = getData();
  data.push(pegawai);
  saveData(data);

  this.reset();
  document.getElementById("potonganList").innerHTML = "";
  renderTable();
});

// Dark mode toggle
const darkSwitch = document.getElementById('darkModeSwitch');
darkSwitch.addEventListener('change', function() {
  if (this.checked) {
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Load dark mode saat halaman buka
function loadDarkMode() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark-mode');
    document.getElementById('darkModeSwitch').checked = true;
  }
}
