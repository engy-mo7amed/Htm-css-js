import { recipsGrid } from "./getMeals.js";

const colors = [
  "yellow",
  "pink",
  "orange",
  "gray",
  "amber",
  "red",
  "rose",
  "blue",
  "teal",
  "green",
  "emerald",
  "cyan",
  "teal",
  "pink",
];
const icons = [
  "drumstick-bite",
  "drumstick-bite",
  "cake-candles",
  "drumstick-bite",
  "bowl-rice",
  "bowl-food",
  "bacon",
  "fish-fins",
  "plate-wheat",
  "utensils",
  "leaf",
  "seedling",
];

export async function getAllCategories() {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/categories`,
    );
    const data = await response.json();
    const allCategories = data.results;
    displayCategory(allCategories);
    return allCategories;
  } catch (error) {
    console.log("category error");
  }
}

function displayCategory(allCategories) {
  document.getElementById("categories-grid").innerHTML = allCategories
    .map((category, index) => {
      const color = colors[index % colors.length];
      const icon = icons[index % icons.length];

      return `<div
              class="category-card bg-gradient-to-br from-${color}-50 to-${color}-50 rounded-xl p-3 border border-${color}-200 hover:border-${color}-400 hover:shadow-md cursor-pointer transition-all group"
              data-category="${category.name}"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="text-white w-9 h-9 bg-gradient-to-br from-${color}-400 to-${color}-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                >
                  <i class="fa-solid fa-${icon}"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
                </div>
              </div>
            </div>`;
    })
    .join("");
}

export async function filter(type, value) {
  try {
    recipsGrid.innerHTML = `
    <div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
    `;
    let response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/filter?${type}=${value}&page=1&limit=25`,
      {
        method: "GET",
        redirect: "follow",
      },
    );
    let data = await response.json();
    let finalData = data.results;
    return finalData;
  } catch (error) {
    console.log(error);
  }
}
