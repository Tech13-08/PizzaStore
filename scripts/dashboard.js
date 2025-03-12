document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Set logged-in user info
  document.getElementById("logged-user").textContent = user.login;
  document.getElementById("user-role").textContent = user.role;

  // Show/hide manager and driver tabs based on role
  if (user.role === "Manager") {
    document.getElementById("manager-menu-item").style.display = "block";
    document.getElementById("manager-users-item").style.display = "block";
  } else if (user.role === "Driver") {
    document.getElementById("driver-status-item").style.display = "block";
  }

  // Tab Switching Functionality
  const tabs = document.querySelectorAll(".nav-menu a");
  const sections = document.querySelectorAll(".dashboard-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all tabs and sections
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Add active class to the clicked tab
      this.classList.add("active");

      // Show the corresponding section
      const targetSectionId = this.getAttribute("id").replace(
        "-tab",
        "-section"
      );
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
});
