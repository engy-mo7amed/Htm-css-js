import { logMeal } from "./log.js";

const USDA_API_KEY = "VpNcjIZtHITr02R7S04jJUCgMQg5OhMDUaWKIENy";
const nutritionCache = new Map();

export async function getMealDetails(mealId) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    );
    const data = await response.json();
    if (!data.meals?.[0]) return;

    const meal = data.meals[0];
    renderMealDetails(meal);
    loadNutritionAsync(meal);
  } catch (error) {
    console.error(error);
  }
}

async function loadNutritionAsync(meal) {
  const cacheKey = meal.idMeal;
  if (nutritionCache.has(cacheKey)) {
    updateNutritionFacts(nutritionCache.get(cacheKey));
    restoreLogBtn();
    return;
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing?.trim()) ingredients.push(`${meas} ${ing}`);
  }

  try {
    const res = await fetch(
      "https://nutriplan-api.vercel.app/api/nutrition/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": USDA_API_KEY,
        },
        body: JSON.stringify({ recipeName: meal.strMeal, ingredients }),
      },
    );

    if (!res.ok) throw new Error(res.status);

    const { data } = await res.json();
    nutritionCache.set(cacheKey, data);
    updateNutritionFacts(data);
    document.getElementById("loadingg").classList.add("hidden");
    document.getElementById("carddata").classList.remove("hidden");

    // ✅ رجّع الزرار بعد ما الداتا تيجي
    restoreLogBtn();
  } catch (err) {
    console.warn("API failed:", err);
    restoreLogBtn();
  }
}

function setLogBtnLoading() {
  const logBtn = document.getElementById("log-meal-btn");
  if (!logBtn) return;
  logBtn.disabled = true;
  logBtn.className =
    "flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed";
  logBtn.innerHTML = `
    <span class="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
    Calculating...`;
}

function restoreLogBtn() {
  const logBtn = document.getElementById("log-meal-btn");
  if (!logBtn) return;
  logBtn.disabled = false;
  logBtn.className =
    "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all";
  logBtn.innerHTML = `<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>`;
}

export function renderMealDetails(meal) {
  const section = document.getElementById("meal-details");

  [
    "search-filters-section",
    "meal-categories-section",
    "all-recipes-section",
  ].forEach((id) => document.getElementById(id)?.classList.add("hidden"));
  section.classList.remove("hidden");

  section.querySelector("img").src = meal.strMealThumb;
  const title = section.querySelector("h1");
  title.textContent = meal.strMeal;

  const tags = title.previousElementSibling;
  tags.innerHTML = [
    meal.strCategory &&
      `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span>`,
    meal.strArea &&
      `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>`,
    ...(meal.strTags
      ?.split(",")
      .map(
        (t) =>
          t.trim() &&
          `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${t.trim()}</span>`,
      ) || []),
  ]
    .filter(Boolean)
    .join("");

  document.getElementById("log-meal-btn")?.setAttribute("data-id", meal.idMeal);

  setLogBtnLoading();

  const ingContainer = section.querySelector(
    ".grid.grid-cols-1.md\\:grid-cols-2.gap-3",
  );
  let count = 0,
    ingHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`],
      meas = meal[`strMeasure${i}`];
    if (ing?.trim()) {
      count++;
      ingHTML += `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700"><span class="font-medium text-gray-900">${meas || ""}</span> ${ing}</span>
        </div>`;
    }
  }
  ingContainer.innerHTML = ingHTML;
  section.querySelector("h2 .text-sm.font-normal").textContent =
    `${count} items`;

  const instContainer = section.querySelector(".space-y-4");
  instContainer.innerHTML =
    meal.strInstructions
      ?.split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length)
      .map(
        (step, i) => `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div>
        <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
      </div>`,
      )
      .join("") || "";

  const videoSection = section.querySelector(".video-section");
  if (videoSection) {
    if (meal.strYoutube) {
      videoSection.classList.remove("hidden");
      const videoId = meal.strYoutube.split("v=")[1]?.split("&")[0];
      if (videoId)
        videoSection.querySelector("iframe").src =
          `https://www.youtube.com/embed/${videoId}`;
    } else {
      videoSection.classList.add("hidden");
    }
  }

  showNutritionLoading();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showNutritionLoading() {
  [
    "nutrition-calories",
    "nutrition-protein",
    "nutrition-carbs",
    "nutrition-fat",
    "nutrition-fiber",
    "nutrition-sugar",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.innerHTML =
        '<span class="inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>';
  });
  const total = document.getElementById("nutrition-total-calories");
  if (total) total.textContent = "Calculating...";
}

function updateNutritionFacts(data) {
  const p = data.perServing,
    s = data.servings || 4;

  setText("nutrition-calories", Math.round(p.calories || 0));
  setText(
    "nutrition-total-calories",
    `Total: ${Math.round((p.calories || 0) * s)} cal`,
  );
  setText("hero-servings", `${s} servings`);
  setText("hero-calories", `${Math.round(p.calories || 0)} cal/serving`);

  setBar("nutrition-protein", "bar-protein", p.protein, 100);
  setBar("nutrition-carbs", "bar-carbs", p.carbs, 300);
  setBar("nutrition-fat", "bar-fat", p.fat, 100);
  setBar("nutrition-fiber", "bar-fiber", p.fiber, 50);
  setBar("nutrition-sugar", "bar-sugar", p.sugar, 100);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setBar(valId, barId, value, max) {
  const v = parseFloat(value) || 0;
  setText(valId, `${Math.round(v)}g`);
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = `${Math.min(100, (v / max) * 100)}%`;
}

export function closeMealDetails() {
  document.getElementById("meal-details").classList.add("hidden");
  [
    "search-filters-section",
    "meal-categories-section",
    "all-recipes-section",
  ].forEach((id) => document.getElementById(id)?.classList.remove("hidden"));
}

// ================= LOG MEAL MODAL =================

function showLogMealModal(mealId) {
  const cached = nutritionCache.get(mealId);
  const name = document.querySelector("#meal-details h1")?.textContent || "";
  const image = document.querySelector("#meal-details img")?.src || "";

  const perServing = {
    calories: Math.round(cached?.perServing?.calories || 0),
    protein: Math.round(cached?.perServing?.protein || 0),
    carbs: Math.round(cached?.perServing?.carbs || 0),
    fat: Math.round(cached?.perServing?.fat || 0),
  };

  let servings = 1;

  document.getElementById("log-meal-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "log-meal-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div id="modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
      <div class="flex items-center gap-4 mb-6">
        <img src="${image}" alt="${name}" class="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Log This Meal</p>
          <h3 class="text-lg font-bold text-gray-900 leading-tight">${name}</h3>
        </div>
      </div>
      <div class="mb-5">
        <p class="text-sm font-semibold text-gray-700 mb-3">Number of Servings</p>
        <div class="flex items-center gap-4">
          <button id="modal-minus" class="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-lg">−</button>
          <span id="modal-servings-count" class="text-2xl font-bold text-gray-900 w-8 text-center">1</span>
          <button id="modal-plus" class="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-lg">+</button>
        </div>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 mb-6">
        <p class="text-xs text-gray-500 mb-3">Estimated nutrition per serving:</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div>
            <p id="modal-calories" class="text-lg font-bold text-emerald-600">${perServing.calories}</p>
            <p class="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p id="modal-protein" class="text-lg font-bold text-blue-600">${perServing.protein}g</p>
            <p class="text-xs text-gray-500">Protein</p>
          </div>
          <div>
            <p id="modal-carbs" class="text-lg font-bold text-amber-600">${perServing.carbs}g</p>
            <p class="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p id="modal-fat" class="text-lg font-bold text-purple-600">${perServing.fat}g</p>
            <p class="text-xs text-gray-500">Fat</p>
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <button id="modal-cancel" class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">Cancel</button>
        <button id="modal-confirm" class="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          <i class="fa-solid fa-clipboard-list"></i> Log Meal
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  function updateNutritionPreview() {
    document.getElementById("modal-servings-count").textContent = servings;
    document.getElementById("modal-calories").textContent = Math.round(
      perServing.calories * servings,
    );
    document.getElementById("modal-protein").textContent =
      Math.round(perServing.protein * servings) + "g";
    document.getElementById("modal-carbs").textContent =
      Math.round(perServing.carbs * servings) + "g";
    document.getElementById("modal-fat").textContent =
      Math.round(perServing.fat * servings) + "g";
  }

  document.getElementById("modal-minus").addEventListener("click", () => {
    if (servings > 1) {
      servings--;
      updateNutritionPreview();
    }
  });

  document.getElementById("modal-plus").addEventListener("click", () => {
    if (servings < 10) {
      servings++;
      updateNutritionPreview();
    }
  });

  function closeModal() {
    modal.remove();
  }

  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document
    .getElementById("modal-backdrop")
    .addEventListener("click", closeModal);

  document.getElementById("modal-confirm").addEventListener("click", () => {
    const totalCals = Math.round(perServing.calories * servings);

    logMeal({
      id: mealId,
      name,
      image,
      calories: totalCals,
      protein: Math.round(perServing.protein * servings),
      carbs: Math.round(perServing.carbs * servings),
      fat: Math.round(perServing.fat * servings),
      servings,
    });

    closeModal();

    setTimeout(() => {
      window.Swal.fire({
        icon: "success",
        title: "Meal Logged!",
        html: `<p>${name} (${servings} serving${servings > 1 ? "s" : ""}) has been added to your daily log.</p>
               <p class="text-emerald-600 font-bold text-lg mt-2">+${totalCals} calories</p>`,
        confirmButtonColor: "#10b981",
        timer: 2500,
        timerProgressBar: true,
      });
    }, 100);
  });
}

// ================= EVENT LISTENERS =================

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-id]");
  if (card && !e.target.closest("#log-meal-btn")) {
    const id = card.getAttribute("data-id");
    if (id) getMealDetails(id);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#back-to-meals-btn")) closeMealDetails();
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#log-meal-btn")) {
    const btn = e.target.closest("#log-meal-btn");
    const mealId = btn.getAttribute("data-id");
    if (!mealId || btn.disabled) return;
    showLogMealModal(mealId);
  }
});
