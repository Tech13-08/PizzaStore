document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
          } else {
            showNotification(data.message, true);
          }
        })
        .catch((error) => {
          showNotification("An error occurred. Please try again.", true);
        });
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("regUsername").value;
      const password = document.getElementById("regPassword").value;
      const phoneNum = document.getElementById("phoneNum").value;

      fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, phoneNum }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showNotification("Registration successful! Please login.");
            window.location.href = "login.html";
          } else {
            showNotification(data.message, true);
          }
        })
        .catch((error) => {
          showNotification("An error occurred. Please try again.", true);
        });
    });
  }

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
