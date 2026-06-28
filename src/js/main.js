import * as getMeals from "./getMeals.js";
import * as AllCategories from "./getCategories.js";
import { getAreas } from "./getAreas.js";
import * as gridListView from "./grid&list.js";
import * as sideBar from "./sideBar.js";
import * as MealDetails from "./details.js";
import { initFoodLog} from "./log.js";
import { initProducts } from "./product.js"

initProducts()
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







