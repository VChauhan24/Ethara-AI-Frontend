import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

function SectionHeader({ title }) {
  return <h2>{title}</h2>;
}

function FormField({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [productForm, setProductForm] = useState({ name: '', sku: '', description: '', price: 0, stock: 0 });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [orderForm, setOrderForm] = useState({ customer_id: '', items: [] });

  useEffect(() => {
    refreshData();
  }, []);

  const customersOptions = useMemo(
    () => customers.map((customer) => ({ label: `${customer.name} (${customer.email})`, value: customer.id })),
    [customers]
  );

  const productOptions = useMemo(
    () => products.map((product) => ({ label: `${product.name} (${product.sku})`, value: product.id })),
    [products]
  );

  const loadOrderItems = () => {
    if (orderForm.items.length === 0 && products.length > 0) {
      setOrderForm({ ...orderForm, items: products.slice(0, 1).map((product) => ({ product_id: product.id, quantity: 1 })) });
    }
  };

  const refreshData = async () => {
    try {
      const [productsData, customersData, ordersData] = await Promise.all([
        api.fetchProducts(),
        api.fetchCustomers(),
        api.fetchOrders(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
      setOrders(ordersData);
      setOrderForm((prev) => ({ ...prev, items: prev.items.length ? prev.items : [] }));
    } catch (err) {
      setError(err.message);
    }
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createProduct({
        name: productForm.name,
        sku: productForm.sku,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
      });
      setSuccess('Product added successfully.');
      setProductForm({ name: '', sku: '', description: '', price: 0, stock: 0 });
      refreshData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitCustomer = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createCustomer(customerForm);
      setSuccess('Customer added successfully.');
      setCustomerForm({ name: '', email: '', phone: '' });
      refreshData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createOrder({
        customer_id: parseInt(orderForm.customer_id, 10),
        items: orderForm.items
          .filter((item) => item.product_id)
          .map((item) => ({ product_id: parseInt(item.product_id, 10), quantity: parseInt(item.quantity, 10) })),
      });
      setSuccess('Order created successfully.');
      setOrderForm({ customer_id: '', items: [] });
      refreshData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrderItem = (index, field, value) => {
    const nextItems = [...orderForm.items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setOrderForm({ ...orderForm, items: nextItems });
  };

  const addOrderItem = () => {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { product_id: '', quantity: 1 }] });
  };

  const removeOrderItem = (index) => {
    const nextItems = orderForm.items.filter((_, idx) => idx !== index);
    setOrderForm({ ...orderForm, items: nextItems });
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Product, Customer & Order Manager</h1>
          <p>Manage stock, customers, and orders in one responsive admin interface.</p>
        </div>
      </header>

      <div className="messages">
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
      </div>

      <section className="grid-row">
        <article className="card">
          <SectionHeader title="Add Product" />
          <form className="form" onSubmit={submitProduct}>
            <FormField label="Name">
              <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            </FormField>
            <FormField label="SKU">
              <input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            </FormField>
            <FormField label="Description">
              <input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            </FormField>
            <FormField label="Price">
              <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            </FormField>
            <FormField label="Stock">
              <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
            </FormField>
            <button type="submit">Save Product</button>
          </form>
        </article>

        <article className="card">
          <SectionHeader title="Add Customer" />
          <form className="form" onSubmit={submitCustomer}>
            <FormField label="Name">
              <input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required />
            </FormField>
            <FormField label="Email">
              <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} required />
            </FormField>
            <FormField label="Phone">
              <input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
            </FormField>
            <button type="submit">Save Customer</button>
          </form>
        </article>
      </section>

      <section className="grid-row">
        <article className="card full-width">
          <SectionHeader title="Create Order" />
          <form className="form" onSubmit={submitOrder}>
            <FormField label="Customer">
              <select value={orderForm.customer_id} onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })} required>
                <option value="">Select customer</option>
                {customersOptions.map((customer) => (
                  <option key={customer.value} value={customer.value}>
                    {customer.label}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="order-items">
              <div className="order-items-header">
                <span>Product</span>
                <span>Quantity</span>
                <span />
              </div>
              {orderForm.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <select value={item.product_id} onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)} required>
                    <option value="">Select product</option>
                    {productOptions.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)} required />
                  <button type="button" className="text-button" onClick={() => removeOrderItem(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="secondary-button" onClick={addOrderItem}>
              Add item
            </button>
            <button type="submit">Place Order</button>
          </form>
        </article>
      </section>

      <section className="grid-row">
        <article className="card">
          <SectionHeader title="Products" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <SectionHeader title="Customers" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="card full-width">
        <SectionHeader title="Latest Orders" />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customer = customers.find((c) => c.id === order.customer_id);
                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{customer ? customer.name : order.customer_id}</td>
                    <td>${order.total_amount.toFixed(2)}</td>
                    <td>{order.items.map((item) => `${item.product_id}x${item.quantity}`).join(', ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
