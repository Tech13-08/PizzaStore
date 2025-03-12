document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const profileUsername = document.getElementById("profile-username");
  const profilePhone = document.getElementById("profile-phone");
  const profileFavorite = document.getElementById("profile-favorite");
  const updateProfileForm = document.getElementById("update-profile-form");

  profileUsername.textContent = user.login;
  profilePhone.textContent = user.phoneNum;
  profileFavorite.textContent = user.favoriteItems || "None";

  updateProfileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const newPassword = document.getElementById("new-password").value;
    const newPhone = document.getElementById("new-phone").value;
    const favoriteItem = document.getElementById("favorite-item").value;

    fetch("http://localhost:5000/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.login,
        newPassword,
        newPhone,
        favoriteItem,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showNotification("Profile updated successfully!");
          user.phoneNum = newPhone || user.phoneNum;
          user.favoriteItems = favoriteItem || user.favoriteItems;
          localStorage.setItem("user", JSON.stringify(user));
          profilePhone.textContent = user.phoneNum;
          profileFavorite.textContent = user.favoriteItems || "None";
        } else {
          showNotification(data.message, true);
        }
      })
      .catch((error) => {
        showNotification("An error occurred. Please try again.", true);
      });
  });

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
