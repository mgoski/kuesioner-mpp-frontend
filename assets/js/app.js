const QUESTIONS = [
  "Persyaratan pelayanan mudah dipahami dan dipenuhi.",
  "Prosedur pelayanan cetak KTP-el/aktivasi IKD mudah diikuti.",
  "Waktu penyelesaian pelayanan sesuai dengan informasi yang diberikan.",
  "Biaya/tarif pelayanan jelas dan sesuai ketentuan (tidak dipungut biaya).",
  "Hasil pelayanan yang diterima sesuai dengan kebutuhan.",
  "Petugas memiliki kompetensi dan pengetahuan yang baik.",
  "Petugas memberikan pelayanan dengan sopan dan ramah.",
  "Petugas memberikan pelayanan secara adil tanpa diskriminasi.",
  "Petugas merespons pertanyaan dan keluhan dengan baik.",
  "Sarana dan prasarana ruang pelayanan nyaman dan memadai.",
  "Ketersediaan fasilitas pendukung pelayanan sudah memadai.",
  "Informasi persyaratan dan prosedur pelayanan mudah diperoleh.",
  "Keamanan dan kerahasiaan data pribadi saya terjaga.",
  "Petugas memberikan penjelasan yang jelas dan mudah dimengerti.",
  "Secara keseluruhan saya puas terhadap pelayanan yang diberikan."
];

const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJySX1_vAlby4RrimEgVecDP0";
const form = document.getElementById("surveyForm");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

function renderQuestions() {
  const host = document.getElementById("questionList");
  host.innerHTML = QUESTIONS.map((question, index) => {
    const number = index + 1;
    const options = [
      [1, "Tidak Baik"], [2, "Kurang"], [3, "Baik"], [4, "Sangat Baik"]
    ].map(([value, label]) => `
      <div class="relative">
        <input id="q${number}_${value}" type="radio" name="q${number}" value="${value}" required>
        <label for="q${number}_${value}">
          <b class="block text-lg">${value}</b>
          <span class="text-[10px] sm:text-xs">${label}</span>
        </label>
      </div>`).join("");
    return `
      <div class="border-b border-slate-100 pb-5">
        <p class="mb-3 text-sm font-semibold text-slate-800 sm:text-base">${number}. ${question}</p>
        <div class="rating grid grid-cols-4 gap-2">${options}</div>
      </div>`;
  }).join("");
}

function showStep(number) {
  step1.classList.toggle("active", number === 1);
  step2.classList.toggle("active", number === 2);
  document.getElementById("stepLabel").textContent = `Tahap ${number} dari 2`;
  const percent = number === 1 ? 0 : 50;
  document.getElementById("progress").style.width = `${percent}%`;
  document.getElementById("progressText").textContent = `${percent}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCount() {
  let answered = 0;
  for (let i = 1; i <= 15; i++) {
    if (form.querySelector(`[name="q${i}"]:checked`)) answered++;
  }
  document.getElementById("answered").textContent = `${answered}/15`;
  document.getElementById("answerProgress").style.width = `${answered / 15 * 100}%`;
  const percent = 50 + answered / 15 * 50;
  document.getElementById("progress").style.width = `${percent}%`;
  document.getElementById("progressText").textContent = `${Math.round(percent)}%`;
}

document.getElementById("toQuestions").addEventListener("click", () => {
  const name = form.elements.nama.value.trim();
  const service = form.querySelector('[name="layanan"]:checked');
  if (!name || !service) {
    Swal.fire("Data belum lengkap", "Isi nama dan pilih jenis layanan terlebih dahulu.", "warning");
    return;
  }
  showStep(2);
});

document.getElementById("back").addEventListener("click", () => showStep(1));
form.addEventListener("change", event => {
  if (event.target.name && event.target.name.startsWith("q")) updateCount();
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  let answered = 0;
  for (let i = 1; i <= 15; i++) {
    if (form.querySelector(`[name="q${i}"]:checked`)) answered++;
  }
  if (answered !== 15) {
    Swal.fire("Belum lengkap", "Mohon jawab seluruh 15 indikator.", "warning");
    return;
  }

  const apiBase = (window.MPP_CONFIG?.API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!apiBase || apiBase.includes("GANTI-DENGAN-DOMAIN")) {
    Swal.fire("Backend belum dikonfigurasi", "Frontend sudah siap. Alamat backend PHP HTTPS perlu diisi terlebih dahulu sebelum menerima jawaban.", "info");
    return;
  }

  const button = document.getElementById("send");
  button.disabled = true;
  button.textContent = "Mengirim...";

  try {
    const response = await fetch(`${apiBase}/submit`, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" },
      mode: "cors",
      credentials: "omit"
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("Respons backend bukan JSON:", response.status, raw);
      throw new Error(`Server mengirim respons bukan JSON (HTTP ${response.status}).`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Jawaban belum dapat disimpan. Silakan coba kembali.");
    }

    await Swal.fire({
      icon: "success",
      title: "Terima kasih!",
      text: "Jawaban berhasil disimpan. Anda akan dialihkan ke halaman ulasan Google Disdukcapil...",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
    window.location.href = data.redirect || GOOGLE_REVIEW_URL;
  } catch (error) {
    console.error(error);
    Swal.fire("Belum berhasil", error.message || "Koneksi ke server gagal. Silakan coba kembali.", "error");
    button.disabled = false;
    button.textContent = "Kirim Penilaian";
  }
});

renderQuestions();
