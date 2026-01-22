document.addEventListener("DOMContentLoaded", () => {
  const accountList = document.getElementById("accountList");
  const addAccountBtn = document.getElementById("addAccount");
  const removeAccountBtn = document.getElementById("removeAccount");
  const inputRow = document.getElementById("inputRow");
  const nicknameInput = document.getElementById("nicknameInput");
  const accountNumberInput = document.getElementById("accountNumberInput");
  const saveBtn = document.getElementById("saveAccount");
  const cancelBtn = document.getElementById("cancelAccount");
  const errorBox = document.getElementById("errorBox") || document.getElementById("messageBox");

  let deleteMode = false;
  let editingId = null;
  let lastAccounts = [];

  loadAndRender();

  // Proactively detect if popup is opened on a GitHub page and show a friendly message.
  // We don't attempt to switch accounts on GitHub — we want to be clear to users.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;
    try {
      const url = new URL(tab.url);
      if (isGitHubSite(url.hostname)) {
        showError("Account switching works only on Google-owned websites.");
      }
    } catch (err) {
      // ignore malformed URL
    }
  });

  addAccountBtn.addEventListener("click", () => {
    editingId = null;
    inputRow.classList.remove("hidden");
    accountNumberInput.value = "";
    nicknameInput.value = "";
    accountNumberInput.focus();
    clearError();
  });

  // Learn/Help/GitHub links
  const learnBtn = document.getElementById("learnBtn");
  const helpLink = document.getElementById("helpLink");
  const githubLink = document.getElementById("githubLink");

  const repoUrl = 'https://github.com/SuryaGoud34/EasySwitch-Google';
  const readmeUrl = repoUrl + '#readme';

  if (learnBtn) learnBtn.addEventListener('click', () => chrome.tabs.create({ url: readmeUrl }));
  if (helpLink) helpLink.addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: readmeUrl }); });
  if (githubLink) githubLink.addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: repoUrl }); });

  saveBtn.addEventListener("click", () => {
    const nickname = nicknameInput.value.trim();
    const accountNumberRaw = accountNumberInput.value.trim();
    // Validate account number
    if (!accountNumberRaw || !/^[1-9]\d*$/.test(accountNumberRaw)) {
      showError("Please enter a valid positive Account Number (1 or higher).");
      accountNumberInput.focus();
      return;
    }
    // Convert user-facing Account Number into zero-based accountIndex used by Google.
    // For example: user enters '1' -> accountIndex = 0 (maps to /u/0)
    //              user enters '2' -> accountIndex = 1 (maps to /u/1)
    const accountIndex = parseInt(accountNumberRaw, 10) - 1;
    if (accountIndex < 0) {
      showError("Account Number must be 1 or higher.");
      accountNumberInput.focus();
      return;
    }
    if (!nickname) {
      showError("Please enter a nickname for this account.");
      nicknameInput.focus();
      return;
    }

    chrome.storage.local.get({ accounts: [] }, (data) => {
      const accounts = data.accounts;
      // Backward compatibility: add accountIndex if missing
      accounts.forEach(acc => {
        if (!acc.hasOwnProperty('accountIndex')) acc.accountIndex = acc.id;
      });

      if (editingId === null) {
        // Adding new account
        if (accounts.some(acc => acc.accountIndex === accountIndex)) {
          showError("An account with this Account Number already exists.");
          return;
        }
        if (accounts.some(acc => acc.nickname.toLowerCase() === nickname.toLowerCase())) {
          showError("An account with this nickname already exists.");
          return;
        }
        const newId = accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 0;
        accounts.push({ nickname, accountIndex, id: newId });
        chrome.storage.local.set({ accounts }, () => {
          inputRow.classList.add("hidden");
          showSuccess(`Account "${nickname}" added successfully!`);
          loadAndRender();
        });
      } else {
        // Editing existing account
        const account = accounts.find(a => a.id === editingId);
        if (!account) {
          showError("Account not found.");
          return;
        }
        if (accounts.some(acc => acc.id !== editingId && acc.accountIndex === accountIndex)) {
          showError("An account with this Account Number already exists.");
          return;
        }
        if (accounts.some(acc => acc.id !== editingId && acc.nickname.toLowerCase() === nickname.toLowerCase())) {
          showError("An account with this nickname already exists.");
          return;
        }
        account.accountIndex = accountIndex;
        account.nickname = nickname;
        chrome.storage.local.set({ accounts }, () => {
          inputRow.classList.add("hidden");
          editingId = null;
          showSuccess("Account updated successfully!");
          loadAndRender();
        });
      }
    });
  });

  cancelBtn.addEventListener("click", () => {
    inputRow.classList.add("hidden");
    editingId = null;
  });

  nicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });
  accountNumberInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") nicknameInput.focus();
    if (e.key === "Escape") cancelBtn.click();
  });

  function clearError() {
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.className = "message hidden";
      errorBox.style.display = "none";
    }
  }

  removeAccountBtn.addEventListener("click", () => {
    deleteMode = !deleteMode;
    renderAccounts(lastAccounts);
    removeAccountBtn.textContent = deleteMode ? "✓ Done" : "Remove Accounts";
  });

  accountList.addEventListener("click", (e) => {
    if (e.target.matches("button.switch") || e.target.matches("button.switch-btn")) {
      handleSwitch(Number(e.target.dataset.id));
    } else if (e.target.matches("button.delete") || e.target.matches("button.delete-btn")) {
      handleDelete(Number(e.target.dataset.id));
    } else if (e.target.matches("button.edit") || e.target.matches("button.edit-btn")) {
      handleEdit(Number(e.target.dataset.id));
    }
  });

  function loadAndRender() {
    chrome.storage.local.get({ accounts: [] }, (data) => {
      lastAccounts = data.accounts || [];
      // Backward compatibility: ensure older accounts (that only had `id`) gain an `accountIndex` property.
      lastAccounts.forEach(acc => {
        if (!acc.hasOwnProperty('accountIndex')) acc.accountIndex = acc.id;
      });

      // Sort accounts by `accountIndex` so UI lists accounts in ascending account number order.
      lastAccounts.sort((a, b) => (a.accountIndex || 0) - (b.accountIndex || 0));

      renderAccounts(lastAccounts);
      removeAccountBtn.classList.toggle("hidden", lastAccounts.length === 0);
    });
  }

  function renderAccounts(accounts) {
    accountList.innerHTML = "";
    
    accounts.forEach((acc, index) => {
      const li = document.createElement("li");
      li.className = "account-row";
      
      // Format account number with leading zero based on accountIndex
      const accountNumber = String((acc.accountIndex || 0) + 1).padStart(2, '0');

      if (deleteMode) {
        // In "remove mode" show both Edit and Delete actions so the user can either
        // fix account details or remove it entirely. This keeps actions consolidated
        // while in management mode.
        li.innerHTML = `
          <div class="account-info">
            <span class="account-number">#${accountNumber}</span>
            <span class="nick">${escapeHtml(acc.nickname)}</span>
          </div>
          <div class="row-actions">
            <button class="edit edit-btn" data-id="${acc.id}">Edit</button>
            <button class="delete delete-btn" data-id="${acc.id}">Delete</button>
          </div>
        `;
      } else {
        // Normal mode: only allow quick switching; keep UI minimal by showing the Switch button.
        li.innerHTML = `
          <div class="account-info">
            <span class="account-number">#${accountNumber}</span>
            <span class="nick">${escapeHtml(acc.nickname)}</span>
          </div>
          <div class="row-actions">
            <button class="switch switch-btn" data-id="${acc.id}">Switch</button>
          </div>
        `;
      }

      accountList.appendChild(li);
    });
  }

  // Delete a single account by its internal id. Only the selected account is removed; other accounts are left unchanged.
  // UI is updated immediately via loadAndRender which re-sorts and re-renders the list.
  function handleDelete(id) {
    chrome.storage.local.get({ accounts: [] }, (data) => {
      const accountToDelete = data.accounts.find(a => a.id === id);
      const updated = data.accounts.filter(a => a.id !== id);
      chrome.storage.local.set({ accounts: updated }, () => {
        if (accountToDelete) {
          showSuccess(`Account "${accountToDelete.nickname}" deleted successfully!`);
        }
        loadAndRender();
        
        // Exit delete mode if no accounts left
        if (updated.length === 0) {
          deleteMode = false;
          removeAccountBtn.textContent = "Remove Accounts";
        }
      });
    });
  }

  // Pre-fill inputs for editing an existing account and toggle the inline input UI.
  // Users may change both the Account Number and Nickname. Validation and uniqueness checks
  // are performed when saving (in the save handler).
  function handleEdit(id) {
    const account = lastAccounts.find(a => a.id === id);
    if (!account) return;
    editingId = id;
    accountNumberInput.value = (account.accountIndex || 0) + 1;
    nicknameInput.value = account.nickname;
    inputRow.classList.remove("hidden");
    accountNumberInput.focus();
    clearError();
  }

  function handleSwitch(id) {
    const account = lastAccounts.find(a => a.id === id);
    if (!account) return;
    const accountIndex = account.accountIndex || 0;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) return;

      try {
        const url = new URL(tab.url);
        if (isGitHubSite(url.hostname)) {
          showError("Account switching works only on Google-owned websites.");
          return;
        }
        if (!isAllowedSite(url.hostname)) {
          showError("This Extension only works on Google and YouTube pages.");
          return;
        }

        const newUrl = new URL(url.toString());
        
        // Handle /u/N/ path format (preferred)
        if (/\/u\/\d+(\/|$)/.test(newUrl.pathname)) {
          newUrl.pathname = newUrl.pathname.replace(/\/u\/\d+(?=\/|$)/, `/u/${accountIndex}`);
        } else {
          // Add authuser parameter
          newUrl.searchParams.set("authuser", accountIndex);
        }

        chrome.tabs.update(tab.id, { url: newUrl.toString() });
        
        // Show success and close popup
        showSuccess(`Switched to ${account.nickname}`);
        setTimeout(() => window.close(), 1000);
        
      } catch (err) {
        showError("Switch failed: " + (err?.message || err));
      }
    });
  }

  // Detect GitHub domains and subdomains. We must avoid attempting Google-account switching on GitHub pages.
  function isGitHubSite(hostname) {
    const githubDomains = ['github.com', 'gist.github.com'];
    return githubDomains.some(d => hostname === d || hostname === `www.${d}` || hostname.endsWith(`.${d}`));
  }

  function isAllowedSite(hostname) {
    const allowedDomains = [
      'google.com',
      'youtube.com',
      'gmail.com',
      'drive.google.com',
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com'
    ];
    
    return allowedDomains.some(domain => 
      hostname === domain || 
      hostname === `www.${domain}` || 
      hostname.endsWith(`.${domain}`)
    );
  }

  function showError(text) {
    showMessage(text, "error");
  }

  function showSuccess(text) {
    showMessage(text, "success");
  }

  function showMessage(text, type = "error") {
    if (!errorBox) return;
    
    errorBox.textContent = text;
    errorBox.className = type === "success" ? "message success" : "error";
    errorBox.style.display = "block";
    
    clearTimeout(errorBox._timeout);
    errorBox._timeout = setTimeout(() => {
      errorBox.style.display = "none";
    }, type === "success" ? 2000 : 3500);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
});
