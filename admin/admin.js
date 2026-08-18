(function () {
  var studies = window.CASE_STUDIES || [];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findBySlug(slug) {
    for (var i = 0; i < studies.length; i++) {
      if (studies[i].post_name === slug) return studies[i];
    }
    return null;
  }

  function statusLabel(status) {
    return status === "publish" ? "Published" : status.charAt(0).toUpperCase() + status.slice(1);
  }

  function initDashboard() {
    var published = studies.filter(function (row) { return row.post_status === "publish"; }).length;
    var drafts = studies.length - published;
    qs("#count-all").textContent = studies.length;
    qs("#count-published").textContent = published;
    qs("#count-drafts").textContent = drafts;

    var recent = studies.slice().sort(function (a, b) {
      return String(b.post_modified).localeCompare(String(a.post_modified));
    }).slice(0, 6);

    qs("#recent-case-studies").innerHTML = recent.map(function (row) {
      return (
        "<li>" +
          "<a href=\"case-study.html?name=" + encodeURIComponent(row.post_name) + "\">" + esc(row.post_title) + "</a>" +
          "<span class=\"meta\">" + esc(statusLabel(row.post_status)) + " · " + esc(row.post_modified || "—") + "</span>" +
        "</li>"
      );
    }).join("");
  }

  function initList() {
    var tbody = qs("#the-list");
    var statusFilter = "all";
    var sectorFilter = "";
    var search = "";

    function matches(row) {
      if (statusFilter !== "all" && row.post_status !== statusFilter) return false;
      if (sectorFilter && String(row.post_category).toLowerCase() !== sectorFilter) return false;
      if (search) {
        var hay = (row.post_title + " " + row.post_name + " " + row.cf_client_company + " " + row.post_author).toLowerCase();
        if (hay.indexOf(search) === -1) return false;
      }
      return true;
    }

    function render() {
      var rows = studies.filter(matches);
      qs("#displaying-num").textContent = rows.length;
      tbody.innerHTML = rows.map(function (row) {
        var thumb = row.featured_image_url
          ? "<img class=\"thumb\" src=\"" + esc(row.featured_image_url) + "\" alt=\"\">"
          : "<span class=\"thumb missing\" title=\"No featured image\"></span>";
        var statusClass = row.post_status === "draft" ? "status-pill draft" : "status-pill";
        return (
          "<tr>" +
            "<th class=\"check-column\"><input type=\"checkbox\"></th>" +
            "<td>" + thumb + "</td>" +
            "<td>" +
              "<a class=\"row-title\" href=\"case-study.html?name=" + encodeURIComponent(row.post_name) + "\">" + esc(row.post_title) + "</a>" +
              "<div class=\"row-actions\">" +
                "<span><a href=\"case-study.html?name=" + encodeURIComponent(row.post_name) + "\">Edit</a> |</span>" +
                "<span><a href=\"../case-studies/" + encodeURIComponent(row.post_name) + ".html\">View</a> |</span>" +
                "<span class=\"trash\"><a href=\"#\">Trash</a></span>" +
              "</div>" +
            "</td>" +
            "<td>" + esc(row.post_author) + "</td>" +
            "<td>" + esc(row.post_category) + "</td>" +
            "<td><span class=\"" + statusClass + "\">" + esc(row.post_status) + "</span></td>" +
            "<td>" + esc(row.post_date || "—") + "</td>" +
          "</tr>"
        );
      }).join("");
    }

    qsa(".subsubsub a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        qsa(".subsubsub a").forEach(function (item) { item.classList.remove("current"); });
        link.classList.add("current");
        statusFilter = link.getAttribute("data-status") || "all";
        render();
      });
    });

    qs("#sector-filter").addEventListener("change", function () {
      sectorFilter = this.value;
      render();
    });

    qs("#post-search").addEventListener("input", function () {
      search = this.value.trim().toLowerCase();
      render();
    });

    qs("#doaction").addEventListener("click", function (event) {
      event.preventDefault();
    });

    qs("#do-filter").addEventListener("click", function (event) {
      event.preventDefault();
      render();
    });

    render();
  }

  function initEdit() {
    var slug = param("name");
    var row = slug ? findBySlug(slug) : null;
    var heading = qs("#edit-heading");
    var notice = qs("#update-notice");

    function fill(id, value) {
      var field = qs("#" + id);
      if (field) field.value = value || "";
    }

    if (row) {
      heading.textContent = "Edit Case Study";
      fill("title", row.post_title);
      fill("slug", row.post_name);
      fill("content", row.content);
      fill("status", row.post_status);
      fill("post_date", row.post_date);
      fill("post_author", row.post_author);
      fill("post_category", row.post_category);
      fill("featured_image_url", row.featured_image_url);
      fill("cf_client_contact_name", row.cf_client_contact_name);
      fill("cf_client_title", row.cf_client_title);
      fill("cf_client_company", row.cf_client_company);
      fill("cf_result_stat", row.cf_result_stat);
      fill("seo_title", row.seo_title);
      fill("seo_meta_description", row.seo_meta_description);
      qs("#post-id-display").textContent = row.post_id || "—";
      qs("#permalink-slug").textContent = row.post_name || "auto-draft";
      var img = qs("#featured-preview");
      if (row.featured_image_url) {
        img.src = row.featured_image_url;
        img.classList.remove("hidden");
      } else {
        img.classList.add("hidden");
      }
      qs("#view-link").href = "../case-studies/" + encodeURIComponent(row.post_name) + ".html";
      qs("#view-link").classList.remove("hidden");
      qsa("input[name='sector_radio']").forEach(function (radio) {
        radio.checked = radio.value.toLowerCase() === String(row.post_category).toLowerCase();
      });
    } else {
      heading.textContent = "Add New Case Study";
      qs("#view-link").classList.add("hidden");
      qs("#post-id-display").textContent = "—";
      qs("#permalink-slug").textContent = "auto-draft";
      qs("#featured-preview").classList.add("hidden");
    }

    qs("#publish").addEventListener("click", function (event) {
      event.preventDefault();
      notice.classList.remove("hidden");
      notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    initRichEditor();
  }

  function htmlToVisual(html) {
    return String(html || "").replace(/\[([^\]]+)\]/g, function (match, inner) {
      var name = inner.split(/\s+/)[0];
      return '<span class="mce-shortcode" contenteditable="false" data-shortcode="' + esc(match) + '">[' + esc(name) + ']</span>';
    });
  }

  function visualToHtml(visual) {
    var clone = visual.cloneNode(true);
    qsa(".mce-shortcode", clone).forEach(function (chip) {
      chip.parentNode.replaceChild(document.createTextNode(chip.getAttribute("data-shortcode") || ""), chip);
    });
    return clone.innerHTML;
  }

  function initRichEditor() {
    var wrap = qs("#wp-content-wrap");
    var visual = qs("#content-visual");
    var textarea = qs("#content");
    if (!wrap || !visual || !textarea) return;

    visual.innerHTML = htmlToVisual(textarea.value);

    qs("#content-tmce").addEventListener("click", function () {
      textarea.value = visualToHtml(visual) || textarea.value;
      visual.innerHTML = htmlToVisual(textarea.value);
      wrap.classList.add("tmce-active");
      wrap.classList.remove("html-active");
    });

    qs("#content-html").addEventListener("click", function () {
      textarea.value = visualToHtml(visual);
      wrap.classList.add("html-active");
      wrap.classList.remove("tmce-active");
      textarea.focus();
    });

    qsa("#mce-toolbar button").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        visual.focus();
        var cmd = btn.getAttribute("data-cmd");
        var value = btn.getAttribute("data-value") || null;
        if (cmd === "createLink") {
          var url = window.prompt("Enter the URL", "https://");
          if (url) document.execCommand("createLink", false, url);
          return;
        }
        if (cmd === "formatBlock" && value) {
          document.execCommand("formatBlock", false, value);
          return;
        }
        document.execCommand(cmd, false, value);
      });
    });

    qs("#insert-media-button").addEventListener("click", function (event) {
      event.preventDefault();
      visual.focus();
      document.execCommand("insertHTML", false, '<p><em>[media id=""]</em></p>');
    });
  }

  var screen = document.body.getAttribute("data-screen");
  if (screen === "dashboard") initDashboard();
  if (screen === "list") initList();
  if (screen === "edit") initEdit();
})();
