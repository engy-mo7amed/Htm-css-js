// ================= SIDEBAR =================

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
const menuBtn = document.getElementById("header-menu-btn");
const closeBtn = document.getElementById("sidebar-close-btn");

function openSidebar() {
  sidebar.classList.add("sidebar-active");
  overlay.classList.add("active");
}

function closeSidebar() {
  sidebar.classList.remove("sidebar-active");
  overlay.classList.remove("active");
}

menuBtn.addEventListener("click", openSidebar);
overlay.addEventListener("click", closeSidebar);
closeBtn.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});

// ================= NAVIGATION =================

const navLinks = document.querySelectorAll(".nav-link");
const allSections = document.querySelectorAll(".app-section");

function showSection(sectionId) {
  allSections.forEach((section) => {
    section.classList.add("hidden");
  });

  const selectedSection = document.getElementById(sectionId);
  selectedSection?.classList.remove("hidden");
  document.getElementById("header").innerHTML = `<div class="px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <button id="header-menu-btn" aria-label="Toggle menu">
                <i class="fa-solid fa-bars"></i>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                 ${
                   sectionId === "meals-section"
                     ? "Meals & Recipes"
                     : sectionId === "products-section"
                       ? "Product Scanner"
                       : "Food Log"
                 }
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                  ${sectionId === "meals-section" 
                  ? "Discover delicious and nutritious recipes tailored for you"
                  : sectionId === "products-section"
                  ? "Search packaged foods by name or barcode"
                  : "Track your daily nutrition and food intake"}
                </p>
              </div>
            </div>
          </div>
        </div>`;

  navLinks.forEach((link) => {
    link.classList.remove("bg-emerald-50", "text-emerald-700");
    link.classList.add("text-gray-600", "hover:bg-gray-50");
  });

  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);

  activeLink.classList.add("bg-emerald-50", "text-emerald-700");
  activeLink.classList.remove("text-gray-600", "hover:bg-gray-50");

  history.pushState(null, "", `#${sectionId}`);

  closeSidebar();
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const sectionId = link.dataset.section;

    showSection(sectionId);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const loadingOverlay = document.getElementById("app-loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500);
  }

  const currentHash = window.location.hash;
  const sectionId = currentHash ? currentHash.replace("#", "") : "meals-section";
  if (document.getElementById(sectionId)) {
    showSection(sectionId);
  } else {
    showSection("meals-section");
  }
});



