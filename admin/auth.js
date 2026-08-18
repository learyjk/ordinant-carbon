(function () {
  var KEY = "ordinant_admin_auth";
  var onLoginPage = /login\.html$/i.test(location.pathname);

  function loggedIn() {
    return sessionStorage.getItem(KEY) === "1";
  }

  window.ordinantAuth = {
    login: function () {
      sessionStorage.setItem(KEY, "1");
    },
    logout: function () {
      sessionStorage.removeItem(KEY);
    },
    ok: loggedIn
  };

  if (onLoginPage) return;

  if (!loggedIn()) {
    var next = (location.pathname.split("/").pop() || "index.html") + location.search + location.hash;
    location.replace("login.html?redirect=" + encodeURIComponent(next));
  }
})();
