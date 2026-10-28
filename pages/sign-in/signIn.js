const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => root.querySelectorAll(selector);
const params = new URLSearchParams(window.location.search);
const signingInTo = params.get("to");

// Change Page (Sign In page and Account Creation Page)
const sections = [
  "main_sign_in",
  "main_create_account",
  "main_verify",
  "forgot_password",
  "resetPasswordSent",
];

function showSection(id) {
  sections.forEach((name) => {
    $(`#${name}`).classList.toggle("hidden", name !== id);
  });
}

const page_flip_buttons = {
  createAccount: "main_create_account",
  createAccount2: "main_create_account",
  signIn: "main_sign_in",
  signIn2: "main_sign_in",
  signIn3: "main_sign_in",
  signIn4: "main_sign_in",
  forgotPassword: "forgot_password",
};

Object.entries(page_flip_buttons).forEach(([buttonId, sectionId]) => {
  $(`#${buttonId}`).addEventListener("click", (event) => {
    event.preventDefault();
    showSection(sectionId);
  });
});

// Show/Hide Passwords
for (const btn of $$(".showPassword")) {
  btn.addEventListener("click", function (event) {
    event.preventDefault();
    const input = $(`input[name="${btn.id}"]`);
    if (input.type === "password") {
      btn.textContent = "HIDE";
      input.type = "text";
    } else {
      btn.textContent = "SHOW";
      input.type = "password";
    }
  });
}

async function signIn() {
  const usernameEmpty = toggleHidden(
    "EmptyUsername",
    $('input[name="signInUsername"]').value === "",
  );
  const passwordEmpty = toggleHidden(
    "EmptyPassword",
    $('input[name="signInPassword"]').value === "",
  );

  if (usernameEmpty || passwordEmpty) return;
  const data = {};
  data.user = $('input[name="signInUsername"]').value;
  data.password = $('input[name="signInPassword"]').value;
  data.type = "login";
  $("#signInButton").disabled = true;
  await sendData(data);
  $("#signInButton").disabled = false;
}

async function createAccount() {
  for (const errorMSG of $$(".accountCreationError")) {
    toggleHidden(errorMSG.id, false);
  }
  if (
    toggleHidden(
      "confirmPasswordNotMatch",
      $('input[name="createAccountConfirmPassword"]').value !==
        $('input[name="createAccountPassword"]').value,
    )
  ) {
    return;
  }
  const data = {};
  data.user = $('input[name="createAccountUsername"]').value;
  data.email = $('input[name="createAccountEmail"]').value;
  data.password = $('input[name="createAccountPassword"]').value;
  data.type = "create";
  $("#createAccountButton").disabled = true;
  await sendData(data);
  $("#createAccountButton").disabled = false;
}
const verifyTextboxes = Array.from($$('input[name="verify"]'));

verifyTextboxes.forEach((box, i) => {
  box.addEventListener("input", () => {
    box.value = box.value.replace(/\D/g, "");
    if (box.value && i < verifyTextboxes.length - 1) {
      verifyTextboxes[i + 1].focus();
    }
  });
  box.addEventListener("keydown", (e) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      box.value === "" &&
      i > 0
    ) {
      e.preventDefault();
      verifyTextboxes[i - 1].focus();
      verifyTextboxes[i - 1].value = "";
    }
  });
});
async function verifyCode() {
  let code = "";
  verifyTextboxes.forEach((box, i) => {
    code += box.value;
  });
  if (toggleHidden("verificationCodeNotFilledIn", code.length != 6)) {
    return;
  }
  const data = {};
  data.email = $('input[name="createAccountEmail"]').value;
  data.code = code;
  data.type = "verify";
  $("#verifyButton").disabled = true;
  await sendData(data);
  $("#verifyButton").disabled = false;
}
async function sendNewCode() {
  let code = "resend_code";
  const data = {};
  data.email = $('input[name="createAccountEmail"]').value;
  data.code = code;
  data.type = "verify";
  $("#verifyButton").disabled = true;
  await sendData(data);
  $("#verifyButton").disabled = false;
}
async function sendResetEmail() {
  const data = {};
  if (
    toggleHidden(
      "EmptyForgottonEmail",
      $('input[name="forgotPasswordEmail"]').value.length == 0,
    )
  )
    return;
  data.email = $('input[name="forgotPasswordEmail"]').value;
  data.type = "forgotPassword";
  $("#sendResetButton").disabled = true;
  await sendData(data);
  $("#sendResetButton").disabled = false;
}

async function sendData(payload = {}) {
  payload.id = "leechlab_account_webapp_client";

  try {
    const res = await fetch("http://127.0.0.1:3330/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if ("error" in result) {
      const isEmail = $('input[name="signInUsername"]').value.includes("@");
      toggleHidden(
        "IncorrectEmail",
        result.error === "Incorrect username/email." && isEmail,
      );
      toggleHidden(
        "IncorrectUsername",
        result.error === "Incorrect username/email." && !isEmail,
      );
      toggleHidden("IncorrectPassword", result.error === "Incorrect password.");
      toggleHidden(
        "IncorrectForgottenEmail",
        result.error === "Forgot Password: Incorrect email.",
      );
      toggleHidden(
        "AlreadySentForgottenEmail",
        result.error === "Forgot Password: Invalid. Wait 15 minutes.",
      );
      toggleHidden("E:V1", result.error === "E:V1");
      toggleHidden("E:V3", result.error === "E:V3");
      if (result.error === "E:V2") window.location.reload(true);
      if (result.error === "E:V1" || result.error === "E:V3") {
        verifyTextboxes.forEach((box, i) => {
          box.value = "";
        });
        verifyTextboxes[0].focus();
      }
    } else if ("errors" in result) {
      const errors = Object.values(result.errors);

      for (const errorMSG of $$(".accountCreationError")) {
        toggleHidden(errorMSG.id, errors.includes(errorMSG.id));
      }
    } else if ("result" in result) {
      switch (result["result"]) {
        case "VerificationSent":
          showSection("main_verify");
          $("#sentVerifyEmail").textContent = $(
            'input[name = "createAccountEmail"]',
          ).value;
          Array.from($$('input[name="verify"]'))[0].focus();
          break;
        case "NewCodeSend":
          verifyTextboxes.forEach((box, i) => {
            box.value = "";
          });
          verifyTextboxes[0].focus();
          break;
        case "Reset Password Email Sent":
          showSection("resetPasswordSent");
          break;
        case "Successful sign-in":
          document.location.href =
            decodeURIComponent(signingInTo) + "?session=" + result["session"];
          break;
      }
    }
  } catch (err) {
    console.error("Request failed:", err);
  }
}

function toggleHidden(id, reason = true) {
  const el = $(`[id="${id}"]`);
  if (reason) el.classList.remove("hidden");
  else el.classList.add("hidden");
  return !el.classList.contains("hidden");
}
