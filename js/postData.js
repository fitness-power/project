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
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers,
    body: data instanceof FormData ? data : JSON.stringify(data),
    mode: "cors",
  });
  return response.json();
}
