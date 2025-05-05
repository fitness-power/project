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
            <button class="delete-product" data-product-id="${product._id}">Delete</button>
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

// Adding CRUD operations for products

async function addProduct(product) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await response.json();
    if (data.status === "success") {
      alert("Product added successfully!");
      fetchProducts();
    } else {
      console.error("Error adding product:", data);
    }
  } catch (error) {
    console.error("Error adding product:", error);
  }
}

async function updateProduct(productId, updatedProduct) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/product/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProduct),
    });
    const data = await response.json();
    if (data.status === "success") {
      alert("Product updated successfully!");
      fetchProducts();
    } else {
      console.error("Error updating product:", data);
    }
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

async function deleteProduct(productId) {
  try {
    const token = localStorage.getItem("token");
    const response = await deleteDataWithToken(`/product/${productId}`, token);
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

// Integrating CRUD operations into the UI
function setupProductActions() {
  const addProductForm = document.getElementById("add-product-form");
  addProductForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const product = {
      title: event.target.title.value,
      price: event.target.price.value,
      brand: event.target.brand.value,
      image: event.target.image.value,
    };
    addProduct(product);
  });

  const productListContainer = document.getElementById("product-list");
  productListContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-product")) {
      const productId = event.target.dataset.productId;
      deleteProduct(productId);
    } else if (event.target.classList.contains("edit-product")) {
      const productId = event.target.dataset.productId;
      const updatedProduct = {
        title: prompt("Enter new title:"),
        price: prompt("Enter new price:"),
        brand: prompt("Enter new brand:"),
        image: prompt("Enter new image URL:"),
      };
      updateProduct(productId, updatedProduct);
    }
  });
}

// Call setupProductActions after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupProductActions();
});

window.deleteOrder = deleteOrder;
window.setOrderPaid = setOrderPaid;
window.setOrderDelivered = setOrderDelivered;
