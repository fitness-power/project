import url from "./url.js";

export async function putDataWithToken(endpoint = "", data = {}, token = "") {
  const response = await fetch(`${url}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: "cors",
  });
  return response.json();
}
