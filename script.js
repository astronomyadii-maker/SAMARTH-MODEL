/* ============================================================
   VittaSetu — signup / login interactions
   No backend wired up yet: hook the TODOs to your API layer.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Tab switching (Create account / Log in) ---------- */

  const tabSignup = document.getElementById("tab-signup");
  const tabLogin = document.getElementById("tab-login");
  const panelSignup = document.getElementById("panel-signup");
  const panelLogin = document.getElementById("panel-login");
  const goToLogin = document.getElementById("goToLogin");
  const goToSignup = document.getElementById("goToSignup");

  function showSignup() {
    tabSignup.classList.add("is-active");
    tabLogin.classList.remove("is-active");
    tabSignup.setAttribute("aria-selected", "true");
    tabLogin.setAttribute("aria-selected", "false");
    panelSignup.hidden = false;
    panelLogin.hidden = true;
    hideConfirmation();
  }

  function showLogin() {
    tabLogin.classList.add("is-active");
    tabSignup.classList.remove("is-active");
    tabLogin.setAttribute("aria-selected", "true");
    tabSignup.setAttribute("aria-selected", "false");
    panelLogin.hidden = false;
    panelSignup.hidden = true;
    hideConfirmation();
  }

  tabSignup.addEventListener("click", showSignup);
  tabLogin.addEventListener("click", showLogin);
  goToLogin.addEventListener("click", showLogin);
  goToSignup.addEventListener("click", showSignup);

  /* ---------- Password show / hide ---------- */

  document.querySelectorAll(".field__toggle-visibility").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      btn.classList.toggle("is-visible", !isVisible);
      btn.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    });
  });

  /* ---------- Account type segmented control ---------- */

  const accountTypeGroup = document.getElementById("accountType");
  const accountTypeValue = document.getElementById("accountTypeValue");

  accountTypeGroup.addEventListener("click", function (e) {
    const opt = e.target.closest(".segmented__opt");
    if (!opt) return;
    accountTypeGroup.querySelectorAll(".segmented__opt").forEach(function (o) {
      o.classList.remove("is-selected");
      o.setAttribute("aria-checked", "false");
    });
    opt.classList.add("is-selected");
    opt.setAttribute("aria-checked", "true");
    accountTypeValue.value = opt.getAttribute("data-value");
    clearFieldError("accountType");
  });

  /* ---------- Validation helpers ---------- */

  function setFieldError(name, message) {
    const field = document.querySelector('[name="' + name + '"]');
    const errorEl = document.querySelector('[data-error-for="' + name + '"]');
    const wrapper = field ? field.closest(".field") : null;
    if (wrapper) wrapper.classList.add("has-error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(name) {
    const field = document.querySelector('[name="' + name + '"]');
    const errorEl = document.querySelector('[data-error-for="' + name + '"]');
    const wrapper = field ? field.closest(".field") : null;
    if (wrapper) wrapper.classList.remove("has-error");
    if (errorEl) errorEl.textContent = "";
  }

  function clearAllErrors(form) {
    form.querySelectorAll(".field__error").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".field.has-error").forEach(function (el) { el.classList.remove("has-error"); });
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MOBILE_RE = /^[6-9]\d{9}$/;

  function isAdult(dobValue) {
    if (!dobValue) return false;
    const dob = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  }

  /* ---------- Sign up form ---------- */

  const signupForm = document.getElementById("signupForm");

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(signupForm);

    const data = Object.fromEntries(new FormData(signupForm).entries());
    let firstInvalid = null;
    let valid = true;

    function fail(name, message) {
      setFieldError(name, message);
      valid = false;
      if (!firstInvalid) firstInvalid = document.querySelector('[name="' + name + '"]');
    }

    if (!data.fullName || data.fullName.trim().length < 3) {
      fail("fullName", "Enter your full name as per ID proof.");
    }
    if (!data.email || !EMAIL_RE.test(data.email)) {
      fail("email", "Enter a valid email address.");
    }
    if (!data.mobile || !MOBILE_RE.test(data.mobile)) {
      fail("mobile", "Enter a valid 10-digit mobile number.");
    }
    if (!data.dob) {
      fail("dob", "Date of birth is required.");
    } else if (!isAdult(data.dob)) {
      fail("dob", "You must be 18 or older to open an account.");
    }
    if (!data.password || data.password.length < 8) {
      fail("password", "Password must be at least 8 characters.");
    }
    if (!data.businessType) {
      fail("businessType", "Select your business structure.");
    }
    if (!data.businessName || data.businessName.trim().length < 2) {
      fail("businessName", "Enter your business or startup name.");
    }
    if (!accountTypeValue.value) {
      fail("accountType", "Choose an account type.");
    }
    if (!data.address || data.address.trim().length < 8) {
      fail("address", "Enter your registered business address.");
    }
    if (!document.getElementById("terms").checked) {
      fail("terms", "Please accept the terms to continue.");
    }

    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // TODO: replace with a real API call, e.g.
    // fetch("/api/accounts", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
    console.log("Signup payload ready for backend / AI risk-check service:", {
      ...data,
      accountType: accountTypeValue.value
    });

    showConfirmation({
      title: "Account created",
      text: "Your details have been recorded. Our verification engine will confirm your KYC and business details shortly."
    });
    signupForm.reset();
    accountTypeGroup.querySelectorAll(".segmented__opt").forEach(function (o) {
      o.classList.remove("is-selected");
      o.setAttribute("aria-checked", "false");
    });
    accountTypeValue.value = "";
  });

  /* ---------- Log in form ---------- */

  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(loginForm);

    const data = Object.fromEntries(new FormData(loginForm).entries());
    let valid = true;

    if (!data.loginId || data.loginId.trim().length < 3) {
      setFieldError("loginId", "Enter your registered email or mobile number.");
      valid = false;
    }
    if (!data.loginPassword) {
      setFieldError("loginPassword", "Enter your password.");
      valid = false;
    }

    if (!valid) return;

    // TODO: replace with a real authentication call, e.g.
    // fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
    console.log("Login attempt ready for backend:", data);

    showConfirmation({
      title: "Welcome back",
      text: "You're being signed in to your VittaSetu dashboard."
    });
    loginForm.reset();
  });

  /* ---------- Confirmation state ---------- */

  const confirmation = document.getElementById("confirmation");
  const confirmationTitle = document.getElementById("confirmationTitle");
  const confirmationText = document.getElementById("confirmationText");
  const confirmationClose = document.getElementById("confirmationClose");

  function showConfirmation(opts) {
    confirmationTitle.textContent = opts.title;
    confirmationText.textContent = opts.text;
    panelSignup.hidden = true;
    panelLogin.hidden = true;
    document.querySelector(".tabs").hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  }

  function hideConfirmation() {
    confirmation.hidden = true;
    document.querySelector(".tabs").hidden = false;
  }

  confirmationClose.addEventListener("click", function () {
    hideConfirmation();
    showSignup();
  });

})();
