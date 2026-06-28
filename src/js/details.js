import { logMeal } from "./log.js";
const USDA_API_KEY = "VpNcjIZtHITr02R7S04jJUCgMQg5OhMDUaWKIENy";
const card = document.getElementsByClassName("recipe-card");

let currentMeal = null;
let currentNutrition = null;

export async function getDetails(mealId) {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/${mealId}`,
      {
        method: "GET",
        redirect: "follow",
      },
    );
    const data = await response.json();
    const mealData = data.result;

    currentMeal = mealData;
    currentNutrition = null;

    displayDetails(mealData, null);

    const ingredients = mealData.ingredients.map(
      (i) => `${i.measure} ${i.ingredient}`,
    );

    getNutrition(mealData.name, ingredients).then((nutritionData) => {
      currentNutrition = nutritionData;
      updateNutritionDOM(nutritionData);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getNutrition(recipeName, ingredients) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", USDA_API_KEY);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      recipeName: recipeName,
      ingredients: ingredients,
    });

    const response = await fetch(
      "https://nutriplan-api.vercel.app/api/nutrition/analyze",
      {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      },
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}

function updateNutritionDOM(nutritionData) {
  if (!nutritionData || !nutritionData.data || !nutritionData.data.perServing)
    return;

  const ps = nutritionData.data.perServing;
  const totals = nutritionData.data.totals;

  const heroCal = document.getElementById("hero-calories");
  if (heroCal) heroCal.textContent = Math.round(ps.calories) + " cal/serving";

  const container = document.getElementById("nutrition-facts-container");
  if (container) {
    container.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>

      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p id="nutrition-calories" class="text-4xl font-bold text-emerald-600">${Math.round(ps.calories)}</p>
        <p id="nutrition-total-calories" class="text-xs text-gray-500 mt-1">Total: ${Math.round(totals.calories)} cal</p>
      </div>

      <div class="space-y-4">
        <!-- Protein -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span class="text-gray-700">Protein</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(ps.protein)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.round((ps.protein / 50) * 100))}%"></div>
          </div>
        </div>

        <!-- Carbs -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-gray-700">Carbs</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(ps.carbs)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.round((ps.carbs / 250) * 100))}%"></div>
          </div>
        </div>

        <!-- Fat -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-purple-500"></div>
              <span class="text-gray-700">Fat</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(ps.fat)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.round((ps.fat / 65) * 100))}%"></div>
          </div>
        </div>

        <!-- Fiber -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-orange-500"></div>
              <span class="text-gray-700">Fiber</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(ps.fiber)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-orange-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.round((ps.fiber / 25) * 100))}%"></div>
          </div>
        </div>

        <!-- Sugar -->
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-pink-500"></div>
              <span class="text-gray-700">Sugar</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(ps.sugar)}g</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-pink-500 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.round((ps.sugar / 50) * 100))}%"></div>
          </div>
        </div>
      </div>

      <!-- Extra Nutrition Info -->
      <div class="mt-6 pt-4 border-t border-gray-100">
        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-sm font-bold text-gray-700">${Math.round(ps.saturatedFat)}g</p>
            <p class="text-[10px] text-gray-500">Saturated Fat</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-sm font-bold text-gray-700">${Math.round(ps.cholesterol)}mg</p>
            <p class="text-[10px] text-gray-500">Cholesterol</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-sm font-bold text-gray-700">${Math.round(ps.sodium)}mg</p>
            <p class="text-[10px] text-gray-500">Sodium</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-2">
            <p class="text-sm font-bold text-gray-700">${Math.round(totals.protein)}g</p>
            <p class="text-[10px] text-gray-500">Total Protein</p>
          </div>
        </div>
      </div>
    `;
  }
}

function openLogModal() {
  const meal = currentMeal;
  const nutrition = currentNutrition;
  if (!meal || !nutrition) return;

  const perServing = nutrition.data.perServing;
  let servings = 1;

  const modal = document.createElement("div");
  modal.id = "log-meal-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div id="modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
      <div class="flex items-center gap-4 mb-6">
        <img src="${meal.thumbnail}" alt="${meal.name}" class="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Log This Meal</p>
          <h3 class="text-lg font-bold text-gray-900 leading-tight">${meal.name}</h3>
        </div>
      </div>
      <div class="mb-5">
        <p class="text-sm font-semibold text-gray-700 mb-3">Number of Servings</p>
        <div class="flex items-center gap-4 mb-4">
          <button id="modal-minus" class="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-lg">−</button>
          <span id="modal-servings-count" class="text-2xl font-bold text-gray-900 w-8 text-center">1</span>
          <button id="modal-plus" class="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-lg">+</button>
        </div>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 mb-6">
        <p class="text-xs text-gray-500 mb-3">Estimated nutrition per serving:</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div>
            <p id="modal-calories" class="text-lg font-bold text-emerald-600">${Math.round(perServing.calories)}</p>
            <p class="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p id="modal-protein" class="text-lg font-bold text-blue-600">${Math.round(perServing.protein)}g</p>
            <p class="text-xs text-gray-500">Protein</p>
          </div>
          <div>
            <p id="modal-carbs" class="text-lg font-bold text-amber-600">${Math.round(perServing.carbs)}g</p>
            <p class="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p id="modal-fat" class="text-lg font-bold text-purple-600">${Math.round(perServing.fat)}g</p>
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
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("modal-minus").addEventListener("click", () => {
    if (servings > 1) {
      servings--;
      updateModalValues();
    }
  });

  document.getElementById("modal-plus").addEventListener("click", () => {
    if (servings < 10) {
      servings++;
      updateModalValues();
    }
  });

  function updateModalValues() {
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

  function closeModal() {
    modal.remove();
  }

  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document
    .getElementById("modal-backdrop")
    .addEventListener("click", closeModal);

  document.getElementById("modal-confirm").addEventListener("click", () => {
    const totalCalories = Math.round(perServing.calories * servings);

    logMeal({
      id: meal.id,
      name: meal.name,
      image: meal.thumbnail,
      calories: totalCalories,
      protein: Math.round(perServing.protein * servings),
      carbs: Math.round(perServing.carbs * servings),
      fat: Math.round(perServing.fat * servings),
      servings: servings,
    });

    closeModal();

    setTimeout(() => {
      window.Swal.fire({
        icon: "success",
        title: "Meal Logged!",
        html: `<p>${meal.name} (${servings} serving${servings > 1 ? "s" : ""}) has been added to your daily log.</p>
            <p class="text-emerald-600 font-bold text-lg mt-2">+${totalCalories} calories</p>`,
        confirmButtonColor: "#10b981",
        timer: 2500,
        timerProgressBar: true,
      });
    }, 100);
  });
}

export function displayDetails(data, nutritionData) {
  const hasNutrition =
    nutritionData && nutritionData.data && nutritionData.data.perServing;

  let box = `
    <div class="max-w-7xl mx-auto">
            <!-- Back Button -->
            <button
              id="back-to-meals-btn"
              class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Back to Recipes</span>
            </button>

            <!-- Hero Section -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div class="relative h-80 md:h-96">
                <img
                  src="${data.thumbnail}"
                  alt="${data.name}"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                ></div>
                <div class="absolute bottom-0 left-0 right-0 p-8">
                  <div class="flex items-center gap-3 mb-3">
                    <span
                      class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
                      >${data.category}</span
                    >
                    <span
                      class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
                      >${data.area}</span
                    >
                    ${
                      data.tags && data.tags[0]
                        ? `<span
                      class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full"
                      >${data.tags[0]}</span
                    >`
                        : ""
                    }
                    ${
                      data.tags && data.tags[1]
                        ? `<span
                      class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full"
                      >${data.tags[1]}</span
                    >`
                        : ""
                    }
                  </div>
                  <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    ${data.name}
                  </h1>
                  <div class="flex items-center gap-6 text-white/90">
                    <span class="flex items-center gap-2">
                      <i class="fa-solid fa-clock"></i>
                      <span>30 min</span>
                    </span>
                    <span class="flex items-center gap-2">
                      <i class="fa-solid fa-utensils"></i>
                      <span id="hero-servings">4 servings</span>
                    </span>
                    <span class="flex items-center gap-2">
                      <i class="fa-solid fa-fire"></i>
                      <span id="hero-calories">${hasNutrition ? Math.round(nutritionData.data.perServing.calories) + " cal/serving" : "Calculating..."}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 mb-8">
              <button
                id="log-meal-btn"
                class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                data-meal-id="${data.id}"
              >
                <i class="fa-solid fa-clipboard-list"></i>
                <span>Log This Meal</span>
              </button>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Left Column - Ingredients & Instructions -->
              <div class="lg:col-span-2 space-y-8">
                <!-- Ingredients -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h2
                    class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-list-check text-emerald-600"></i>
                    Ingredients
                    <span class="text-sm font-normal text-gray-500 ml-auto"
                      >${data.ingredients ? data.ingredients.length : 0} items</span
                    >
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

                  ${
                    data.ingredients
                      ? data.ingredients
                          .map(
                            (ingredient) => `
                    <div
                      class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                      />
                      <span class="text-gray-700">
                        <span class="font-medium text-gray-900">${ingredient.measure}</span>
                        ${ingredient.ingredient}
                      </span>
                    </div>`,
                          )
                          .join("")
                      : ""
                  }

                  </div>
                </div>

                <!-- Instructions -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h2
                    class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                    Instructions
                  </h2>
                  <div class="space-y-4">

                  ${
                    data.instructions
                      ? data.instructions
                          .map(
                            (instruction, index) => `
                    <div
                      class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div
                        class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                      >
                        ${index + 1}
                      </div>
                      <p class="text-gray-700 leading-relaxed pt-2">
                        ${instruction}
                      </p>
                    </div>`,
                          )
                          .join("")
                      : ""
                  }

                  </div>
                </div>

                <!-- Video Section (conditional) -->
                ${
                  data.youtube
                    ? `
                <div class="video-section bg-white rounded-2xl shadow-lg p-6">
                  <h2
                    class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-video text-red-500"></i>
                    Video Tutorial
                  </h2>
                  <div
                    class="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                  >
                    <iframe
                      src="${data.youtube.replace("watch?v=", "embed/")}"
                      class="absolute inset-0 w-full h-full"
                      frameborder="0"
                      allow="
                        accelerometer;
                        autoplay;
                        clipboard-write;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture;
                      "
                      allowfullscreen
                    >
                    </iframe>
                  </div>
                </div>`
                    : ""
                }
              </div>

              <!-- Right Column - Nutrition -->
              <div class="space-y-6">
                <!-- Nutrition Facts -->
                <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h2
                    class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                    Nutrition Facts
                  </h2>
                  <div id="nutrition-facts-container">

                    ${
                      !hasNutrition
                        ? `
                    <!-- Loading State -->
                    <div class="text-center py-8">
                      <div class="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <i class="fa-solid fa-calculator text-emerald-600 text-xl animate-pulse"></i>
                      </div>
                      <p class="text-gray-900 font-semibold mb-1">Calculating Nutrition</p>
                      <p class="text-sm text-gray-500">Analyzing ingredients...</p>
                      <div class="flex justify-center gap-1 mt-3">
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                      </div>
                    </div>
                    `
                        : `
                    <p class="text-sm text-gray-500 mb-4">Per serving</p>

                    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                      <p class="text-sm text-gray-600">Calories per serving</p>
                      <p id="nutrition-calories" class="text-4xl font-bold text-emerald-600">${Math.round(nutritionData.data.perServing.calories)}</p>
                      <p id="nutrition-total-calories" class="text-xs text-gray-500 mt-1">Total: ${Math.round(nutritionData.data.totals.calories)} cal</p>
                    </div>

                    <div class="space-y-4">
                      <!-- Protein -->
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span class="text-gray-700">Protein</span>
                          </div>
                          <span class="font-bold text-gray-900">${Math.round(nutritionData.data.perServing.protein)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-emerald-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(100, Math.round((nutritionData.data.perServing.protein / 50) * 100))}%"></div>
                        </div>
                      </div>

                      <!-- Carbs -->
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span class="text-gray-700">Carbs</span>
                          </div>
                          <span class="font-bold text-gray-900">${Math.round(nutritionData.data.perServing.carbs)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(100, Math.round((nutritionData.data.perServing.carbs / 250) * 100))}%"></div>
                        </div>
                      </div>

                      <!-- Fat -->
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span class="text-gray-700">Fat</span>
                          </div>
                          <span class="font-bold text-gray-900">${Math.round(nutritionData.data.perServing.fat)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-purple-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(100, Math.round((nutritionData.data.perServing.fat / 65) * 100))}%"></div>
                        </div>
                      </div>

                      <!-- Fiber -->
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span class="text-gray-700">Fiber</span>
                          </div>
                          <span class="font-bold text-gray-900">${Math.round(nutritionData.data.perServing.fiber)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(100, Math.round((nutritionData.data.perServing.fiber / 25) * 100))}%"></div>
                        </div>
                      </div>

                      <!-- Sugar -->
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                            <span class="text-gray-700">Sugar</span>
                          </div>
                          <span class="font-bold text-gray-900">${Math.round(nutritionData.data.perServing.sugar)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-pink-500 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(100, Math.round((nutritionData.data.perServing.sugar / 50) * 100))}%"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Extra Nutrition Info -->
                    <div class="mt-6 pt-4 border-t border-gray-100">
                      <div class="grid grid-cols-2 gap-3 text-center">
                        <div class="bg-gray-50 rounded-lg p-2">
                          <p class="text-sm font-bold text-gray-700">${Math.round(nutritionData.data.perServing.saturatedFat)}g</p>
                          <p class="text-[10px] text-gray-500">Saturated Fat</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-2">
                          <p class="text-sm font-bold text-gray-700">${Math.round(nutritionData.data.perServing.cholesterol)}mg</p>
                          <p class="text-[10px] text-gray-500">Cholesterol</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-2">
                          <p class="text-sm font-bold text-gray-700">${Math.round(nutritionData.data.perServing.sodium)}mg</p>
                          <p class="text-[10px] text-gray-500">Sodium</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-2">
                          <p class="text-sm font-bold text-gray-700">${Math.round(nutritionData.data.totals.protein)}g</p>
                          <p class="text-[10px] text-gray-500">Total Protein</p>
                        </div>
                      </div>
                    </div>
                    `
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
    `;
  document.getElementById("meal-details").innerHTML = box;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document
    .getElementById("log-meal-btn")
    .addEventListener("click", openLogModal);
}
