import url from "./url.js";

export async function postData(endpoint = "", data = {}) {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    mode: "cors",
  });
  return response.json();
}

export async function postDataWithToken(endpoint = "", data = {}, token = "") {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: "cors",
  });
  return response.json();
}
