document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("checkout-page").style.display == "block") {
    renderOrderItems();
    fetchStores();
  }
});

async function navigateToCheckout() {
  if (currentOrder.length === 0) {
    alert("Please add items to your order first");
    return;
  }

  renderOrderItems();
  await fetchStores();
  renderStoreOptions();
  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("checkout-page").style.display = "block";
}

function renderOrderItems() {
  const orderItemsContainer = document.getElementById("order-items");
  orderItemsContainer.innerHTML = "";
  let total = 0;

  currentOrder.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const orderItemElement = document.createElement("div");
    orderItemElement.className = "order-item";
    orderItemElement.innerHTML = `
        <div class="order-item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-quantity">Quantity: ${item.quantity}</div>
          <div class="item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="item-subtotal">$${itemTotal.toFixed(2)} </div>
        <button class="remove-item" data-item-name="${item.name}">×</button>
      `;

    orderItemsContainer.appendChild(orderItemElement);
  });

  document.getElementById("order-total").textContent = total.toFixed(2);

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const itemName = e.target.dataset.itemName;
      removeFromOrder(itemName);
      renderOrderItems();
    });
  });
}

function removeFromOrder(itemName) {
  const existingItem = currentOrder.find(
    (orderItem) => orderItem.name === itemName
  );
  let quantity = existingItem ? existingItem.quantity : 0;

  quantity -= 1;

  if (quantity < 0) quantity = 0;

  if (quantity === 0) {
    currentOrder = currentOrder.filter(
      (orderItem) => orderItem.name !== itemName
    );
  } else {
    existingItem.quantity = quantity;
  }
}

async function fetchStores() {
  if (stores.length === 0) {
    try {
      const response = await fetch(`${API_URL}/getStores`);
      stores = await response.json();
    } catch (error) {
      console.error("Error fetching stores:", error);
      alert("Failed to fetch stores. Please try again.");
    }
  }
}

function renderStoreOptions() {
  const storeSearchBox = document.getElementById("store-search");
  const storeDropdown = document.getElementById("store-dropdown");

  storeDropdown.style.display = "none";

  storeSearchBox.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    storeDropdown.innerHTML = "";
    const filteredStores = stores.filter((store) =>
      `${store.city}, ${store.state}, ${store.address}`
        .toLowerCase()
        .includes(searchTerm)
    );

    filteredStores.forEach((store) => {
      const listItem = document.createElement("li");
      listItem.classList.add("dropdown-item");
      listItem.dataset.storeId = store.storeID;

      const rating = Math.round(store.reviewScore);
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

      listItem.innerHTML = `
          <div class="store-info">
            <span class="store-address">${store.address}, ${store.city}, ${store.state}</span>
            <span class="store-rating">${stars}</span>
          </div>
        `;

      listItem.addEventListener("click", () => {
        storeSearchBox.value = `${store.city}, ${store.state}, ${store.address}`;
        selectedStore = store.storeID;
        storeDropdown.style.display = "none";
      });

      storeDropdown.appendChild(listItem);
    });

    if (filteredStores.length > 0) {
      storeDropdown.style.display = "block";
    } else {
      storeDropdown.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (!storeDropdown.contains(e.target) && e.target !== storeSearchBox) {
      storeDropdown.style.display = "none";
    }
  });
}

function getFormattedTimestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

async function placeOrder() {
  if (!selectedStore) {
    alert("Please select a store");
    return;
  }

  if (currentOrder.length === 0) {
    alert("Your order is empty");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/placeOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: currentUser.login,
        storeID: selectedStore,
        items: currentOrder,
        timestamp: getFormattedTimestamp(),
        status: "incomplete",
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Order placed successfully!");
      currentOrder = [];
      navigateToDashboard();
    } else {
      alert(`Failed to place order: ${data.message}`);
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Failed to place order. Please try again.");
  }
}
