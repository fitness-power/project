import { getDataWithToken } from "./getData.js";

async function loadUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const res = await getDataWithToken("/auth/user", token);
    const userData = res.data;
    if (res.status !== "success") {
      throw new Error("User not found");
    }
    document.querySelector(".profile-name").textContent = userData.username;
    document.querySelector(".profile-details").innerHTML = `
      <h2>Profile Details</h2>
      <p>Username: ${userData.username}</p>
      <p>Email: ${userData.email}</p>
      <p>Phone: ${userData.phone}</p>
      <p>Address: ${userData.address}</p>
    `;
  } catch (error) {
    console.error("Error loading user profile:", error);
    document.querySelector(".profile-details").innerHTML = `
      <h2>Error</h2>
      <p>${error.message}</p>
    `;
  }
}

loadUserProfile();
