let editItemName = "";
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboard-page").style.display == "block") {
    fetchMenu();
    renderMenu();
  }
  document.getElementById("add-item-button").addEventListener("click", () => {
    document.getElementById("add-item-modal").style.display = "block";
  });
  document
    .getElementById("add-item-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      addItem();
    });
  document
    .getElementById("edit-item-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      editItem();
    });

  document
    .getElementById("delete-item-button")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      deleteItem();
    });

  const applyFiltersButton = document.getElementById("apply-filters");
  const clearFiltersButton = document.getElementById("clear-filters");

  applyFiltersButton.addEventListener("click", () => {
    const type = document.getElementById("type-filter").value;
    const maxPrice = document.getElementById("max-price-filter").value;
    const sortOrder = document.getElementById("sort-order-filter").value;

    fetchMenu(type, maxPrice, sortOrder);
  });
  clearFiltersButton.addEventListener("click", () => {
    document.getElementById("type-filter").value = "";
    document.getElementById("max-price-filter").value = "";
    fetchMenu();
  });
});

async function addItem() {
  const item = {
    currentRole: currentUser.role,
    itemName: document.getElementById("add-item-name").value,
    ingredients: document.getElementById("add-item-ingredients").value,
    typeOfItem: document.getElementById("add-item-type").value,
    price: parseFloat(document.getElementById("add-item-price").value),
    description: document.getElementById("add-item-description").value,
  };

  try {
    const response = await fetch(`${API_URL}/addItem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    const data = await response.json();
    if (data.success) {
      alert("Item added successfully!");
      fetchMenu();
    } else {
      alert(`Failed to add item: ${data.message}`);
    }
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item. Please try again.");
  }

  document.getElementById("add-item-modal").style.display = "none";
}

async function editItem() {
  const item = {
    currentRole: currentUser.role,
    currentItemName: editItemName,
    newItemName: document.getElementById("edit-item-name").value,
    newIngredients: document.getElementById("edit-item-ingredients").value,
    newType: document.querySelector('input[name="edit-item-type"]:checked')
      .value,
    newPrice: parseFloat(document.getElementById("edit-item-price").value),
    newDescription: document.getElementById("edit-item-description").value,
  };

  try {
    const response = await fetch(`${API_URL}/updateMenu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    const data = await response.json();
    if (data.success) {
      alert("Item updated successfully!");
      fetchMenu();
    } else {
      alert(`Failed to update item: ${data.message}`);
    }
  } catch (error) {
    console.error("Error updating item:", error);
    alert("Failed to update item. Please try again.");
  }

  document.getElementById("edit-item-modal").style.display = "none";
}

async function deleteItem() {
  const item = {
    currentRole: currentUser.role,
    currentItemName: editItemName,
    newItemName: "",
    newIngredients: "",
    newType: "",
    newPrice: -1,
    newDescription: "",
  };

  try {
    const response = await fetch(`${API_URL}/updateMenu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    const data = await response.json();
    if (data.success) {
      alert("Item deleted successfully!");
      fetchMenu();
    } else {
      alert(`Failed to delete item: ${data.message}`);
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Failed to delete item. Please try again.");
  }

  document.getElementById("edit-item-modal").style.display = "none";
}

function showEditItemModal(item) {
  document.getElementById("edit-item-name").value = item.name;
  document.getElementById("edit-item-ingredients").value = item.ingredients;
  document.getElementById("edit-item-price").value = item.price;
  document.getElementById("edit-item-description").value = item.description;

  const typeRadios = document.querySelectorAll('input[name="edit-item-type"]');
  typeRadios.forEach((radio) => {
    if (radio.value === item.type) {
      radio.checked = true;
    }
  });
  document.getElementById("edit-item-modal").style.display = "block";
}

async function fetchMenu(type = "", maxPrice = "", sortOrder = "") {
  try {
    const response = await fetch(
      `${API_URL}/getMenu?type=${type}&maxPrice=${maxPrice}&sortOrder=${sortOrder}`
    );
    menuItems = await response.json();
    renderMenu();
  } catch (error) {
    console.error("Error fetching menu:", error);
    alert("Failed to fetch menu. Please try again.");
  }
}

function renderMenu() {
  document.getElementById("manager-actions").style.display = "none";
  if (currentUser && currentUser.role === "manager") {
    document.getElementById("manager-actions").style.display = "block";
  }
  const menuGrid = document.getElementById("menu-grid");
  menuGrid.innerHTML = "";

  menuItems.forEach((item) => {
    const existingItem = currentOrder.find(
      (orderItem) => orderItem.name === item.name
    );
    const quantity = existingItem ? existingItem.quantity : 0;

    const menuItemElement = document.createElement("div");
    menuItemElement.className = `menu-item ${quantity > 0 ? "selected" : ""}`;
    menuItemElement.innerHTML = `<h3>${item.name}</h3>`;

    if (quantity > 0) {
      menuItemElement.innerHTML += `<span class="item-quantity">x${quantity}</span>`;
    }

    if (currentUser && currentUser.role === "manager") {
      menuItemElement.innerHTML += `<i class="fas fa-pencil edit-item-icon" data-item-name="${item.name}"></i>`;
    }

    menuItemElement.addEventListener("click", () => showItemModal(item));

    menuGrid.appendChild(menuItemElement);

    if (currentUser && currentUser.role === "manager") {
      document.querySelectorAll(".edit-item-icon").forEach((icon) => {
        icon.addEventListener("click", (e) => {
          e.stopPropagation();
          const itemName = e.target.dataset.itemName;
          editItemName = itemName;
          const item = menuItems.find((item) => item.name === itemName);
          showEditItemModal(item);
        });
      });
    }
  });
}

function showItemModal(item) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-item-name").textContent = item.name;
  document.getElementById("modal-item-description").textContent =
    item.description;
  document.getElementById("modal-item-type").textContent = item.type;
  document.getElementById("modal-item-price").textContent =
    item.price.toFixed(2);
  document.getElementById("modal-item-ingredients").textContent =
    item.ingredients;

  const existingItem = currentOrder.find(
    (orderItem) => orderItem.name === item.name
  );
  const quantity = existingItem ? existingItem.quantity : 0;

  const quantityDisplay = document.getElementById("quantity-display");
  const decreaseButton = document.getElementById("decrease-quantity");
  const increaseButton = document.getElementById("increase-quantity");

  quantityDisplay.textContent = quantity;
  decreaseButton.disabled = quantity === 0;

  decreaseButton.dataset.action = "decrease";
  decreaseButton.dataset.itemName = item.name;
  decreaseButton.dataset.itemPrice = item.price;

  increaseButton.dataset.action = "increase";
  increaseButton.dataset.itemName = item.name;
  increaseButton.dataset.itemPrice = item.price;

  decreaseButton.onclick = handleModalAction;
  increaseButton.onclick = handleModalAction;

  modal.style.display = "block";
}

function handleModalAction(e) {
  const action = e.target.dataset.action;
  const itemName = e.target.dataset.itemName;
  const itemPrice = parseFloat(e.target.dataset.itemPrice);

  const existingItem = currentOrder.find(
    (orderItem) => orderItem.name === itemName
  );
  let quantity = existingItem ? existingItem.quantity : 0;

  if (action === "increase") {
    quantity += 1;
  } else if (action === "decrease") {
    quantity -= 1;
  }

  if (quantity < 0) quantity = 0;

  if (quantity === 0) {
    currentOrder = currentOrder.filter(
      (orderItem) => orderItem.name !== itemName
    );
  } else if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    currentOrder.push({ name: itemName, price: itemPrice, quantity });
  }

  const quantityDisplay = document.getElementById("quantity-display");
  const decreaseButton = document.getElementById("decrease-quantity");

  quantityDisplay.textContent = quantity;
  decreaseButton.disabled = quantity === 0;
  renderMenu();
}
