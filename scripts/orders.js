document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const orderHistoryTab = document.getElementById("all-orders-tab");
  const recentOrdersTab = document.getElementById("recent-orders-tab");
  const ordersTable = document
    .getElementById("orders-table")
    .querySelector("tbody");
  const orderDetails = document.getElementById("order-details");
  const closeDetailsBtn = document.getElementById("close-details");

  function loadOrderHistory() {
    fetch("http://localhost:5000/getOrderHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.login }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateOrdersTable(data.orders);
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  }

  function populateOrdersTable(orders) {
    ordersTable.innerHTML = "";
    orders.forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${order.orderID}</td>
                <td>${new Date(order.orderTimestamp).toLocaleString()}</td>
                <td>${order.storeID}</td>
                <td>$${order.totalPrice.toFixed(2)}</td>
                <td>${order.orderStatus}</td>
                <td><button class="btn primary-btn view-details-btn" data-order-id="${
                  order.orderID
                }">View Details</button></td>
            `;
      ordersTable.appendChild(row);
    });

    document.querySelectorAll(".view-details-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const orderID = this.getAttribute("data-order-id");
        fetchOrderDetails(orderID);
      });
    });
  }

  function fetchOrderDetails(orderID) {
    fetch("http://localhost:5000/getOrderDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateOrderDetails(data.order);
          orderDetails.style.display = "block";
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  }

  function populateOrderDetails(order) {
    document.getElementById("detail-order-id").textContent = order.orderID;
    document.getElementById("detail-date").textContent = new Date(
      order.orderTimestamp
    ).toLocaleString();
    document.getElementById("detail-store").textContent = order.storeID;
    document.getElementById("detail-status").textContent = order.orderStatus;
    document.getElementById(
      "detail-total"
    ).textContent = `$${order.totalPrice.toFixed(2)}`;

    const itemsTable = document
      .getElementById("detail-items")
      .querySelector("tbody");
    itemsTable.innerHTML = "";
    order.items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            `;
      itemsTable.appendChild(row);
    });
  }

  closeDetailsBtn.addEventListener("click", function () {
    orderDetails.style.display = "none";
  });

  orderHistoryTab.addEventListener("click", function () {
    loadOrderHistory();
  });

  recentOrdersTab.addEventListener("click", function () {
    fetch("http://localhost:5000/getRecentOrders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.login }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateOrdersTable(data.orders);
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  });

  loadOrderHistory();

  function showNotification(message, isError = false) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";
    if (isError) {
      notification.classList.add("error");
    } else {
      notification.classList.remove("error");
    }
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }
});
