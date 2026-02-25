export function getErrorMessage(err) {
  const data = err?.response?.data;

  // FastAPI validation error (422)
  if (Array.isArray(data?.detail)) {
    return data.detail.map(e => e.msg).join(", ");
  }

  // Normal FastAPI error
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return "Something went wrong";
}