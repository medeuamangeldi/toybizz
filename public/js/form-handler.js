// This script will be injected into generated invitations for form handling
(function () {
  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('form[action="/api/register"]');
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const submitBtn = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );
      const originalText = submitBtn ? submitBtn.textContent : "";

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Регистрируем...";
      }

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          // Success
          showMessage("✅ " + result.message, "success");
          form.reset();
        } else {
          // Error
          showMessage("❌ " + result.error, "error");
        }
      } catch {
        showMessage("❌ Произошла ошибка при регистрации", "error");
      } finally {
        // Reset button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });

    function showMessage(message, type) {
      // Remove existing message
      const existingMessage = document.querySelector(".registration-message");
      if (existingMessage) {
        existingMessage.remove();
      }

      // Create new message
      const messageDiv = document.createElement("div");
      messageDiv.className = "registration-message";
      messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        ${type === "success" ? "background: #4CAF50;" : "background: #f44336;"}
      `;
      messageDiv.textContent = message;

      // Add slide-in animation
      const style = document.createElement("style");
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(messageDiv);

      // Auto remove after 5 seconds
      setTimeout(() => {
        messageDiv.style.animation = "slideIn 0.3s ease-out reverse";
        setTimeout(() => messageDiv.remove(), 300);
      }, 5000);
    }
  });
})();
