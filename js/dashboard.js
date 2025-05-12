import { getDataWithToken } from "./getData.js";
import { deleteDataWithToken } from "./deleteData.js";
import { postDataWithToken } from "./postData.js";

document.addEventListener("DOMContentLoaded", async () => {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
    return;
  }
  fetchUserInfo();
  fetchOrders();
  fetchProducts();
  populateCategoriesAndTypes();
});

async function checkAdmin() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in local storage.");
    return false;
  } else {
    try {
      const data = await getDataWithToken("/auth/user", token);
      return data.data.role === "admin";
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  }
}

async function fetchUserInfo() {
  try {
    const token = localStorage.getItem("token");
    const data = await getDataWithToken("/auth/user", token);

    const userDetailsContainer = document.getElementById("user-details");
    userDetailsContainer.innerHTML = `
      <div class="user-info">
        <p><strong>Username:</strong> ${data.data.username}</p>
        <p><strong>Email:</strong> ${data.data.email}</p>
        <p><strong>Phone:</strong> ${data.data.phone}</p>
        <p><strong>Address:</strong> ${data.data.address}</p>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}

async function fetchOrders() {
  try {
    const token = localStorage.getItem("token");
    const data = await getDataWithToken("/order", token);

    const orderListContainer = document.getElementById("order-list");
    orderListContainer.innerHTML = ""; // Clear existing content

    data.data.forEach((order) => {
      const orderCard = document.createElement("div");
      orderCard.classList.add("order-card");
      orderCard.innerHTML = `
        <div class="card-header">
          <p class="order-date">${order._id}</p>
        </div>
        <div class="card-body">
          <p class="order-total">Total: <span>$${order.amount}</span></p>
          <p class="order-status">is Paid: <span>${order.isPaid}</span></p>
          <p class="order-status">is Delivered: <span>${
            order.isDelivered
          }</span></p>
          <h4>User:</h4>
          <p class="product-name">username: ${order.userId.username}</p>
          <p class="product-name">email: ${order.userId.email}</p>
          <p class="product-name">phone: ${order.userId.phone}</p>
          <p class="product-name">address: ${order.userId.address}</p>
          <h4>Products:</h4>
          <ul class="product-list">
            ${order.products
              .map(
                (product) => `
                  <li class="product-item">
                    <p class="product-name">${product.item.title}</p>
                    <p class="product-price">Price: $${product.item.price}</p>
                    <p class="product-quantity">brand: ${product.item.brand}</p>
                    <p class="product-quantity">Quantity: ${product.quantity}</p>
                  </li>
                `
              )
              .join("")}
          </ul>
          <button class="delete-order-btn" onclick="deleteOrder('${
            order._id
          }')">Delete Order</button>
          <button class="set-paid-btn" onclick="setOrderPaid('${
            order._id
          }')">Set Paid</button>
          <button class="set-delivered-btn" onclick="setOrderDelivered('${
            order._id
          }')">Set Delivered</button>
        </div>
      `;
      orderListContainer.appendChild(orderCard);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

async function fetchProducts() {
  try {
    const token = localStorage.getItem("token");
    const data = await getDataWithToken("/product", token);

    const productListContainer = document.getElementById("product-list");
    productListContainer.innerHTML = ""; // Clear existing content

    if (data.status === "success" && data.data.length > 0) {
      data.data.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.className = "card";
        productDiv.innerHTML = `
          <img src="${product.image}" alt="${product.title}" />
          <div class="details">
            <h3>${product.title}</h3>
            <a href="index.html?productId=${product._id}&categoryId=${product.type.category._id}" class="show-details">show details</a>
            <button class="delete-product" onclick="deleteProduct('${product._id}')">Delete</button>
          </div>
        `;
        productListContainer.appendChild(productDiv);
      });
    } else {
      productListContainer.innerHTML = "<p>No products found</p>";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

async function deleteProduct(productId) {
  try {
    const token = localStorage.getItem("token");
    const response = await deleteDataWithToken(`/product/${productId}`, token);
    console.log(response);

    if (response.status === "success") {
      alert("Product deleted successfully!");
      fetchProducts();
    } else {
      console.error("Error deleting product:", response);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}

async function deleteOrder(orderId) {
  try {
    const token = localStorage.getItem("token");
    const response = await deleteDataWithToken(`/order/${orderId}`, token);
    if (response.status === "success") {
      alert("Order deleted successfully!");
      fetchOrders(); // Refresh the orders list
    } else {
      console.error("Error deleting order:", response);
    }
  } catch (error) {
    console.error("Error deleting order:", error);
  }
}

async function setOrderPaid(orderId) {
  try {
    const token = localStorage.getItem("token");
    const response = await postDataWithToken(
      `/order/${orderId}/paid`,
      {},
      token
    );
    if (response.status === "success") {
      alert("Order marked as paid successfully!");
      fetchOrders(); // Refresh the orders list
    } else {
      console.error("Error marking order as paid:", response);
    }
  } catch (error) {
    console.error("Error marking order as paid:", error);
  }
}

async function setOrderDelivered(orderId) {
  try {
    const token = localStorage.getItem("token");
    const response = await postDataWithToken(
      `/order/${orderId}/delivered`,
      {},
      token
    );
    if (response.status === "success") {
      alert("Order marked as delivered successfully!");
      fetchOrders(); // Refresh the orders list
    } else {
      console.error("Error marking order as delivered:", response);
    }
  } catch (error) {
    console.error("Error marking order as delivered:", error);
  }
}

async function populateCategoriesAndTypes() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const res = await getDataWithToken("/types", localStorage.getItem("token"));
  loading.style.display = "none";

  const categorySelect = document.getElementById("product-category");
  categorySelect.innerHTML = "<option value=''>Select Category</option>";

  if (res.status === "success" && res.data.length > 0) {
    res.data.forEach((type) => {
      const option = document.createElement("option");
      option.value = type._id;
      option.textContent = `${type.category.title} (${type.title})`;
      categorySelect.appendChild(option);
    });
  } else {
    console.error("Failed to fetch categories and types");
  }
}

async function addProduct(event) {
  event.preventDefault(); // Prevent form submission from reloading the page

  const token = localStorage.getItem("token");
  const title = document.getElementById("product-title").value;
  const imageFile = document.getElementById("product-image").files[0];
  const category = document.getElementById("product-category").value;
  const price = document.getElementById("product-price").value;
  const brand = document.getElementById("product-brand").value;
  const nutritionalValue = document.getElementById(
    "product-nutritional-value"
  ).value;
  const formData = new FormData();
  console.log(imageFile);

  formData.append("title", title);
  formData.append("image", imageFile);
  formData.append("type", category);
  formData.append("price", price);
  formData.append("brand", brand);
  formData.append("nv", nutritionalValue);

  try {
    const response = await postDataWithToken("/product", formData, token);
    console.log(response);

    if (response.status === "success") {
      alert("Product added successfully!");
      fetchProducts(); // Refresh the product list
      document.getElementById("add-product-form").reset(); // Clear the form
    } else {
      console.error("Error adding product:", result);
    }
  } catch (error) {
    console.error("Error adding product:", error);
  }
}

// Integrating CRUD operations into the UI

// Call setupProductActions after DOM content is loaded

window.deleteOrder = deleteOrder;
window.setOrderPaid = setOrderPaid;
window.setOrderDelivered = setOrderDelivered;
window.deleteProduct = deleteProduct;
window.addProduct = addProduct;
