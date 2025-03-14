const API_URL = "http://localhost:50200";
let currentUser = null;
let menuItems = [];
let currentOrder = [];
let stores = [];
let selectedStore = null;

document.addEventListener("DOMContentLoaded", () => {
  checkLoggedInUser();
  setupEventListeners();
});

function checkLoggedInUser() {
  const user = sessionStorage.getItem("user");
  if (user) {
    currentUser = JSON.parse(user);
    showLoggedInState();
  } else {
    showLoggedOutState();
  }
}

function showLoggedInState() {
  document.getElementById("auth-buttons").style.display = "none";
  document.getElementById("logged-buttons").style.display = "block";
}

function showLoggedOutState() {
  document.getElementById("auth-buttons").style.display = "block";
  document.getElementById("logged-buttons").style.display = "none";
}

function setupEventListeners() {
  document
    .getElementById("login-button")
    .addEventListener("click", () => showAuthModal("login"));
  document
    .getElementById("signup-button")
    .addEventListener("click", () => showAuthModal("signup"));
  document.getElementById("logout-button").addEventListener("click", logout);
  document
    .getElementById("order-button")
    .addEventListener("click", navigateToDashboard);

  document
    .getElementById("auth-form")
    .addEventListener("submit", handleAuthSubmit);

  document.querySelectorAll(".close").forEach((element) => {
    element.addEventListener("click", () => {
      document.getElementById("modal").style.display = "none";
      document.getElementById("auth-modal").style.display = "none";
      document.getElementById("order-detail-modal").style.display = "none";
      document.getElementById("add-item-modal").style.display = "none";
      document.getElementById("edit-item-modal").style.display = "none";
    });
  });

  document
    .querySelector(".nav-toggle")
    .addEventListener("click", toggleSidebar);
  document
    .querySelector(".close-sidebar")
    .addEventListener("click", toggleSidebar);
  document.getElementById("overlay").addEventListener("click", toggleSidebar);

  document
    .getElementById("checkout-button")
    .addEventListener("click", navigateToCheckout);
  document
    .getElementById("checkout-menu-button")
    .addEventListener("click", navigateToDashboard);
  document
    .getElementById("profile-menu-button")
    .addEventListener("click", navigateToDashboard);
  document
    .getElementById("order-menu-button")
    .addEventListener("click", navigateToDashboard);
  document
    .getElementById("place-order-button")
    .addEventListener("click", placeOrder);
  document
    .getElementById("view-profile")
    .addEventListener("click", viewProfile);
  document
    .getElementById("view-orders")
    .addEventListener("click", viewOrderHistory);
  document
    .getElementById("index-button")
    .addEventListener("click", navigateToIndex);
}

function showAuthModal(type) {
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("auth-modal-title");
  const submitButton = document.getElementById("auth-submit-button");
  const phoneNumberGroup = document.getElementById("signup-name-group");

  if (type === "login") {
    title.textContent = "Login";
    submitButton.textContent = "Login";
    phoneNumberGroup.style.display = "none";
  } else {
    title.textContent = "Sign Up";
    submitButton.textContent = "Sign Up";
    phoneNumberGroup.style.display = "block";
  }

  modal.dataset.type = type;
  modal.style.display = "block";
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const username = document.getElementById("auth-username").value;
  const password = document.getElementById("auth-password").value;
  const modal = document.getElementById("auth-modal");
  const type = modal.dataset.type;

  if (type === "signup") {
    const phoneNumber = document.getElementById("auth-phone-number").value;
    const response = await createUser(username, password, phoneNumber);

    if (!response.ok) {
      alert(`Failed to create user: ${response.data}`);
      modal.style.display = "none";
      navigateToIndex();
      return;
    }
  }

  await login(username, password);
  modal.style.display = "none";
}

async function createUser(username, password, phoneNumber) {
  try {
    const response = await fetch(`${API_URL}/createUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: username,
        password: password,
        role: "customer",
        favoriteItems: "",
        phoneNum: phoneNumber,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      return {
        ok: false,
        data: data.message || "",
      };
    }
    return {
      ok: true,
      data: data,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      ok: false,
      data: "Failed to create user. Please try again.",
    };
  }
}

async function login(username, password) {
  try {
    const loginResponse = await fetch(
      `${API_URL}/login/${username}/${password}`
    );
    const data = await loginResponse.json();
    if (!data.success) {
      alert(`Failed to login: ${data.message}`);
      return;
    }

    const profileResponse = await fetch(`${API_URL}/getProfile/${username}`);
    if (!profileResponse.ok) {
      alert("Login failed. Please check your credentials.");
      return;
    }

    const userProfile = await profileResponse.json();

    currentUser = {
      login: userProfile.login,
      role: userProfile.role.replace(/[\s\u00A0]+$/, ""),
      favoriteItems: userProfile.favoriteItems,
      phoneNum: userProfile.phoneNum,
    };

    sessionStorage.setItem("user", JSON.stringify(currentUser));
    showLoggedInState();
    navigateToDashboard();
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Login failed. Please try again.");
  }
}

function logout() {
  sessionStorage.removeItem("user");
  currentUser = null;
  currentOrder = [];
  showLoggedOutState();

  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("landing-page").style.display = "block";
}

async function navigateToDashboard() {
  if (!currentUser) {
    alert("Please login first");
    return;
  }

  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("dashboard-page").style.display = "block";

  if (menuItems.length === 0) {
    await fetchMenu();
  }

  renderMenu();
}

async function navigateToIndex() {
  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("landing-page").style.display = "block";
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");

  if (sidebar.classList.contains("active")) {
    overlay.style.display = "block";
  } else {
    overlay.style.display = "none";
  }
}
