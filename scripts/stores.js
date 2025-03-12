document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const storesTable = document
    .getElementById("stores-table")
    .querySelector("tbody");

  function loadStores() {
    fetch("http://localhost:5000/getStores")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateStoresTable(data.stores);
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  }

  function populateStoresTable(stores) {
    storesTable.innerHTML = "";
    stores.forEach((store) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${store.storeID}</td>
                <td>${store.address}</td>
                <td>${store.city}</td>
                <td>${store.state}</td>
                <td>${store.isOpen}</td>
                <td>${store.reviewScore}</td>
            `;
      storesTable.appendChild(row);
    });
  }

  loadStores();

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
