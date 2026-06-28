import * as getMeals from "./getMeals.js";
import * as AllCategories from "./getCategories.js";
import { getAreas } from "./getAreas.js";
import * as gridListView from "./grid&list.js";
import * as sideBar from "./sideBar.js";
import { getDetails } from "./details.js";
import { initFoodLog } from "./log.js";
import { initProducts } from "./product.js";

initProducts();
initFoodLog();
getMeals.getMeals("chicken");
AllCategories.getAllCategories();
getAreas();

//////////////category section //////////////////
const categoriesGrid = document.getElementById("categories-grid");
if (categoriesGrid) {
  categoriesGrid.addEventListener("click", async (e) => {
    const clickedCard = e.target.closest(".category-card");
    if (clickedCard) {
      const categoryName = clickedCard.dataset.category;
      const filteredMeals = await AllCategories.filter(
        "category",
        categoryName,
      );
      getMeals.displayMeals(filteredMeals);
    }
  });
}

//////////////area section //////////////////
const areaBtnContainer = document.getElementById("areaBtn");

if (areaBtnContainer) {
  areaBtnContainer.addEventListener("click", async (e) => {
    const clickedBtn = e.target.closest(".area-btn");

    if (clickedBtn) {
      const areaName = clickedBtn.dataset.area;
      document.getElementById("recipes-count").innerHTML =
        `Showing ${areaName} recipes`;

      document.querySelectorAll(".area-btn").forEach((btn) => {
        btn.classList.remove(
          "bg-emerald-600",
          "text-white",
          "hover:bg-emerald-700",
        );
        btn.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
      });

      clickedBtn.classList.remove(
        "bg-gray-100",
        "text-gray-700",
        "hover:bg-gray-200",
      );
      clickedBtn.classList.add(
        "bg-emerald-600",
        "text-white",
        "hover:bg-emerald-700",
      );

      if (areaName === "all") {
        getMeals.getMeals("chicken");
      } else {
        const filteredMeals = await AllCategories.filter("area", areaName);
        getMeals.displayMeals(filteredMeals);
      }
    }
  });
}

/////////////////details section ///////////////////////////

const searchSection = document.getElementById("search-filters-section");
const mealSection = document.getElementById("meal-categories-section");
const recipeSection = document.getElementById("all-recipes-section");
const recipesGrid = document.getElementById("recipes-grid");
const mealDetailsSection = document.getElementById("meal-details");

if (recipesGrid) {
  recipesGrid.addEventListener("click", async (e) => {
    const clickedCard = e.target.closest(".recipe-card");

    if (clickedCard) {
      const mealId = clickedCard.dataset.id;

      if (mealId) {
        await getDetails(mealId);

        if (searchSection) searchSection.classList.add("hidden");
        if (mealSection) mealSection.classList.add("hidden");
        if (recipeSection) recipeSection.classList.add("hidden");
        if (mealDetailsSection) mealDetailsSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  });
}

if (mealDetailsSection) {
  mealDetailsSection.addEventListener("click", (e) => {
    const backBtn = e.target.closest("#back-to-meals-btn");
    if (backBtn) {
      if (mealSection) mealSection.classList.remove("hidden");
      if (recipeSection) recipeSection.classList.remove("hidden");
      if (searchSection) searchSection.classList.remove("hidden");
      if (mealDetailsSection) mealDetailsSection.classList.add("hidden");
    }
  });
}
