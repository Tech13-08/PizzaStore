document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("order-history-page").style.display == "block") {
    viewOrderHistory();
  }
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      const tabType = e.target.dataset.tab;
      fetchOrders(tabType);
    });
  });
});

document
  .getElementById("order-search-user-button")
  .addEventListener("click", async () => {
    const username = document.getElementById("order-search-username").value;
    const recentTab = document.querySelector('.tab-button[data-tab="recent"]');
    const allTab = document.querySelector('.tab-button[data-tab="all"]');

    if (username) {
      allTab.textContent = `All ${username}'s Orders`;
      recentTab.classList.remove("active");
      allTab.classList.add("active");
      await fetchOrders("all");
    } else {
      allTab.textContent = `All Your Orders`;
      recentTab.classList.add("active");
      allTab.classList.remove("active");
      await fetchOrders("recent");
    }
  });

function viewOrderHistory() {
  const allTab = document.querySelector('.tab-button[data-tab="all"]');
  const recentTab = document.querySelector('.tab-button[data-tab="recent"]');
  recentTab.classList.add("active");
  allTab.classList.remove("active");

  toggleSidebar();

  if (currentUser) {
    document.getElementById("manager-order-search").style.display =
      currentUser.role != "manager" && currentUser.role != "driver"
        ? "none"
        : "block";
    document.getElementById("order-search-username").value = "";
    allTab.textContent = `All Your Orders`;
  }

  fetchOrders("recent");
  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("order-history-page").style.display = "block";
}

async function fetchOrders(type) {
  const user =
    document.getElementById("order-search-username").value || currentUser.login;
  try {
    const endpoint =
      type === "recent"
        ? `${API_URL}/getRecentOrders/${currentUser.login}`
        : `${API_URL}/getOrders/${currentUser.role}/${currentUser.login}/${user}`;

    const response = await fetch(endpoint);
    const orders = await response.json();
    renderOrdersList(orders);
  } catch (error) {
    console.error(`Error fetching ${type} orders:`, error);
    document.getElementById("orders-list").innerHTML = `
            <div class="error-message">Failed to load orders. Please try again.</div>
        `;
  }
}

function renderOrdersList(orders) {
  const ordersListElement = document.getElementById("orders-list");

  if (!orders || orders.length === 0) {
    ordersListElement.innerHTML =
      '<div class="no-orders">No orders found</div>';
    return;
  }

  ordersListElement.innerHTML = "";

  orders.forEach((order) => {
    const orderElement = document.createElement("div");
    orderElement.className = "order-list-item";

    const orderLink = document.createElement("a");
    orderLink.classList.add("order-link");
    orderLink.href = "#";
    orderLink.dataset.orderId = order;
    orderLink.textContent = `Order #${order}`;

    orderElement.appendChild(orderLink);

    if (currentUser.role === "driver" || currentUser.role === "manager") {
      const toggleContainer = document.createElement("div");
      toggleContainer.className = "toggle-container";

      const toggleSwitch = document.createElement("input");
      toggleSwitch.type = "checkbox";
      toggleSwitch.classList.add("order-status-toggle");
      toggleSwitch.dataset.orderId = order;

      const toggleLabel = document.createElement("label");

      fetchOrderDetails(order).then((orderDetails) => {
        toggleSwitch.checked = orderDetails.orderStatus === "complete";
        toggleLabel.textContent = toggleSwitch.checked
          ? "Complete"
          : "Incomplete";
      });

      toggleSwitch.addEventListener("change", async () => {
        const newStatus = toggleSwitch.checked ? "complete" : "incomplete";
        await updateOrderStatus(order, newStatus);
        toggleLabel.textContent =
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      });

      toggleContainer.appendChild(toggleLabel);
      toggleContainer.appendChild(toggleSwitch);
      orderElement.appendChild(toggleContainer);
    }

    ordersListElement.appendChild(orderElement);
    orderLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const orderId = e.target.dataset.orderId;
      const orderDetails = await fetchOrderDetails(orderId);
      showOrderDetailModal(orderDetails);
    });
  });
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}/updateOrderStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentRole: currentUser.role,
        orderID: orderId,
        status: status,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      alert("Failed to update order status.");
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Failed to update order status. Please try again.");
  }
}

async function fetchOrderDetails(orderId) {
  try {
    const response = await fetch(`${API_URL}/getOrder/${orderId}`);
    const orderDetails = await response.json();
    orderDetails.orderStatus = orderDetails.orderStatus.replace(
      /[\s\u00A0]+$/,
      ""
    );

    return orderDetails;
  } catch (error) {
    console.error("Error fetching order details:", error);
    alert("Failed to fetch order details. Please try again.");
  }
}

function showOrderDetailModal(orderDetails) {
  const modalContent = document.getElementById("order-detail-content");

  let itemsHtml = "";

  if (orderDetails.ingredients && orderDetails.ingredients.length > 0) {
    orderDetails.ingredients.forEach((ingredient) => {
      itemsHtml += `
                <div class="order-detail-item">
                    <div class="item-name">${ingredient.itemName}</div>
                    <div class="item-info">
                        <span> x ${ingredient.quantity}</span>
                    </div>
                </div>
            `;
    });
  } else {
    itemsHtml =
      '<div class="no-items">No ingredients found in this order</div>';
  }

  modalContent.innerHTML = `
        <div class="order-info">
            <div class="order-info-row">
                <span>Order ID:</span>
                <span>#${orderDetails.orderID}</span>
            </div>
            <div class="order-info-row">
                <span>Status:</span>
                <span>${orderDetails.orderStatus}</span>
            </div>
            <div class="order-info-row">
                <span>Date:</span>
                <span>${new Date(
                  orderDetails.orderTimestamp
                ).toLocaleString()}</span>
            </div>
            <div class="order-info-row">
                <span>Store ID:</span>
                <span>${orderDetails.storeID}</span>
            </div>
        </div>
        
        <h3>Order Items</h3>
        <div class="order-items-detail">
            ${itemsHtml}
        </div>
        
        <div class="order-total">
            <span>Total:</span>
            <span>$${
              orderDetails.totalPrice
                ? orderDetails.totalPrice.toFixed(2)
                : totalPrice.toFixed(2)
            }</span>
        </div>
    `;

  document.getElementById("order-detail-modal").style.display = "block";
}
