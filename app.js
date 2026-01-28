/* =========================
   Villa Farfalla Lily - app.js
   - Render villa cards
   - Filter kategori (TANPA pantai)
   - Klik card => buka detail modal + slider banyak foto
   - Slider di card & di modal detail
   - Booking modal + kirim WhatsApp
   - Mobile menu
   - Map embed: Villa Farfalla Lily (Bogor)
   ========================= */

/* ========= CONFIG ========= */
const CONFIG = {
  whatsapp_number: "6285771443462", // WA: 085771443462

  map_embed_src:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.5470656726225!2d106.675328!3d-6.702878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69d16d6e233055%3A0x62b213c76a8781d1!2sVilla%20Farfalla%20Lily!5e0!3m2!1sid!2sid!4v1769630814719",

  map_address:
    "Villa Farfalla Lily, Ciasihan, Kec. Pamijahan, Kabupaten Bogor, Jawa Barat 16810",
};


/* ========= DATA VILLA (ISI FOTO BANYAK) =========
  Cara pakai foto:
  - Buat folder: /img/
  - Isi foto: img/villa1-1.jpg, img/villa1-2.jpg, dst
  - Ubah array images di bawah sesuai nama file kamu
*/
const villas = [
  {
    id: 1,
    name: "Villa Sunset Paradise",
    type: "romantic",
    location: "Pamijahan, Bogor",
    price: 2500000,
    capacity: 2,
    bedrooms: 1,
    description:
      "Villa romantis yang sempurna untuk pasangan. Suasana tenang, view alam, cocok untuk quality time.",
    features: ["Private Pool", "Mountain View", "Breakfast"],
    // FOTO BANYAK
    images: ["img/villa1.jpg", "img/villa2.jpg", "img/villa1.jpg"],
  },
  {
    id: 2,
    name: "Villa Family Haven",
    type: "family",
    location: "Pamijahan, Bogor",
    price: 2800000,
    capacity: 6,
    bedrooms: 3,
    description:
      "Villa nyaman untuk keluarga. Area luas, fasilitas lengkap, cocok buat liburan bareng.",
    features: ["Kitchen", "Kids Area", "Parking"],
    images: ["img/villa1.jpg", "img/villa2.jpg", "img/villa1.jpg"],
  },
  {
    id: 3,
    name: "Villa Royal Luxury",
    type: "luxury",
    location: "Pamijahan, Bogor",
    price: 8500000,
    capacity: 8,
    bedrooms: 4,
    description:
      "Villa mewah untuk acara spesial. Fasilitas premium dan suasana eksklusif.",
    features: ["Butler Service", "Spa", "Private Chef"],
    images: ["img/villa1.jpg", "img/villa2.jpg", "img/villa1.jpg"],
  },
  {
    id: 4,
    name: "Villa Mountain Retreat",
    type: "mountain",
    location: "Pamijahan, Bogor",
    price: 1800000,
    capacity: 4,
    bedrooms: 2,
    description:
      "Nikmati udara sejuk pegunungan. Cocok untuk healing dan melepas penat.",
    features: ["Garden", "Fireplace", "Trekking"],
    images: ["img/villa1.jpg", "img/villa2.jpg", "img/villa1.jpg"],
  },
];

/* ========= STATE ========= */
let currentFilter = "all";
let selectedVilla = null;

// slide untuk card
const currentSlides = {};
villas.forEach((v) => (currentSlides[v.id] = 0));

// slide untuk detail modal
let detailVilla = null;
let detailSlide = 0;

/* ========= UTIL ========= */
const $ = (id) => document.getElementById(id);

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function safeImages(villa) {
  // kalau belum ada foto, fallback 1 gambar placeholder (biar ga error)
  if (Array.isArray(villa.images) && villa.images.length) return villa.images;
  return ["img/placeholder.jpg"];
}

/* ========= MAP INIT ========= */
function initMap() {
  const iframe = $("google-map");
  if (iframe) iframe.src = CONFIG.map_embed_src;

  const addr = $("map-address");
  if (addr) addr.textContent = CONFIG.map_address;
}

/* ========= GALLERY CARD ========= */
function updateGallery(villaId) {
  const track = document.querySelector(`.gallery-track[data-villa-id="${villaId}"]`);
  const dots = document.querySelectorAll(`.gallery-dot[data-villa-id="${villaId}"]`);
  if (!track) return;

  track.style.transform = `translateX(-${currentSlides[villaId] * 100}%)`;

  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentSlides[villaId]);
  });
}

window.changeSlide = function changeSlide(villaId, direction) {
  const v = villas.find((x) => x.id === villaId);
  if (!v) return;
  const imgs = safeImages(v);

  currentSlides[villaId] += direction;
  if (currentSlides[villaId] < 0) currentSlides[villaId] = imgs.length - 1;
  if (currentSlides[villaId] >= imgs.length) currentSlides[villaId] = 0;

  updateGallery(villaId);
};

window.goToSlide = function goToSlide(villaId, index) {
  currentSlides[villaId] = index;
  updateGallery(villaId);
};

/* ========= RENDER VILLAS ========= */
function renderVillas(filter = "all") {
  const grid = $("villa-grid");
  if (!grid) return;

  const list = filter === "all" ? villas : villas.filter((v) => v.type === filter);

  grid.innerHTML = list
    .map((villa, idx) => {
      const imgs = safeImages(villa);
      return `
      <div class="bg-white rounded-3xl overflow-hidden shadow-lg card-hover fade-in stagger-${
        (idx % 6) + 1
      } cursor-pointer villa-card" data-villa-id="${villa.id}">
        <div class="villa-image h-48 relative">
          <div class="gallery-container h-full">
            <div class="gallery-track h-full" data-villa-id="${villa.id}">
              ${imgs
                .map(
                  (src) => `
                <div class="gallery-slide">
                  <img src="${src}" alt="${villa.name}" loading="lazy" />
                </div>`
                )
                .join("")}
            </div>

            <button class="gallery-btn gallery-btn-prev" onclick="event.stopPropagation(); changeSlide(${
              villa.id
            }, -1)">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <button class="gallery-btn gallery-btn-next" onclick="event.stopPropagation(); changeSlide(${
              villa.id
            }, 1)">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div class="gallery-dots absolute bottom-2 left-0 right-0">
            ${imgs
              .map(
                (_, i) =>
                  `<span class="gallery-dot ${
                    i === 0 ? "active" : ""
                  }" data-villa-id="${villa.id}" onclick="event.stopPropagation(); goToSlide(${
                    villa.id
                  }, ${i})"></span>`
              )
              .join("")}
          </div>

          <div class="price-tag absolute top-4 right-4 px-4 py-1 rounded-full text-white font-semibold text-sm">
            ${formatPrice(villa.price)}/malam
          </div>
        </div>

        <div class="p-6">
          <h3 class="font-playfair text-xl font-bold text-gray-900 mb-1">${villa.name}</h3>

          <p class="text-gray-500 text-sm flex items-center gap-1 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            ${villa.location}
          </p>

          <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              ${villa.capacity} Tamu
            </span>

            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              ${villa.bedrooms} Kamar
            </span>
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
            ${villa.features
              .map(
                (f) =>
                  `<span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">${f}</span>`
              )
              .join("")}
          </div>

          <button class="book-btn w-full py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-900 hover:to-blue-700 transition flex items-center justify-center gap-2"
                  data-villa-id="${villa.id}">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Pesan Sekarang
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  // klik card => detail
  document.querySelectorAll(".villa-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".book-btn")) return;
      const id = parseInt(card.dataset.villaId, 10);
      openDetailModal(id);
    });
  });

  // klik tombol pesan => booking
  document.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.villaId, 10);
      openBookingModal(id);
    });
  });

  // pastikan gallery start posisi 0
  list.forEach((v) => updateGallery(v.id));
}

/* ========= FILTER ========= */
function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderVillas(currentFilter);
    });
  });
}

/* ========= DETAIL MODAL (SLIDER BANYAK FOTO) ========= */
window.changeDetailSlide = function changeDetailSlide(direction) {
  if (!detailVilla) return;
  const imgs = safeImages(detailVilla);

  detailSlide += direction;
  if (detailSlide < 0) detailSlide = imgs.length - 1;
  if (detailSlide >= imgs.length) detailSlide = 0;

  updateDetailGallery();
};

window.goToDetailSlide = function goToDetailSlide(index) {
  detailSlide = index;
  updateDetailGallery();
};

function updateDetailGallery() {
  const track = $("detail-gallery-track");
  const dots = document.querySelectorAll("#detail-gallery-dots .gallery-dot");
  if (track) track.style.transform = `translateX(-${detailSlide * 100}%)`;
  dots.forEach((dot, idx) => dot.classList.toggle("active", idx === detailSlide));
}

function openDetailModal(villaId) {
  const villa = villas.find((v) => v.id === villaId);
  if (!villa) return;

  detailVilla = villa;
  detailSlide = 0;

  const imgs = safeImages(villa);

  // gallery detail
  const track = $("detail-gallery-track");
  const dotsWrap = $("detail-gallery-dots");

  if (track) {
    track.innerHTML = imgs
      .map(
        (src) => `
      <div class="gallery-slide">
        <img src="${src}" alt="${villa.name}" />
      </div>`
      )
      .join("");
    track.style.transform = "translateX(0%)";
  }

  if (dotsWrap) {
    dotsWrap.innerHTML = imgs
      .map(
        (_, i) =>
          `<span class="gallery-dot ${i === 0 ? "active" : ""}" onclick="goToDetailSlide(${i})"></span>`
      )
      .join("");
  }

  // isi konten
  $("detail-villa-name").textContent = villa.name;
  $("detail-villa-location").querySelector("span").textContent = villa.location;
  $("detail-villa-capacity").textContent = `${villa.capacity} Tamu`;
  $("detail-villa-bedrooms").textContent = `${villa.bedrooms} Kamar Tidur`;
  $("detail-villa-price").textContent = `${formatPrice(villa.price)}/malam`;
  $("detail-villa-description").textContent = villa.description;

  const feat = $("detail-villa-features");
  feat.innerHTML = villa.features
    .map((f) => `<span class="px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">${f}</span>`)
    .join("");

  // tombol dari detail => booking
  $("book-from-detail").dataset.villaId = villa.id;

  $("detail-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // IMPORTANT FIX: supaya klik tombol slider di modal tidak ketutup overlay
  // stop klik di kotak modal biar tidak dianggap klik overlay
  const modalBox = $("detail-modal").querySelector(".bg-white");
  if (modalBox) {
    modalBox.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
      },
      { once: true }
    );
  }

  updateDetailGallery();
}

function closeDetailModal() {
  $("detail-modal").classList.add("hidden");
  document.body.style.overflow = "";
  detailVilla = null;
  detailSlide = 0;
}

/* ========= BOOKING MODAL ========= */
function openBookingModal(villaId) {
  selectedVilla = villas.find((v) => v.id === villaId);
  if (!selectedVilla) return;

  $("modal-villa-name").textContent = selectedVilla.name;
  $("modal-villa-price").textContent = `${formatPrice(selectedVilla.price)} / malam`;

  // min date today
  const today = new Date().toISOString().split("T")[0];
  $("check-in").min = today;
  $("check-out").min = today;

  $("booking-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // stop klik di kotak modal (biar overlay ga nutup)
  const modalBox = $("booking-modal").querySelector(".bg-white");
  if (modalBox) {
    modalBox.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
      },
      { once: true }
    );
  }
}

function closeBookingModal() {
  $("booking-modal").classList.add("hidden");
  document.body.style.overflow = "";
  selectedVilla = null;
}

/* ========= WHATSAPP ========= */
function sendWhatsApp(formData = null, villaForMessage = null) {
  const waNumber = CONFIG.whatsapp_number;

  let message = "";

  if (formData && villaForMessage) {
    message =
      `Halo Admin Villa Farfalla Lily! Saya ingin booking:\n\n` +
      `Villa: ${villaForMessage.name}\n` +
      `Lokasi: ${villaForMessage.location}\n` +
      `Harga: ${formatPrice(villaForMessage.price)}/malam\n\n` +
      `Nama: ${formData.name}\n` +
      `Check-in: ${formData.checkIn}\n` +
      `Check-out: ${formData.checkOut}\n` +
      `Tamu: ${formData.guests}\n` +
      (formData.notes ? `Catatan: ${formData.notes}\n` : "") +
      `\nMohon info ketersediaan ya. Terima kasih `;
  } else {
    message = "Halo Admin Villa Farfalla Lily! Saya mau tanya ketersediaan villa ";
  }

  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ========= FORM SUBMIT ========= */
function setupForm() {
  const form = $("booking-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: $("guest-name").value.trim(),
      checkIn: $("check-in").value,
      checkOut: $("check-out").value,
      guests: $("guests").value,
      notes: $("notes").value.trim(),
    };

    if (!selectedVilla) return;

    sendWhatsApp(data, selectedVilla);
    closeBookingModal();
    form.reset();
  });
}

/* ========= MOBILE MENU ========= */
function setupMobileMenu() {
  const btn = $("mobile-menu-btn");
  const menu = $("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => menu.classList.toggle("hidden"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.add("hidden")));
}

/* ========= CLOSE HANDLERS ========= */
function setupModalClose() {
  // booking
  $("close-modal")?.addEventListener("click", closeBookingModal);
  $("modal-overlay")?.addEventListener("click", closeBookingModal);

  // detail
  $("close-detail")?.addEventListener("click", closeDetailModal);
  $("detail-overlay")?.addEventListener("click", closeDetailModal);

  // dari detail ke booking
  $("book-from-detail")?.addEventListener("click", (e) => {
    const id = parseInt(e.currentTarget.dataset.villaId, 10);
    closeDetailModal();
    openBookingModal(id);
  });

  // ESC close
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("booking-modal").classList.contains("hidden")) closeBookingModal();
    if (!$("detail-modal").classList.contains("hidden")) closeDetailModal();
  });
}

/* ========= MAIN WA BUTTON ========= */
function setupMainWhatsApp() {
  $("main-whatsapp-btn")?.addEventListener("click", () => sendWhatsApp());
}

/* ========= INIT ========= */
function init() {
  // hapus kategori pantai: pastikan tombol filter "beach" tidak ada di HTML
  // (kalau masih ada, JS ini tetap aman: filter yang tidak ada datanya akan kosong)

  initMap();
  renderVillas("all");
  setupFilters();
  setupForm();
  setupMobileMenu();
  setupModalClose();
  setupMainWhatsApp();
}

document.addEventListener("DOMContentLoaded", init);

// Pastikan klik tombol slider tidak ketangkap modal
document.querySelectorAll(".gallery-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
  });
});
