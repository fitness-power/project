import { postDataWithToken } from "./postData.js";

async function confirmPayment() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const paymentMethod = document.getElementById("payment").value;
  const cartId = localStorage.getItem("cartId"); // Assuming cartId is stored in localStorage

  if (!cartId) {
    alert("No cart found. Please add items to your cart first.");
    window.location.href = "/cart.html";
    return;
  }

  try {
    let res;
    if (paymentMethod === "cash") {
      res = await postDataWithToken(`/order/cash/${cartId}`, {}, token);
    } else if (paymentMethod === "visa") {
      res = await postDataWithToken(`/order/card/${cartId}`, {}, token);
    }

    if (res.status === "success") {
      if (paymentMethod === "visa") {
        window.location.href = res.data; // Redirect to Stripe checkout session URL
      } else {
        alert("Order placed successfully!");
        window.location.href = "/";
      }
    } else {
      console.log(res);

      console.error("Failed to place order");
    }
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

window.confirmPayment = confirmPayment;
