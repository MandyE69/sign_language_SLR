// Toast Notification System
class ToastManager {
  constructor() {
    this.container = document.getElementById("toastContainer")
    this.toasts = []
  }

  show(message, type = "info", title = "", duration = 5000) {
    const toast = this.createToast(message, type, title, duration)
    this.container.appendChild(toast)
    this.toasts.push(toast)

    // Trigger animation
    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    // Auto remove
    if (duration > 0) {
      this.startProgress(toast, duration)
      setTimeout(() => {
        this.remove(toast)
      }, duration)
    }

    return toast
  }

  createToast(message, type, title, duration) {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    const titles = {
      success: title || "Success",
      error: title || "Error",
      warning: title || "Warning",
      info: title || "Info",
    }

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="window.toastManager.remove(this.parentElement)">
        <i class="fas fa-times"></i>
      </button>
      ${duration > 0 ? '<div class="toast-progress"></div>' : ""}
    `

    return toast
  }

  startProgress(toast, duration) {
    const progressBar = toast.querySelector(".toast-progress")
    if (progressBar) {
      progressBar.style.width = "100%"
      progressBar.style.transitionDuration = `${duration}ms`
      setTimeout(() => {
        progressBar.style.width = "0%"
      }, 50)
    }
  }

  remove(toast) {
    if (toast && toast.parentElement) {
      toast.classList.add("hide")
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast)
        }
        this.toasts = this.toasts.filter((t) => t !== toast)
      }, 400)
    }
  }

  success(message, title = "Success!") {
    return this.show(message, "success", title)
  }

  error(message, title = "Error!") {
    return this.show(message, "error", title)
  }

  warning(message, title = "Warning!") {
    return this.show(message, "warning", title)
  }

  info(message, title = "Info") {
    return this.show(message, "info", title)
  }
}

// Make ToastManager available globally
window.ToastManager = ToastManager
