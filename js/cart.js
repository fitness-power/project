import { deleteDataWithToken } from "./deleteData.js";
import { getDataWithToken } from "./getData.js";
import { putDataWithToken } from "./putData.js";

async function loadCart() {
  const loading = document.getElementById("loading");
  loading.style.display = "block";
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";
  try {
    const res = await getDataWithToken("/cart/user", token);
    loading.style.display = "none";
    if (res.status === "success") {
      const cartItems = res.data.products;
      localStorage.setItem("cartId", res.data._id); // Store cartId in localStorage
      if (res.data.length <= 0) {
        cartItemsContainer.innerHTML =
          "<p>Your cart is empty. Add items to your cart.</p>";
      } else {
        cartItems.forEach((item) => {
          const cartItem = document.createElement("div");
          cartItem.className = "cart-item";
          cartItem.setAttribute("data-id", item.item._id);
          cartItem.innerHTML = `
            <img src="${item.item.image}" alt="${item.item.title}" />
            <div class="cart-item-details">
              <h3>${item.item.title}</h3>
              <p>Price: $${item.item.price}</p>
            </div>
            <div class="cart-item-actions">
              <input type="number" id="quantity-${item.item._id}" value="${item.quantity}" min="1" />
              <button class="update-btn" onclick="updateQuantity('${item.item._id}')">Update</button>
              <button class="remove-btn" onclick="removeFromCart('${item.item._id}','${res.data._id}')">Remove</button>
            </div>
          `;
          cartItemsContainer.appendChild(cartItem);
        });
      }

      document.getElementById(
        "total-price"
      ).textContent = `$${res.data.totalPrice.toFixed(2)}`;
    } else {
      console.error("Failed to fetch cart items");
    }
  } catch (error) {
    loading.style.display = "none";
    cartItemsContainer.innerHTML =
      "<p>Your cart is empty. Add items to your cart.</p>";
    console.error("Error loading cart:", error);
  }
}

async function updateQuantity(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const quantity = document.getElementById(`quantity-${productId}`).value;
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  try {
    const res = await putDataWithToken(
      `/cart/quantity/${productId}`,
      { quantity },
      token
    );
    loading.style.display = "none";
    if (res.status === "success") {
      loadCart();
    } else {
      console.error("Failed to update quantity");
    }
  } catch (error) {
    loading.style.display = "none";
    console.error("Error updating quantity:", error);
  }
}

async function removeFromCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const loading = document.getElementById("loading");
  loading.style.display = "block";

  try {
    const res = await deleteDataWithToken(`/cart/product/${productId}`, token);
    loading.style.display = "none";
    if (res.status === "success") {
      window.location.href = "/";
    } else {
      console.error("Failed to remove item from cart");
    }
  } catch (error) {
    loading.style.display = "none";
    console.error("Error removing item from cart:", error);
  }
}

async function clearCart() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const loading = document.getElementById("loading");
  loading.style.display = "block";
  try {
    const res = await deleteDataWithToken(`/cart`, token);
    loading.style.display = "none";
    if (res.status === "success") {
      window.location.href = "/";
      document.getElementById("total-price").textContent = "$0.00";
    } else {
      console.error("Failed to clear cart");
    }
  } catch (error) {
    loading.style.display = "none";
    console.error("Error clearing cart:", error);
  }
}

async function checkout() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const res = await getDataWithToken("/cart/user", token);
    if (res.status === "success" && res.data.products.length > 0) {
      localStorage.setItem("cartId", res.data._id); // Save cartId to localStorage
      window.location.href = "/payment.html"; // Redirect to payment page
    } else {
      alert("No items to buy.");
    }
  } catch (error) {
    alert("No items to buy.");
    console.error("Error during checkout:", error);
  }
}

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.addEventListener("DOMContentLoaded", loadCart);
