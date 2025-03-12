document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const menuTypeFilter = document.getElementById("menu-type-filter");
  const menuPriceFilter = document.getElementById("menu-price-filter");
  const menuSort = document.getElementById("menu-sort");
  const applyFiltersBtn = document.getElementById("apply-filters");
  const menuItemsContainer = document
    .getElementById("menu-items")
    .querySelector("tbody");

  function loadMenuItems() {
    fetch("http://localhost:5000/getMenuItems")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateMenuItems(data.items);
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  }

  function populateMenuItems(items) {
    menuItemsContainer.innerHTML = "";
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.typeOfItem}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.description}</td>
                <td>${item.ingredients}</td>
            `;
      menuItemsContainer.appendChild(row);
    });
  }

  applyFiltersBtn.addEventListener("click", function () {
    const type = menuTypeFilter.value;
    const maxPrice = menuPriceFilter.value;
    const sort = menuSort.value;

    fetch("http://localhost:5000/getMenuItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, maxPrice, sort }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          populateMenuItems(data.items);
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  });

  loadMenuItems();

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
