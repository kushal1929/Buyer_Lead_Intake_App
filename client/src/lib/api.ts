export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `/api${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorDetails;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
      errorDetails = errorData.details;
    } catch {
      // If we can't parse the error response, use the status text
    }

    throw new APIError(response.status, errorMessage, errorDetails);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text() as T;
}

export const api = {
  get: <T = any>(endpoint: string) => 
    apiCall<T>(endpoint, { method: "GET" }),
  
  post: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string) =>
    apiCall<T>(endpoint, { method: "DELETE" }),
};
