// Theme management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light"
    this.toggleButton = document.getElementById("themeToggle")
    this.init()
  }

  init() {
    this.applyTheme(this.theme)
    if (this.toggleButton) {
      this.toggleButton.addEventListener("click", () => this.toggleTheme())
    }

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.applyTheme(e.matches ? "dark" : "light")
      }
    })
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    this.theme = theme

    // Add smooth transition class
    document.body.classList.add("theme-transitioning")
    setTimeout(() => {
      document.body.classList.remove("theme-transitioning")
    }, 300)
  }

  toggleTheme() {
    const newTheme = this.theme === "light" ? "dark" : "light"
    this.applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    // Enhanced toast notification with theme-specific message
    const themeEmoji = newTheme === "dark" ? "🌙" : "☀️"
    const themeMessage =
      newTheme === "dark" ? "Dark mode activated - easier on your eyes!" : "Light mode activated - bright and clear!"

    // if (window.toastManager) {
    //   window.toastManager.info(themeMessage, `${themeEmoji} Theme Changed`)
    // }

    // Enhanced click animation with bounce effect
    if (this.toggleButton) {
      this.toggleButton.style.transform = "scale(0.8) rotate(180deg)"
      setTimeout(() => {
        this.toggleButton.style.transform = "scale(1) rotate(0deg)"
      }, 200)

      // Add a subtle shake animation
      this.toggleButton.classList.add("theme-switching")
      setTimeout(() => {
        this.toggleButton.classList.remove("theme-switching")
      }, 600)
    }
  }
}

// Make ThemeManager available globally
window.ThemeManager = ThemeManager
