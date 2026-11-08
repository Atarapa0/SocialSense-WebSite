// Sitedeki tüm .contact-form formlarını contact-service'e bağlar.
// URL'de ?topic=kvkk varsa o konu otomatik seçilir (Veri Silme sayfasından link için).
(function () {
  var TEXT = {
    tr: {
      sending: "Gönderiliyor…",
      ok: "Mesajınız iletildi. En kısa sürede e-posta ile dönüş yapacağım.",
      email: "Lütfen geçerli bir e-posta adresi girin.",
      message: "Mesaj en az 10, en fazla 5000 karakter olmalı.",
      name: "Ad en fazla 100 karakter olabilir.",
      topic: "Lütfen bir konu seçin.",
      topic_other: "Lütfen konunuzu yazın (en fazla 100 karakter).",
      rate_limited: "Kısa sürede çok fazla mesaj gönderildi. Lütfen biraz sonra tekrar deneyin.",
      generic: "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin veya info@furkanerdogan.com adresine yazın."
    },
    en: {
      sending: "Sending…",
      ok: "Your message has been sent. I'll get back to you by email soon.",
      email: "Please enter a valid email address.",
      message: "The message must be between 10 and 5000 characters.",
      name: "The name can be at most 100 characters.",
      topic: "Please choose a topic.",
      topic_other: "Please enter your topic (at most 100 characters).",
      rate_limited: "Too many messages in a short time. Please try again a bit later.",
      generic: "The message could not be sent. Please try again later or write to info@furkanerdogan.com."
    }
  };

  function setStatus(el, state, msg) {
    el.dataset.state = state;
    el.textContent = msg;
  }

  document.querySelectorAll("form.contact-form").forEach(function (form) {
    var t = TEXT[form.dataset.lang] || TEXT.tr;
    var status = form.querySelector(".cf-status");
    var button = form.querySelector('button[type="submit"]');
    // form.name formun kendi "name" özelliğidir; alanlara her zaman elements üzerinden eriş.
    var f = form.elements;

    // "Diğer" seçilince kullanıcının konuyu kendisinin yazacağı alanı göster.
    var otherWrap = form.querySelector(".cf-other");
    function syncOther() {
      var on = f["topic"].value === "other";
      otherWrap.hidden = !on;
      f["topic_other"].required = on;
    }
    f["topic"].addEventListener("change", syncOther);

    var wanted = new URLSearchParams(location.search).get("topic");
    if (wanted && f["topic"].querySelector('option[value="' + CSS.escape(wanted) + '"]')) {
      f["topic"].value = wanted;
    }
    syncOther();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f["email"].checkValidity()) { setStatus(status, "error", t.email); return; }
      if (!f["topic"].value) { setStatus(status, "error", t.topic); return; }
      var topicOther = f["topic"].value === "other" ? f["topic_other"].value.trim() : "";
      if (f["topic"].value === "other" && (!topicOther || topicOther.length > 100)) {
        setStatus(status, "error", t.topic_other); return;
      }
      var msg = f["message"].value.trim();
      if (msg.length < 10 || msg.length > 5000) { setStatus(status, "error", t.message); return; }

      var payload = {
        name: f["name"].value.trim(),
        email: f["email"].value.trim(),
        topic: f["topic"].value,
        topic_other: topicOther,
        message: msg,
        lang: form.dataset.lang || "tr",
        website: f["website"].value
      };

      button.disabled = true;
      setStatus(status, "pending", t.sending);

      fetch(form.dataset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (res.ok && data.ok) {
              form.reset();
              syncOther();
              setStatus(status, "ok", t.ok);
            } else if (data.error === "invalid_field" && t[data.field]) {
              setStatus(status, "error", t[data.field]);
            } else if (data.error === "rate_limited") {
              setStatus(status, "error", t.rate_limited);
            } else {
              setStatus(status, "error", t.generic);
            }
          });
        })
        .catch(function () { setStatus(status, "error", t.generic); })
        .finally(function () { button.disabled = false; });
    });
  });
})();
