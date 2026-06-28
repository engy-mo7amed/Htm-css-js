const recipesGrid = document.getElementById("recipes-grid");
const gridViewBtn = document.getElementById("grid-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

let currentView = "grid";

function changeViewLayout(viewType) {
  currentView = viewType;
  const cards = document.querySelectorAll(".recipe-card");

  if (viewType === "grid") {
    recipesGrid.className = "grid grid-cols-4 gap-5";

    gridViewBtn.classList.add("bg-white", "text-emerald-600");
    gridViewBtn.classList.remove("text-gray-500");
    listViewBtn.classList.remove("bg-white", "text-emerald-600");
    listViewBtn.classList.add("text-gray-500");

    cards.forEach((card) => {
      card.classList.remove("flex", "h-48");

      const imageWrapper = card.querySelector(".meal-image");
      const img = card.querySelector("img");

      if (imageWrapper) {
        imageWrapper.className = "meal-image relative h-48 overflow-hidden bg-gray-100";
      }

      if (img) {
        img.className = "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500";
      }
    });

  } else {
    recipesGrid.className = "grid grid-cols-2 gap-5";

    listViewBtn.classList.add("bg-white", "text-emerald-600");
    listViewBtn.classList.remove("text-gray-500");
    gridViewBtn.classList.remove("bg-white", "text-emerald-600");
    gridViewBtn.classList.add("text-gray-500");

    cards.forEach((card) => {
      card.classList.add("flex", "h-48");

      const imageWrapper = card.querySelector(".meal-image");
      const img = card.querySelector("img");

      if (imageWrapper) {
        imageWrapper.className = "meal-image relative w-44 h-full flex-shrink-0 overflow-hidden bg-gray-100";
      }

      if (img) {
        img.className = "w-full h-full object-cover";
      }
    });
  }
}

gridViewBtn.addEventListener("click", () => changeViewLayout("grid"));
listViewBtn.addEventListener("click", () => changeViewLayout("list"));