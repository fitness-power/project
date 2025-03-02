import url from "./url.js";

export async function getData(endpoint) {
  try {
    const response = await fetch(`${url}${endpoint}`, {
      mode: "cors",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function getDataWithToken(endpoint, token) {
  try {
    const response = await fetch(`${url}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
