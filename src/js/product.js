import { logMeal } from "./log.js";

const BASE_URL = "https://nutriplan-api.vercel.app/api/products";

let allProducts = [];
let activeGrade = "";

// ================= FETCH FUNCTIONS =================

async function searchProducts(query) {
  const res = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=1&limit=24`,
    { method: "GET", redirect: "follow" },
  );
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  return data.results || [];
}

async function getProductByBarcode(barcode) {
  const res = await fetch(`${BASE_URL}/barcode/${barcode}`, {
    method: "GET",
    redirect: "follow",
  });
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  // API returns { message, result: { barcode, name, brand, image, nutritionGrade, novaGroup, nutrients: {...} } }
  if (data.result) return [data.result];
  if (data.results) return data.results;
  return [data];
}

async function getProductsByCategory(categoryId) {
  const res = await fetch(
    `${BASE_URL}/category/${encodeURIComponent(categoryId)}?page=1&limit=24`,
    { method: "GET", redirect: "follow" },
  );
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  return data.results || [];
}

async function loadProductCategories() {
  const container = document.getElementById("product-categories");
  if (!container) return;

  const colorClasses = [
    {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      hover: "hover:bg-emerald-200",
    },
    { bg: "bg-blue-100", text: "text-blue-700", hover: "hover:bg-blue-200" },
    { bg: "bg-amber-100", text: "text-amber-700", hover: "hover:bg-amber-200" },
    {
      bg: "bg-purple-100",
      text: "text-purple-700",
      hover: "hover:bg-purple-200",
    },
    { bg: "bg-rose-100", text: "text-rose-700", hover: "hover:bg-rose-200" },
    { bg: "bg-teal-100", text: "text-teal-700", hover: "hover:bg-teal-200" },
    {
      bg: "bg-orange-100",
      text: "text-orange-700",
      hover: "hover:bg-orange-200",
    },
    { bg: "bg-pink-100", text: "text-pink-700", hover: "hover:bg-pink-200" },
    {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      hover: "hover:bg-indigo-200",
    },
    { bg: "bg-cyan-100", text: "text-cyan-700", hover: "hover:bg-cyan-200" },
  ];
  const icons = [
    "fa-cookie",
    "fa-glass-water",
    "fa-bread-slice",
    "fa-ice-cream",
    "fa-cheese",
    "fa-seedling",
    "fa-drumstick-bite",
    "fa-apple-whole",
    "fa-mug-hot",
    "fa-jar",
  ];

  try {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: "GET",
      redirect: "follow",
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const categories = data.results || [];

    container.innerHTML = categories
      .map((cat, i) => {
        const c = colorClasses[i % colorClasses.length];
        const icon = icons[i % icons.length];
        return `<button
        class="product-category-btn px-4 py-2 ${c.bg} ${c.text} ${c.hover} rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
        data-category-id="${cat.id}"
        data-category-name="${cat.name}">
        <i class="fa-solid ${icon}"></i>${cat.name}
      </button>`;
      })
      .join("");
  } catch {
    console.warn("Could not load categories, using static HTML buttons");
  }

  // ✅ FIX 1: كانت بتكال نفسها (infinite loop) — صح: attachCategoryListeners
  attachCategoryListeners();
}

// ================= HELPERS =================

function getNutriScoreColor(grade) {
  const colors = {
    a: "bg-green-500",
    b: "bg-lime-500",
    c: "bg-yellow-500",
    d: "bg-orange-500",
    e: "bg-red-500",
  };
  return colors[(grade || "").toLowerCase()] || "bg-gray-400";
}

function getNutriScoreLabel(grade) {
  const labels = { a: "Great", b: "Good", c: "Okay", d: "Poor", e: "Bad" };
  return labels[(grade || "").toLowerCase()] || "";
}

function getNovaColor(nova) {
  const colors = {
    1: "bg-green-500",
    2: "bg-lime-500",
    3: "bg-orange-400",
    4: "bg-red-500",
  };
  return colors[String(nova)] || "bg-gray-400";
}

function getNovaLabel(nova) {
  const labels = {
    1: "Unprocessed",
    2: "Processed ingredient",
    3: "Processed",
    4: "Ultra-processed",
  };
  return labels[String(nova)] || "";
}

function extractProduct(p) {
  const n = p.nutrients || p.nutriments || {};
  return {
    id: p.id || p.code || p.barcode || p.name || "",
    name: p.name || p.product_name || "Unknown Product",
    brand: p.brand || p.brands || "",
    image: p.image || p.image_url || p.imageUrl || "",
    quantity: p.quantity || p.serving_size || "",
    grade: (
      p.nutritionGrade ||
      p.nutriScore ||
      p.nutri_score ||
      p.nutrition_grades ||
      ""
    ).toLowerCase(),
    nova: p.novaGroup || p.nova_group || "",
    calories: Math.round(p.calories || n.calories || n.energy_kcal_100g || 0),
    protein: parseFloat(p.protein || n.protein || n.proteins_100g || 0),
    carbs: parseFloat(p.carbs || n.carbs || n.carbohydrates_100g || 0),
    fat: parseFloat(p.fat || n.fat || n.fat_100g || 0),
    sugar: parseFloat(p.sugar || n.sugar || n.sugars_100g || 0),
    saturatedFat: parseFloat(
      p.saturatedFat ||
        n.saturatedFat ||
        n.saturated_fat ||
        n.saturated_fat_100g ||
        0,
    ),
    fiber: parseFloat(p.fiber || n.fiber || n.fiber_100g || 0),
    salt: parseFloat(
      p.salt || n.salt || n.salt_100g || (n.sodium ? n.sodium * 2.5 : 0),
    ),
  };
}

// ================= TOAST =================

function showToast(message) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(to right, #10b981, #0d9488)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        padding: "12px 20px",
        boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
      },
    }).showToast();
  }
}

// ================= GRID MODE =================

function setGridMode(mode) {
  const grid = document.getElementById("products-grid");
  if (mode === "center") {
    grid.className = "flex items-center justify-center min-h-[300px] w-full";
  } else {
    grid.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";
  }
}

function setLoading(isLoading) {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("products-count");
  if (!isLoading) return;
  if (countEl) countEl.textContent = "Searching...";
  setGridMode("center");
  grid.innerHTML = `
    <div class="flex flex-col items-center gap-3 text-gray-400">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p class="text-sm font-medium">Searching products...</p>
    </div>`;
}

function setError(msg) {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("products-count");
  if (countEl) countEl.textContent = "";
  setGridMode("center");
  grid.innerHTML = `
    <div class="flex flex-col items-center text-center text-gray-400">
      <i class="fa-solid fa-triangle-exclamation text-4xl mb-3 text-orange-300"></i>
      <p class="text-base font-medium">${msg}</p>
    </div>`;
}

// ================= RENDER CARDS =================

function renderProducts(products) {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("products-count");

  if (!products || products.length === 0) {
    setGridMode("center");
    grid.innerHTML = `
      <div class="flex flex-col items-center text-center text-gray-400">
        <i class="fa-solid fa-box-open text-5xl mb-4 text-gray-300"></i>
        <p class="text-lg font-medium">No products found</p>
        <p class="text-sm mt-1">Try a different search term or barcode</p>
      </div>`;
    if (countEl) countEl.textContent = "No results found";
    return;
  }

  setGridMode("grid");
  if (countEl)
    countEl.textContent = `Found ${products.length} product${products.length !== 1 ? "s" : ""}`;

  grid.innerHTML = products
    .map((raw) => {
      const p = extractProduct(raw);
      const gradeColor = getNutriScoreColor(p.grade);
      const novaColor = getNovaColor(p.nova);
      const safeData = encodeURIComponent(JSON.stringify(raw));

      return `
        <div class="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
             data-product="${safeData}">

          <!-- Image Area -->
          <div style="height:150px;"  class="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
            ${
              p.image
                ? `<img class="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      src="${p.image}" alt="${p.name}" loading="lazy"
                      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : ""
            }
            <div class="${p.image ? "hidden" : "flex"} flex-col items-center gap-2 text-gray-300">
              <i class="fa-solid fa-box text-5xl"></i>
              <span class="text-xs">No image</span>
            </div>

            <!-- Nutri-Score Badge - TOP LEFT -->
            ${
              p.grade
                ? `<div style="margin:10px;" class="absolute top-0 left-0 ${gradeColor} text-white text-[10px] px-2.5 p-1 rounded-lg uppercase tracking-wide shadow-sm">
              NUTRI-SCORE ${p.grade.toUpperCase()}
            </div>`
                : ""
            }

            <!-- NOVA Badge - TOP RIGHT -->
            ${
              p.nova
                ? `<div style="margin:10px;" class="absolute top-0 p-2 right-0 ${novaColor} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-sm" title="NOVA ${p.nova}">
              ${p.nova}
            </div>`
                : ""
            }
          </div>

          <!-- Card Body -->
          <div class="p-4">
            ${p.brand ? `<p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brand}</p>` : ""}
            <h3 class="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors text-sm leading-snug">${p.name}</h3>

            <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <i class="fa-solid fa-fire-flame-curved text-orange-400"></i>
              <span class="font-semibold text-gray-600">${p.calories} kcal</span>
              <span>/ 100g</span>
              ${p.quantity ? `<span class="ml-auto text-gray-400">${p.quantity}</span>` : ""}
            </div>

            <!-- Macro pills -->
            <div class="grid grid-cols-4 gap-1 text-center">
              <div class="bg-emerald-50 rounded-lg py-1.5 px-1">
                <p class="text-xs font-bold text-emerald-700">${p.protein.toFixed(1)}g</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Protein</p>
              </div>
              <div class="bg-blue-50 rounded-lg py-1.5 px-1">
                <p class="text-xs font-bold text-blue-700">${p.carbs.toFixed(1)}g</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Carbs</p>
              </div>
              <div class="bg-purple-50 rounded-lg py-1.5 px-1">
                <p class="text-xs font-bold text-purple-700">${p.fat.toFixed(1)}g</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Fat</p>
              </div>
              <div class="bg-orange-50 rounded-lg py-1.5 px-1">
                <p class="text-xs font-bold text-orange-600">${p.sugar.toFixed(1)}g</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Sugar</p>
              </div>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

// ================= PRODUCT DETAILS MODAL =================

function showProductModal(raw) {
  const p = extractProduct(raw);
  const gradeColor = getNutriScoreColor(p.grade);
  const gradeLabel = getNutriScoreLabel(p.grade);
  const novaColor = getNovaColor(p.nova);
  const novaLabel = getNovaLabel(p.nova);

  document.getElementById("product-details-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "product-details-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div id="product-modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">

      <!-- Header -->
      <div class="flex items-start gap-4 p-6 pb-4">
        <div class="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          ${
            p.image
              ? `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-1"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="hidden w-full h-full items-center justify-center">
                 <i class="fa-solid fa-box text-3xl text-gray-300"></i>
               </div>`
              : `<i class="fa-solid fa-box text-3xl text-gray-300"></i>`
          }
        </div>
        <div class="flex-1 min-w-0">
          ${p.brand ? `<p class="text-xs text-emerald-600 font-semibold mb-0.5">${p.brand}</p>` : ""}
          <h3 class="text-lg font-bold text-gray-900 leading-tight">${p.name}</h3>
          ${p.quantity ? `<p class="text-xs text-gray-400 mt-1"><i class="fa-solid fa-weight-scale mr-1"></i>${p.quantity}</p>` : ""}
        </div>
        <button id="close-product-modal" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Badges -->
      ${
        p.grade || p.nova
          ? `
      <div class="flex gap-2 px-6 pb-4">
        ${
          p.grade
            ? `<div class="flex items-center gap-1.5 ${gradeColor} text-white px-3 py-1.5 rounded-lg">
          <span class="text-sm font-bold">Nutri-Score ${p.grade.toUpperCase()}</span>
          ${gradeLabel ? `<span class="text-xs opacity-80">• ${gradeLabel}</span>` : ""}
        </div>`
            : ""
        }
        ${
          p.nova
            ? `<div class="flex items-center gap-1.5 ${novaColor} text-white px-3 py-1.5 rounded-lg">
          <span class="text-sm font-bold">NOVA ${p.nova}</span>
          ${novaLabel ? `<span class="text-xs opacity-80">• ${novaLabel}</span>` : ""}
        </div>`
            : ""
        }
      </div>`
          : ""
      }

      <!-- Nutrition Facts -->
      <div style="margin: 20px;" class=" bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3">
          <i class="fa-solid fa-chart-pie text-emerald-600"></i>
          <span class="font-bold text-gray-900">Nutrition Facts</span>
          <span class="text-xs text-gray-500 ml-auto">(per 100g)</span>
        </div>

        <!-- Calories -->
        <div class="text-center mb-4">
          <p class="text-4xl font-bold text-gray-900">${p.calories}</p>
          <p class="text-sm text-gray-500">Calories</p>
        </div>

        <!-- Macro Bars -->
        <div class="space-y-2.5 mb-4">
          ${[
            {
              label: "Protein",
              value: p.protein,
              color: "bg-emerald-500",
              textColor: "text-emerald-600",
              max: 100,
            },
            {
              label: "Carbs",
              value: p.carbs,
              color: "bg-blue-500",
              textColor: "text-blue-600",
              max: 300,
            },
            {
              label: "Fat",
              value: p.fat,
              color: "bg-purple-500",
              textColor: "text-purple-600",
              max: 100,
            },
            {
              label: "Sugar",
              value: p.sugar,
              color: "bg-orange-500",
              textColor: "text-orange-600",
              max: 100,
            },
          ]
            .map(
              (m) => `
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-gray-600">${m.label}</span>
                <span class="font-bold ${m.textColor}">${m.value.toFixed(1)}g</span>
              </div>
              <div class="w-full bg-white rounded-full h-2">
                <div class="${m.color} h-2 rounded-full" style="width:${Math.min(100, (m.value / m.max) * 100)}%"></div>
              </div>
            </div>`,
            )
            .join("")}
        </div>

        <!-- Extra nutrients -->
        <div class="grid grid-cols-3 gap-2 text-center border-t border-emerald-100 pt-3">
          <div>
            <p class="text-sm font-bold text-gray-700">${p.saturatedFat.toFixed(1)}g</p>
            <p class="text-[10px] text-gray-500">Saturated Fat</p>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-700">${p.fiber.toFixed(1)}g</p>
            <p class="text-[10px] text-gray-500">Fiber</p>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-700">${p.salt.toFixed(2)}g</p>
            <p class="text-[10px] text-gray-500">Salt</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 px-6 pb-6 mb-3">
        <button id="modal-log-food-btn"
          class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          data-product="${encodeURIComponent(JSON.stringify(raw))}">
          <i class="fa-solid fa-plus"></i> Log This Food
        </button>
        <button id="close-product-modal-btn"
          class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all">
          Close
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  function closeModal() {
    modal.remove();
  }

  document
    .getElementById("close-product-modal")
    .addEventListener("click", closeModal);
  document
    .getElementById("close-product-modal-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("product-modal-backdrop")
    .addEventListener("click", closeModal);

  document
    .getElementById("modal-log-food-btn")
    .addEventListener("click", () => {
      logMeal({
        id: `product_${p.id || p.name}`,
        name: p.name,
        image: p.image || null,
        calories: p.calories,
        protein: Math.round(p.protein),
        carbs: Math.round(p.carbs),
        fat: Math.round(p.fat),
        servings: 1,
      });
      closeModal();
      showToast(`${p.name} logged to your daily intake! 📋`);
    });
}

// ================= FILTER =================

function applyGradeFilter() {
  if (!activeGrade) {
    renderProducts(allProducts);
    return;
  }

  setLoading(true);

  setTimeout(() => {
    const filtered = allProducts.filter((p) => {
      const grade = (
        p.nutritionGrade ||
        p.nutriScore ||
        p.nutri_score ||
        p.nutrition_grades ||
        ""
      ).toLowerCase();
      return grade === activeGrade;
    });
    renderProducts(filtered);
  }, 300);
}

// ================= CATEGORY BUTTONS =================

function attachCategoryListeners() {
  document
    .getElementById("product-categories")
    ?.addEventListener("click", async (e) => {
      const btn = e.target.closest(".product-category-btn");
      if (!btn) return;

      document
        .querySelectorAll(".product-category-btn")
        .forEach((b) =>
          b.classList.remove("ring-2", "ring-offset-1", "ring-emerald-500"),
        );
      btn.classList.add("ring-2", "ring-offset-1", "ring-emerald-500");

      // ✅ FIX 2: بدل textContent استخدم data-category-id
      const categoryId = btn.dataset.categoryId || btn.dataset.category;
      setLoading(true);
      try {
        allProducts = await getProductsByCategory(categoryId);
        applyGradeFilter();
      } catch {
        setError("Failed to load products. Please try again.");
      }
    });
}

// ================= INIT =================

export function initProducts() {
  const searchBtn = document.getElementById("search-product-btn");
  const searchInput = document.getElementById("product-search-input");

  async function doSearch() {
    const q = searchInput?.value.trim();
    if (!q) return;
    setLoading(true);
    activeGrade = "";
    document.querySelectorAll(".nutri-score-filter").forEach((b) => {
      b.classList.remove("bg-emerald-600", "text-white");
    });
    document
      .querySelector('.nutri-score-filter[data-grade=""]')
      ?.classList.add("bg-emerald-600", "text-white");
    try {
      allProducts = await searchProducts(q);
      renderProducts(allProducts);
    } catch {
      setError("Search failed. Please check your connection and try again.");
    }
  }

  searchBtn?.addEventListener("click", doSearch);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  const barcodeBtn = document.getElementById("lookup-barcode-btn");
  const barcodeInput = document.getElementById("barcode-input");

  async function doBarcode() {
    const code = barcodeInput?.value.trim();
    if (!code) return;
    setLoading(true);
    activeGrade = "";
    try {
      allProducts = await getProductByBarcode(code);
      renderProducts(allProducts);
    } catch {
      setError(`No product found for barcode: ${code}`);
    }
  }

  barcodeBtn?.addEventListener("click", doBarcode);
  barcodeInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doBarcode();
  });

  document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeGrade = btn.dataset.grade;
      document.querySelectorAll(".nutri-score-filter").forEach((b) => {
        b.classList.remove("bg-emerald-600", "text-white");
      });
      btn.classList.add("bg-emerald-600", "text-white");
      applyGradeFilter();
    });
  });

  document.getElementById("products-grid")?.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    try {
      const raw = JSON.parse(decodeURIComponent(card.dataset.product));
      showProductModal(raw);
    } catch {}
  });

  loadProductCategories();
}
