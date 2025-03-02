import url from "./url.js";

export async function deleteDataWithToken(endpoint = "", token = "") {
  try {
    const response = await fetch(`${url}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
    });
    return response.json();
  } catch (error) {
    console.log(error);
    return error;
  }
}
