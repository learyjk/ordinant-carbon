(function () {
  var KEY = "ordinant_admin_auth";
  var home = document.documentElement.getAttribute("data-admin") === "home";
  var loginPage = document.documentElement.getAttribute("data-admin") === "login";
  var protectedPage = document.documentElement.getAttribute("data-admin") === "protected";

  function loggedIn() {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  function login() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (err) {}
  }

  function logout() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (err) {}
  }

  if (/[?&]logout=1(?:&|$)/.test(location.search)) {
    logout();
  }

  window.ordinantAuth = {
    login: login,
    logout: logout,
    ok: loggedIn,
    bindLoginForm: function (form, error, password) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (password.value === "a") {
          login();
          if (home) {
            document.documentElement.classList.remove("need-login");
            document.body.className = "admin";
            var gate = document.getElementById("login-gate");
            var app = document.getElementById("admin-app");
            if (gate) gate.hidden = true;
            if (app) app.hidden = false;
            history.replaceState({}, "", "/admin/");
            return;
          }
          location.replace("/admin/");
          return;
        }
        error.classList.remove("hidden");
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        password.value = "";
        password.focus();
      });
    }
  };

  if (home && !loggedIn()) {
    document.documentElement.classList.add("need-login");
    document.addEventListener("DOMContentLoaded", function () {
      document.body.classList.add("login-screen");
      document.body.classList.remove("admin");
    });
  }

  if (protectedPage && !loggedIn()) {
    location.replace("/admin/");
  }

  if (loginPage && loggedIn()) {
    location.replace("/admin/");
  }
})();
