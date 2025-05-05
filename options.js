// options.js

document.addEventListener("DOMContentLoaded", () => {
  const defaultBlacklist = "!@#$%^&*()_+=~`{}[]|\\:\"'<>,.?/";
  const defaultWhitelist = "-_.";
  const modeWhitelistRadio = document.getElementById("modeWhitelist");
  const modeBlacklistRadio = document.getElementById("modeBlacklist");
  const blacklistInput     = document.getElementById("blacklist");
  const whitelistInput     = document.getElementById("whitelist");
  const saveBtn            = document.getElementById("save");
  const resetBtn           = document.getElementById("reset");

  // Enable/disable inputs based on mode
  function updateFieldStates(mode) {
    if (mode === "blacklist") {
      blacklistInput.disabled = false;
      whitelistInput.disabled = true;
    } else {
      blacklistInput.disabled = true;
      whitelistInput.disabled = false;
    }
  }

  // Read current form values
  function readForm() {
    return {
      mode: document.querySelector('input[name="mode"]:checked').value,
      blacklist: blacklistInput.value,
      whitelist: whitelistInput.value,
    };
  }

  // Track the last-saved state
  let initial = {};

  // Check if form has been modified since initial load/save
  function isDirty() {
    const current = readForm();
    return (
      current.mode      !== initial.mode ||
      current.blacklist !== initial.blacklist ||
      current.whitelist !== initial.whitelist
    );
  }

  // Update Save button state and styling
  function updateSaveState() {
    if (isDirty()) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
      saveBtn.style.backgroundColor = "#4CAF50";  // green
      saveBtn.style.color = "#fff";
    } else {
      saveBtn.disabled = true;
      saveBtn.textContent = "Save";
      saveBtn.style.backgroundColor = "";
      saveBtn.style.color = "";
    }
  }

  // Load settings from storage
  browser.storage.local
    .get(["mode", "blacklist", "whitelist"])
    .then((res) => {
      const mode      = res.mode === "blacklist" ? "blacklist" : "whitelist";
      const blacklist = res.blacklist ?? defaultBlacklist;
      const whitelist = res.whitelist ?? defaultWhitelist;

      // Populate form
      modeWhitelistRadio.checked = (mode === "whitelist");
      modeBlacklistRadio.checked = (mode === "blacklist");
      blacklistInput.value = blacklist;
      whitelistInput.value = whitelist;
      updateFieldStates(mode);

      // Snapshot clean state
      initial = readForm();
      updateSaveState();
    });

  // Listen for changes to mark form dirty
  [modeWhitelistRadio, modeBlacklistRadio].forEach((radio) =>
    radio.addEventListener("change", () => {
      updateFieldStates(readForm().mode);
      updateSaveState();
    })
  );
  [blacklistInput, whitelistInput].forEach((input) =>
    input.addEventListener("input", updateSaveState)
  );

  // Save handler
  saveBtn.addEventListener("click", () => {
    const form = readForm();
    browser.storage.local
      .set({
        mode: form.mode,
        blacklist: form.blacklist,
        whitelist: form.whitelist,
      })
      .then(() => {
        // Reset baseline after save
        initial = readForm();
        updateSaveState();
      });
  });

  // Reset to defaults handler
  resetBtn.addEventListener("click", () => {
    modeWhitelistRadio.checked = true;
    blacklistInput.value = defaultBlacklist;
    whitelistInput.value = defaultWhitelist;
    updateFieldStates("whitelist");
    initial = readForm();
    updateSaveState();

    browser.storage.local.set({
      mode:      "whitelist",
      blacklist: defaultBlacklist,
      whitelist: defaultWhitelist,
    });
  });
});
