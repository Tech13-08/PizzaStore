document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-page").style.display == "block") {
    viewProfile();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profile-form");

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    updateProfile();
  });
});

document
  .getElementById("profile-search-user-button")
  .addEventListener("click", async () => {
    const username = document.getElementById("profile-search-username").value;
    if (username) {
      await loadProfile(username);
    } else {
      await loadProfile();
    }
  });

async function updateProfile() {
  const username =
    document.getElementById("profile-search-username").value ||
    currentUser.login;
  const newLogin = document.getElementById("username").value;
  const newPassword = document.getElementById("password").value;
  const newRole = document.getElementById("role").value;
  const newFavoriteItems = document.getElementById("favorite-items").value;
  const newPhoneNumber = document.getElementById("phone").value;

  try {
    const response = await fetch(`${API_URL}/updateUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentLogin: username,
        currentRole: currentUser.role,
        newLogin: newLogin == username ? "" : newLogin,
        newPassword: newPassword,
        newRole: newRole,
        newFavoriteItems: newFavoriteItems,
        newPhoneNumber: newPhoneNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      if (currentUser.login == username) {
        const profileResponse = await fetch(
          `${API_URL}/getProfile/${newLogin}`
        );
        const userProfile = await profileResponse.json();

        currentUser = {
          login: userProfile.login,
          role: userProfile.role.replace(/[\s\u00A0]+$/, ""),
          favoriteItems: userProfile.favoriteItems,
          phoneNum: userProfile.phoneNum,
        };

        sessionStorage.setItem("user", JSON.stringify(currentUser));
      }
    } else {
      alert(`Failed to update user: ${data.message}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update user. Please try again.");
  }
}

function viewProfile() {
  if (currentUser) {
    document.getElementById("manager-profile-search").style.display =
      currentUser.role != "manager" ? "none" : "block";
    document.getElementById("username").disabled =
      currentUser.role != "manager";
    document.getElementById("role").disabled = currentUser.role != "manager";
  }

  toggleSidebar();
  loadProfile();
  document
    .querySelectorAll(".page")
    .forEach((page) => (page.style.display = "none"));
  document.getElementById("profile-page").style.display = "block";
}

async function loadProfile(username = currentUser.login) {
  try {
    const response = await fetch(`${API_URL}/getProfile/${username}`);
    const profile = await response.json();
    if (profile) {
      console.log(profile);
      document.getElementById("username").value = profile.login || "";
      document.getElementById("password").value = "";
      document.getElementById("role").value =
        profile.role.replace(/[\s\u00A0]+$/, "") || "";
      document.getElementById("phone").value = profile.phoneNum || "";
      document.getElementById("favorite-items").value =
        profile.favoriteItems || "";
    } else {
      alert("User not found.");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Failed to fetch profile. Please try again.");
  }
}
