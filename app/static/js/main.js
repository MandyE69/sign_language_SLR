// Global instances
let toastManager
let themeManager

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize managers using the classes from separate files
  if (window.ToastManager) {
    toastManager = new window.ToastManager()
    window.toastManager = toastManager
  }

  if (window.ThemeManager) {
    themeManager = new window.ThemeManager()
    window.themeManager = themeManager
  }

  // Add fade-in animation to body
  document.body.style.opacity = "1"

  // Handle link clicks for smooth transitions
  const links = document.querySelectorAll('a[href^="/"]')
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.target !== "_blank" && !link.hasAttribute("data-no-transition")) {
        e.preventDefault()
        document.body.style.opacity = "0"
        setTimeout(() => {
          window.location.href = link.href
        }, 200)
      }
    })
  })
})

// Logout handler
function handleLogout() {
  if (window.toastManager) {
    window.toastManager.info("Logging out...", "Please wait")
  }

  setTimeout(() => {
    fetch("/logout", {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          if (window.toastManager) {
            window.toastManager.success("Successfully logged out!", "Goodbye!")
          }
          setTimeout(() => {
            window.location.href = "/login"
          }, 1500)
        } else {
          if (window.toastManager) {
            window.toastManager.error("Failed to logout. Please try again.", "Error")
          }
        }
      })
      .catch((error) => {
        if (window.toastManager) {
          window.toastManager.error("Network error. Please check your connection.", "Error")
        }
      })
  }, 500)
}

// Make handleLogout globally available
window.handleLogout = handleLogout

// Utility functions for other pages
window.showToast = {
  success: (message, title) => window.toastManager?.success(message, title),
  error: (message, title) => window.toastManager?.error(message, title),
  warning: (message, title) => window.toastManager?.warning(message, title),
  info: (message, title) => window.toastManager?.info(message, title),
}
