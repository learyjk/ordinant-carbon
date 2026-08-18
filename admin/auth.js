(function () {
  var KEY = "ordinant_admin_auth";

  function pageName() {
    var name = location.pathname.replace(/\/+$/, "").split("/").pop() || "";
    name = name.replace(/\.html$/i, "");
    if (!name || name === "admin") return "index";
    return name;
  }

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
    ok: loggedIn,
    pageName: pageName
  };

  if (pageName() === "login") return;

  if (!loggedIn()) {
    var next = pageName() + ".html" + location.search + location.hash;
    location.replace("login.html?redirect=" + encodeURIComponent(next));
  }
})();
