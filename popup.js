document.addEventListener("DOMContentLoaded", () => {
  const accountList = document.getElementById("accountList");
  const addAccountBtn = document.getElementById("addAccount");
  const removeAccountBtn = document.getElementById("removeAccount");
  const inputRow = document.getElementById("inputRow");
  const nicknameInput = document.getElementById("nicknameInput");
  const saveBtn = document.getElementById("saveAccount");
  const cancelBtn = document.getElementById("cancelAccount");
  const nicknameLabel = document.getElementById("nicknameLabel");
  const errorBox = document.getElementById("errorBox") || document.getElementById("messageBox");

  let deleteMode = false;
  let lastAccounts = [];

  loadAndRender();

  addAccountBtn.addEventListener("click", () => {
    chrome.storage.sync.get({ accounts: [] }, (data) => {
      const next = data.accounts.length + 1;
      const ordinal = getOrdinal(next);
      if (nicknameLabel) {
        nicknameLabel.textContent = `Account nickname for ${ordinal} account`;
      }
      inputRow.classList.remove("hidden");
      nicknameInput.value = "";
      nicknameInput.focus();
    });
  });

  saveBtn.addEventListener("click", () => {
    const raw = nicknameInput.value.trim();
    if (!raw) {
      nicknameInput.focus();
      return;
    }

    // Check for duplicate nicknames
    chrome.storage.sync.get({ accounts: [] }, (data) => {
      const accounts = data.accounts;
      
      // Check if nickname already exists
      if (accounts.some(acc => acc.nickname.toLowerCase() === raw.toLowerCase())) {
        showError("An account with this nickname already exists.");
        return;
      }
      
      const newId = accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 0;
      accounts.push({ nickname: raw, id: newId });
      chrome.storage.sync.set({ accounts }, () => {
        inputRow.classList.add("hidden");
        showSuccess(`Account "${raw}" added successfully!`);
        loadAndRender();
      });
    });
  });

  cancelBtn.addEventListener("click", () => inputRow.classList.add("hidden"));

  nicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });

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
    }
  });

  function loadAndRender() {
    chrome.storage.sync.get({ accounts: [] }, (data) => {
      lastAccounts = data.accounts || [];
      renderAccounts(lastAccounts);
      removeAccountBtn.classList.toggle("hidden", lastAccounts.length === 0);
    });
  }

  function renderAccounts(accounts) {
    accountList.innerHTML = "";
    
    accounts.forEach((acc, index) => {
      const li = document.createElement("li");
      li.className = "account-row";
      
      // Format account number with leading zero
      const accountNumber = String(index + 1).padStart(2, '0');

      if (deleteMode) {
        li.innerHTML = `
          <div class="account-info">
            <span class="account-number">#${accountNumber}</span>
            <span class="nick">${escapeHtml(acc.nickname)}</span>
          </div>
          <div class="row-actions">
            <button class="delete delete-btn" data-id="${acc.id}">Delete</button>
          </div>
        `;
      } else {
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

  function handleDelete(id) {
    chrome.storage.sync.get({ accounts: [] }, (data) => {
      const accountToDelete = data.accounts.find(a => a.id === id);
      const updated = data.accounts.filter(a => a.id !== id);
      chrome.storage.sync.set({ accounts: updated }, () => {
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

  function handleSwitch(id) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) return;

      try {
        const url = new URL(tab.url);
        if (!isAllowedSite(url.hostname)) {
          showError("This Extension only works on Google and YouTube pages.");
          return;
        }

        const newUrl = new URL(url.toString());
        
        // Handle /u/N/ path format (preferred)
        if (/\/u\/\d+(\/|$)/.test(newUrl.pathname)) {
          newUrl.pathname = newUrl.pathname.replace(/\/u\/\d+(?=\/|$)/, `/u/${id}`);
        } else {
          // Add authuser parameter
          newUrl.searchParams.set("authuser", id);
        }

        chrome.tabs.update(tab.id, { url: newUrl.toString() });
        
        // Show success and close popup
        const account = lastAccounts.find(a => a.id === id);
        showSuccess(`Switched to ${account ? account.nickname : `Account #${id}`}`);
        setTimeout(() => window.close(), 1000);
        
      } catch (err) {
        showError("Switch failed: " + (err?.message || err));
      }
    });
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