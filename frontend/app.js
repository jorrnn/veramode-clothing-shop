const API = "/api";
let products = [];
let cart = JSON.parse(localStorage.getItem("elanCart") || "[]");

const $ = (s) => document.querySelector(s);
const productGrid = $("#productGrid");
const cartPanel = $("#cartPanel");
const overlay = $("#overlay");

async function loadProducts() {
  try {
    const response = await fetch(`${API}/products`);
    products = await response.json();
    renderProducts(products);
  } catch (error) {
    productGrid.innerHTML = `<p class="loading">Could not load products. Start the backend server and refresh.</p>`;
  }
}

function money(value) {
  return `₦${Number(value).toFixed(2)}`;
}

function renderProducts(items) {
  if (!items.length) {
    productGrid.innerHTML = `<p class="loading">No products found.</p>`;
    return;
  }
  productGrid.innerHTML = items.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="heart" onclick="toggleFavorite(this)" aria-label="Favorite">♡</button>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <div>
            <h3>${p.name}</h3>
            <div class="price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div>
          </div>
          <span class="stars">${"★".repeat(p.rating)} <span style="color:#aaa">${p.rating}</span></span>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to bag +</button>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({...product, quantity: 1});
  saveCart();
  showToast(`${product.name} added to your bag`);
}

function saveCart() {
  localStorage.setItem("elanCart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (!cart.length) {
    $("#cartItems").innerHTML = `<p class="empty">Your bag is empty.</p>`;
    $("#cartTotal").textContent = "$0.00";
    return;
  }
  $("#cartItems").innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>${money(item.price)} × ${item.quantity}</p>
        <button class="remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
      <strong>${money(item.price * item.quantity)}</strong>
    </div>
  `).join("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $("#cartTotal").textContent = money(total);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
}
function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

function toggleFavorite(button) {
  button.classList.toggle("saved");
  button.textContent = button.classList.contains("saved") ? "♥" : "♡";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

$("#filters").addEventListener("click", (event) => {
  const btn = event.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const category = btn.dataset.category;
  renderProducts(category === "All" ? products : products.filter(p => p.category === category));
});

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

$("#checkoutBtn").addEventListener("click", async () => {
  if (!cart.length) return showToast("Your bag is empty");
  const customer = prompt("Enter your name for the order:");
  if (!customer) return;
  const email = prompt("Enter your email:");
  if (!email) return;

  try {
    const response = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        customer, email,
        items: cart.map(item => ({id: item.id, quantity: item.quantity}))
      })
    });
    const order = await response.json();
    if (!response.ok) throw new Error(order.message || "Checkout failed");
    cart = [];
    saveCart();
    closeCart();
    showToast(`Order ${order.orderId} created successfully`);
  } catch (error) {
    showToast(error.message);
  }
});

$("#searchBtn").addEventListener("click", () => {
  $("#searchModal").classList.add("open");
  $("#searchInput").focus();
});
$("#closeSearch").addEventListener("click", () => $("#searchModal").classList.remove("open"));

$("#searchInput").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase().trim();
  const results = products.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
  ).slice(0, 6);
  $("#searchResults").innerHTML = query
    ? results.map(p => `
      <div class="search-result">
        <img src="${p.image}" alt="${p.name}">
        <div><strong>${p.name}</strong><div>${p.category} · ${money(p.price)}</div></div>
      </div>`).join("") || "<p style='padding-top:25px;color:#777'>No matching products.</p>"
    : "";
});

$("#newsletterForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("#email").value;
  try {
    await fetch(`${API}/newsletter`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email})
    });
    $("#email").value = "";
    showToast("Welcome to the ÉLAN list!");
  } catch {
    showToast("Please start the backend server first.");
  }
});

loadProducts();
updateCart();

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});