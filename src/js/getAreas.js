export async function getAreas() {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/areas?list`,
    );
    const data = await response.json();
    const finalData = data.results;
    displayArea(finalData);
  } catch (error) {
    console.log(error);
  }
}

function displayArea(data) {
  let box = ` <button
              class="area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
              data-area="all"
            >
              All Cuisines
            </button>`;
  let limitedData = data.slice(0, 10);
  for (let i = 0; i < limitedData.length; i++) {
    box += `
        
          <button
              class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
              data-area="${data[i].name}"
            >
              ${data[i].name}
            </button>
        `;
  }
  document.getElementById("areaBtn").innerHTML = box;
}
