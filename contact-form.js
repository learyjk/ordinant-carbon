(function () {
  var form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.assign("/thank-you.html");
  });
})();
