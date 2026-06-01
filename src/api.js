const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || 'Request failed');
  }
  return body;
}

export const api = {
  fetchProducts: () => request('/products'),
  createProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  fetchCustomers: () => request('/customers'),
  createCustomer: (customer) => request('/customers', { method: 'POST', body: JSON.stringify(customer) }),
  fetchOrders: () => request('/orders'),
  createOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
};
