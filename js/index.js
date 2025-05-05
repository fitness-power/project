import { getData } from "./getData.js";
import { postDataWithToken, postData } from "./postData.js";
import url from "./url.js";

function addBackArrow(container, callback) {
  document
    .querySelectorAll(".back-arrow-container")
    .forEach((el) => el.remove());
  const backArrowContainer = document.createElement("div");
  backArrowContainer.className = "back-arrow-container";
  const backArrow = document.createElement("div");
  backArrow.className = "back-arrow";
  backArrow.innerHTML = "&#8592; Back";
  backArrow.addEventListener("click", () => {
    callback();
    backArrowContainer.remove();
  });
  backArrowContainer.appendChild(backArrow);
  container.parentNode.insertBefore(backArrowContainer, container);
}

async function showTypes(categoryId) {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getData(`/types/category/${categoryId}`);
  loading.style.display = "none";
  if (res.status === "success" && res.data.length > 0) {
    const types = res.data;
    const categoryContainer = document.querySelector(".category-container");
    categoryContainer.innerHTML = "";
    addBackArrow(categoryContainer, showCategories);
    types.forEach((type) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${type.image}" alt="${type.title}" />
        <div class="details">
          <h3>${type.title}</h3>
          <a href="products/${type._id}">show products</a>
        </div>
      `;
      card.querySelector("a").addEventListener("click", (event) => {
        event.preventDefault();
        showProducts(type._id, categoryId);
      });
      categoryContainer.appendChild(card);
    });
  } else {
    console.error("Failed to fetch types");
  }
}

export async function showCategories() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getData("/categories");
  loading.style.display = "none";
  if (res.status === "success" && res.data.length > 0) {
    const categories = res.data;
    const categoryContainer = document.querySelector(".category-container");
    categoryContainer.innerHTML = "";
    categories.forEach((category) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${category.image}" alt="${category.title}" />
        <div class="details">
          <h3>${category.title}</h3>
          <a href="types/${category._id}">show ${category.title}</a>
        </div>
      `;
      card.querySelector("a").addEventListener("click", (event) => {
        event.preventDefault();
        showTypes(category._id);
      });
      categoryContainer.appendChild(card);
    });
  } else {
    console.error("Failed to fetch categories");
  }
}

export async function showProductDetails(productId, category) {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getData(`/product/${productId}`);
  loading.style.display = "none";
  if (res.status === "success" && res.data) {
    const product = res.data;
    const categoryContainer = document.querySelector(".category-container");
    categoryContainer.innerHTML = "";
    addBackArrow(categoryContainer, () =>
      showProducts(product.type._id, category)
    );
    const productDetails = document.createElement("div");
    productDetails.className = "product-details-container";
    productDetails.innerHTML = `
      <div class="product-header">
        <img src="${product.image}" alt="${product.title}" />
        <div class="product-details">
          <h1>${product.title}</h1>
          <ul>
            <li><strong>Product:</strong> ${product.title}</li>
            <li><strong>Brand:</strong> ${product.brand}</li>
            <li><strong>Nutritional value:</strong> ${product.nv}${
      product.type.category.title === "vitamins" ? "mg" : ""
    }</li>
            <li><strong>Features:</strong> ${product.type.title}</li>
          </ul>
          <p class="price">Price: $${product.price}</p>
          <a href="#" class="btn" onclick="addToCart('${
            product._id
          }')">Add to Cart</a>
        </div>
      </div>
    `;
    categoryContainer.appendChild(productDetails);
  } else {
    console.error("Failed to fetch product details");
  }
}

async function showProducts(typeId, category) {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getData(`/product?type=${typeId}`);
  loading.style.display = "none";
  if (res.status === "success" && res.data.length > 0) {
    const products = res.data;
    const categoryContainer = document.querySelector(".category-container");
    categoryContainer.innerHTML = "";
    addBackArrow(categoryContainer, () => showTypes(category));
    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <div class="details">
          <h3>${product.title}</h3>
          <a href="types/${product._id}">show details</a>
        </div>
      `;
      card.querySelector("a").addEventListener("click", (event) => {
        event.preventDefault();
        showProductDetails(product._id, category);
      });
      categoryContainer.appendChild(card);
    });
  } else {
    console.error("Failed to fetch products");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorElement = document.getElementById("login-error");
  const loading = document.getElementById("loading2");

  loading.style.display = "block";
  try {
    const response = await postData("/auth/login", { email, password });
    loading.style.display = "none";
    if (response.status === "success") {
      console.log(response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", response.data.User.role); // Store user role
      alert("Login successful!");
      window.location.reload();
    } else {
      errorElement.textContent = response.message || "Login failed";
    }
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    errorElement.textContent = "An error occurred. Please try again.";
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "register-confirm-password"
  ).value;
  const phone = document.getElementById("register-phone").value;
  const address = document.getElementById("register-address").value;
  const errorElement = document.getElementById("register-error");
  const loading = document.getElementById("loading");

  if (password !== confirmPassword) {
    errorElement.textContent = "Passwords do not match";
    return;
  }

  if (!/^\d{10,15}$/.test(phone)) {
    errorElement.textContent = "Phone number must be between 10 and 15 digits";
    return;
  }

  loading.style.display = "block";
  try {
    const response = await postData("/auth/sign_up", {
      username,
      email,
      password,
      confirmPassword,
      phone,
      address,
      role: "user",
    });
    loading.style.display = "none";
    if (response.status === "success") {
      localStorage.setItem("token", response.data.token);
      alert("Sign up successful!");
      window.location.reload();
    } else {
      errorElement.textContent = response.message || "Sign up failed";
    }
  } catch (error) {
    loading.style.display = "none";
    errorElement.textContent = "An error occurred. Please try again.";
  }
}

async function addToCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await postDataWithToken(
      "/cart",
      { products: [{ item: productId, quantity: 1 }] },
      token
    );
    if (res.status === "success") {
      alert("Product added to cart!");
    } else {
      console.error("Failed to add product to cart");
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
}

document.getElementById("login-form").addEventListener("submit", handleLogin);
document
  .getElementById("register-form")
  .addEventListener("submit", handleSignUp);

window.addToCart = addToCart;
