// Login form handler
function initLoginForm() {
  const loginForm = document.getElementById("loginForm")
  const loginButton = document.getElementById("loginButton")

  if (loginForm && loginButton) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Show loading state
      loginButton.classList.add("loading")
      loginButton.disabled = true

      // Get form data
      const formData = new FormData(loginForm)

      try {
        const response = await fetch(loginForm.action, {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          // Check if login was successful by looking at the response
          const responseText = await response.text()

          if (responseText.includes("login-container")) {
            // Still on login page, means login failed
            if (window.showToast) {
              window.showToast.error("Invalid email or password. Please try again.", "Login Failed")
            }
          } else {
            // Login successful
            if (window.showToast) {
              window.showToast.success("Welcome back! Redirecting to dashboard...", "Login Successful")
            }
            setTimeout(() => {
              window.location.href = "/"
            }, 1500)
          }
        } else {
          if (window.showToast) {
            window.showToast.error("Login failed. Please check your credentials.", "Error")
          }
        }
      } catch (error) {
        if (window.showToast) {
          window.showToast.error("Network error. Please check your connection and try again.", "Connection Error")
        }
      } finally {
        // Remove loading state
        loginButton.classList.remove("loading")
        loginButton.disabled = false
      }
    })
  }

  // Show welcome message if redirected from signup
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("signup") === "success") {
    setTimeout(() => {
      if (window.showToast) {
        window.showToast.success("Account created successfully! Please sign in.", "Welcome!")
      }
    }, 500)
  }
}

// Signup form handler
function initSignupForm() {
  const signupForm = document.getElementById("signupForm")
  const signupButton = document.getElementById("signupButton")

  if (signupForm && signupButton) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Show loading state
      signupButton.classList.add("loading")
      signupButton.disabled = true

      // Get form data
      const formData = new FormData(signupForm)

      // Basic validation
      const password = formData.get("password")
      if (password.length < 6) {
        if (window.showToast) {
          window.showToast.warning("Password must be at least 6 characters long.", "Validation Error")
        }
        signupButton.classList.remove("loading")
        signupButton.disabled = false
        return
      }

      try {
        const response = await fetch(signupForm.action, {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const responseText = await response.text()

          if (responseText.includes("signup-container")) {
            // Still on signup page, means signup failed
            if (window.showToast) {
              window.showToast.error("Email already exists or invalid data. Please try again.", "Signup Failed")
            }
          } else {
            // Signup successful
            if (window.showToast) {
              window.showToast.success("Account created successfully! Redirecting to login...", "Welcome!")
            }
            setTimeout(() => {
              window.location.href = "/login?signup=success"
            }, 1500)
          }
        } else {
          if (window.showToast) {
            window.showToast.error("Signup failed. Please try again.", "Error")
          }
        }
      } catch (error) {
        if (window.showToast) {
          window.showToast.error("Network error. Please check your connection and try again.", "Connection Error")
        }
      } finally {
        // Remove loading state
        signupButton.classList.remove("loading")
        signupButton.disabled = false
      }
    })
  }
}

// Initialize auth forms when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for the main managers to initialize
  setTimeout(() => {
    initLoginForm()
    initSignupForm()
  }, 100)
})
