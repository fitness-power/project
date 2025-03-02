import { getData } from "./getData.js";

async function populateTypes() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getData("/types");
  loading.style.display = "none";
  const typeSelect = document.getElementById("type");
  typeSelect.innerHTML = '<option value="all">All Types</option>';

  if (res.status === "success" && res.data.length > 0) {
    res.data.forEach((type) => {
      const option = document.createElement("option");
      option.value = type._id;
      option.textContent = `${type.category.title} (${type.title})`;
      typeSelect.appendChild(option);
    });
  } else {
    console.error("Failed to fetch types");
  }
}

async function searchProducts() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const keyword = document.getElementById("keyword").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const type = document.getElementById("type").value;

  let query = `/product?title=${keyword}`;
  if (minPrice) query += `&minPrice=${minPrice}`;
  if (maxPrice) query += `&maxPrice=${maxPrice}`;
  if (type && type !== "all") query += `&type=${type}`;

  const res = await getData(query);
  loading.style.display = "none";
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (res.status === "success" && res.data.length > 0) {
    res.data.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.className = "card";
      productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <div class="details">
          <h3>${product.title}</h3>
          <a href="index.html?productId=${product._id}&categoryId=${product.type.category._id}" class="show-details">show details</a>
        </div>
      `;
      resultsContainer.appendChild(productDiv);
    });
  } else {
    resultsContainer.innerHTML = "<p>No products found</p>";
  }
}

window.searchProducts = searchProducts;
window.addEventListener("DOMContentLoaded", populateTypes);
