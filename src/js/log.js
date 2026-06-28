const GOALS = { calories: 2000, protein: 50, carbs: 250, fat: 65 };
const STORAGE_KEY = "nutriplan_foodlog";

let loggedItems = loadFromStorage();

function loadFromStorage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const today = getTodayKey();
    return data[today] || [];
  } catch {
    return [];
  }
}

function saveToStorage() {
  try {
    const today = getTodayKey();
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    all[today] = loggedItems;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save food log:", e);
  }
}

function getWeeklyData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTotals() {
  return loggedItems.reduce(
    (acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fat += item.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function logMeal(meal) {
  // meal = { id, name, image, calories, protein, carbs, fat, servings }
  const existing = loggedItems.find((i) => i.id === meal.id);
  if (existing) {
    existing.servings = (existing.servings || 1) + 1;
    existing.calories = Math.round(
      (meal.calories / (meal.servings || 1)) * existing.servings,
    );
    existing.protein = Math.round(
      (meal.protein / (meal.servings || 1)) * existing.servings,
    );
    existing.carbs = Math.round(
      (meal.carbs / (meal.servings || 1)) * existing.servings,
    );
    existing.fat = Math.round(
      (meal.fat / (meal.servings || 1)) * existing.servings,
    );
  } else {
    loggedItems.push({
      ...meal,
      servings: 1,
      loggedAt: new Date().toISOString(),
    });
  }
  saveToStorage();
  renderFoodLog();
}

export function renderFoodLog() {
  renderDate();
  renderSummary();
  renderLoggedItems();
  renderWeeklyChart();
}

function renderDate() {
  const el = document.getElementById("foodlog-date");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function renderSummary() {
  const totals = getTotals();

  const fields = [
    { key: "calories", unit: "kcal" },
    { key: "protein", unit: "g" },
    { key: "carbs", unit: "g" },
    { key: "fat", unit: "g" },
  ];

  const section = document.getElementById("foodlog-today-section");
  if (!section) return;

  // جلب كروت الماكروز الأربعة
  const cards = section.querySelectorAll(".grid > div");

  fields.forEach(({ key, unit }, i) => {
    const card = cards[i];
    if (!card) return;

    const goal = GOALS[key];
    const current = Math.round(totals[key]);
    const pct = Math.min(100, Math.round((current / goal) * 100));

    // 1. تحديث النسبة المئوية (أعلى اليمين)
    const pctEl = card.querySelector(".macro-pct");
    if (pctEl) pctEl.textContent = `${pct}%`;

    // 2. تحديث الـ Progress Bar
    const bar = card.querySelector(".macro-bar");
    if (bar) bar.style.width = pct + "%";

    // 3. تحديث الأرقام الحالية والمستهدفة بالأسفل بشكل منفصل
    const currentEl = card.querySelector(".macro-current");
    if (currentEl) currentEl.textContent = `${current} ${unit}`;

    const goalEl = card.querySelector(".macro-goal");
    if (goalEl) goalEl.textContent = `/ ${goal} ${unit}`;
  });

  // تحديث عدد العناصر في الهيدر
  const countEl = document.getElementById("logged-items-count");
  if (countEl) countEl.textContent = `Logged Items (${loggedItems.length})`;

  // إظهار أو إخفاء زر Clear All
  const clearBtn = document.getElementById("clear-foodlog");
  if (clearBtn) {
    clearBtn.style.display = loggedItems.length ? "inline-flex" : "none";
  }
}

function renderLoggedItems() {
  const container = document.getElementById("logged-items-list");
  if (!container) return;

  if (loggedItems.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <i class="fa-solid fa-utensils text-3xl mb-2 text-gray-300"></i>
        <p class="font-medium text-sm">No meals logged today</p>
        <p class="text-xs text-gray-400 mt-0.5">Add meals from the Meals page or scan products</p>
      </div>`;
    return;
  }

  container.innerHTML = loggedItems
    .map(
      (item) => `
    <div class="flex items-center justify-between gap-4 p-3 bg-gray-50/40 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all" data-item-id="${item.id}">
      
      <div class="flex items-center gap-3 flex-1 min-w-0">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />`
            : `<div class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-gray-100">
                 <i class="fa-solid fa-utensils text-emerald-500 text-base"></i>
               </div>`
        }
        <div class="min-w-0">
          <p class="font-bold text-gray-900 text-sm truncate">${item.name}</p>
          <div class="flex items-center flex-wrap gap-x-2 text-[11px] text-gray-400 mt-0.5">
            <span class="font-medium text-gray-500">${item.servings || 1} serving</span>
            <span class="text-gray-300">•</span>
            <span class="text-emerald-600 font-semibold">Recipe</span>
            ${item.loggedAt ? `<span class="text-gray-300">•</span><span class="text-gray-400">${new Date(item.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>` : ""}
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-4 shrink-0">
        <div class="text-right min-w-[55px]">
          <span class="block text-base font-bold text-emerald-600">${item.calories}</span>
          <span class="block text-[10px] text-gray-400 font-medium -mt-1">kcal</span>
        </div>

        <div class="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <span class="px-2 py-0.5 bg-white rounded border border-gray-100 text-gray-600">${item.protein}g <span class="text-gray-400 font-normal">P</span></span>
          <span class="px-2 py-0.5 bg-white rounded border border-gray-100 text-gray-600">${item.carbs}g <span class="text-gray-400 font-normal">C</span></span>
          <span class="px-2 py-0.5 bg-white rounded border border-gray-100 text-gray-600">${item.fat}g <span class="text-gray-400 font-normal">F</span></span>
        </div>

        <button
          class="remove-item-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          data-id="${item.id}"
          title="Remove"
        >
          <i class="fa-regular fa-trash-can text-xs"></i>
        </button>
      </div>

    </div>`,
    )
    .join("");

  // تفعيل أزرار الحذف
  container.querySelectorAll(".remove-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeItem(btn.dataset.id));
  });
}

function removeItem(id) {
  loggedItems = loggedItems.filter((i) => i.id !== id);
  saveToStorage();
  renderFoodLog();
}

function renderWeeklyChart() {
  const container = document.getElementById("weekly-chart");
  if (!container) return;

  const weeklyData = getWeeklyData();
  const todayKey = getTodayKey();

  let totalCaloriesThisWeek = 0;
  let totalItemsThisWeek = 0;
  let daysOnGoalCount = 0;
  let loggedDaysCount = 0;

  let htmlContent = `<div class="grid grid-cols-7 gap-2 p-2 bg-white rounded-xl border border-gray-100 shadow-sm w-full">`;

  // توليد آخر 7 أيام ديناميكياً
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];

    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();

    const items = weeklyData[key] || [];
    const dayCalories = items.reduce(
      (sum, item) => sum + (item.calories || 0),
      0,
    );

    totalCaloriesThisWeek += dayCalories;
    totalItemsThisWeek += items.length;
    if (dayCalories > 0) loggedDaysCount++;
    if (dayCalories > 0 && dayCalories <= GOALS.calories) daysOnGoalCount++;

    const isToday = key === todayKey;

    const cardClass = isToday
      ? "bg-indigo-50 border-2 border-indigo-200 text-indigo-950 shadow-sm"
      : "bg-gray-50/50 hover:bg-gray-50 border border-gray-100 text-gray-500";

    const kcalClass =
      isToday && dayCalories > 0
        ? "text-emerald-600 font-bold"
        : dayCalories > 0
          ? "text-emerald-500 font-semibold"
          : "text-gray-300 font-medium";

    htmlContent += `
      <div class="flex flex-col items-center justify-between p-3 rounded-xl transition-all text-center min-h-[120px] ${cardClass}">
        <div class="text-xs font-medium text-gray-400 uppercase">${dayName}</div>
        <div class="text-base font-bold my-1 text-gray-800">${dayNum}</div>
        <div class="mt-auto">
          <span class="block text-sm ${kcalClass}">${dayCalories}</span>
          <span class="block text-[9px] text-gray-400 -mt-0.5">kcal</span>
          ${items.length > 0 ? `<span class="block text-[9px] text-indigo-400 font-medium mt-0.5">${items.length} items</span>` : '<span class="block text-[9px] text-transparent mt-0.5">0 items</span>'}
        </div>
      </div>
    `;
  }

  htmlContent += `</div>`;
  container.innerHTML = htmlContent;

  // تحديث كروت الإحصائيات السفلية
  const avgWeeklyWeeklyEl = document.getElementById("stat-weekly-avg");
  if (avgWeeklyWeeklyEl) {
    const avg = loggedDaysCount > 0 ? Math.round(totalCaloriesThisWeek / 7) : 0;
    avgWeeklyWeeklyEl.textContent = `${avg} kcal`;
  }

  const totalItemsEl = document.getElementById("stat-total-items");
  if (totalItemsEl) {
    totalItemsEl.textContent = `${totalItemsThisWeek} items`;
  }

  const daysOnGoalEl = document.getElementById("stat-days-goal");
  if (daysOnGoalEl) {
    daysOnGoalEl.textContent = `${daysOnGoalCount} / 7`;
  }
}

function initQuickActions() {
  const [logMealBtn, scanBtn, customBtn] =
    document.querySelectorAll(".quick-log-btn");

  if (logMealBtn) {
    logMealBtn.addEventListener("click", () => {
      document.querySelector('[data-section="meals-section"]')?.click();
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      document.querySelector('[data-section="products-section"]')?.click();
    });
  }

  if (customBtn) {
    customBtn.addEventListener("click", showCustomEntryModal);
  }
}

function showCustomEntryModal() {
  Swal.fire({
    title: "Add Custom Food",
    html: `
      <div class="text-left space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Food Name *</label>
          <input id="swal-name" class="swal2-input w-full" placeholder="e.g. Grilled Salmon" style="margin:0;width:100%">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Calories (kcal) *</label>
            <input id="swal-calories" type="number" min="0" class="swal2-input" placeholder="0" style="margin:0;width:100%">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
            <input id="swal-protein" type="number" min="0" class="swal2-input" placeholder="0" style="margin:0;width:100%">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
            <input id="swal-carbs" type="number" min="0" class="swal2-input" placeholder="0" style="margin:0;width:100%">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
            <input id="swal-fat" type="number" min="0" class="swal2-input" placeholder="0" style="margin:0;width:100%">
          </div>
        </div>
      </div>`,
    confirmButtonText: "Add to Log",
    confirmButtonColor: "#10b981",
    showCancelButton: true,
    preConfirm: () => {
      const name = document.getElementById("swal-name").value.trim();
      const calories =
        parseFloat(document.getElementById("swal-calories").value) || 0;
      const protein =
        parseFloat(document.getElementById("swal-protein").value) || 0;
      const carbs =
        parseFloat(document.getElementById("swal-carbs").value) || 0;
      const fat = parseFloat(document.getElementById("swal-fat").value) || 0;

      if (!name) {
        Swal.showValidationMessage("Please enter a food name");
        return false;
      }
      if (calories <= 0) {
        Swal.showValidationMessage("Please enter calories");
        return false;
      }
      return {
        id: `custom_${Date.now()}`,
        name,
        calories,
        protein,
        carbs,
        fat,
        image: null,
      };
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      logMeal(result.value);
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: `${result.value.name} has been logged.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

function initClearBtn() {
  const btn = document.getElementById("clear-foodlog");
  if (!btn) return;
  btn.addEventListener("click", () => {
    Swal.fire({
      title: "Clear all logged items?",
      text: "This will remove all meals logged today.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, clear all",
    }).then((result) => {
      if (result.isConfirmed) {
        loggedItems = [];
        saveToStorage();
        renderFoodLog();
      }
    });
  });
}

export function initFoodLog() {
  renderFoodLog();
  initQuickActions();
  initClearBtn();
}
