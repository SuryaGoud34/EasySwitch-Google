# EasySwitch (Google)

**Easily switch between multiple Google and YouTube accounts with custom nicknames.**

##  Features

-  **Quick Account Switching** - Switch between Google accounts in one click
-  **Custom Nicknames** - Give your accounts memorable names (Work Gmail, Personal YouTube, etc.)
-  **Auto-Numbering** - Each account gets a unique number badge (#01, #02, #03...)
-  **Smart URL Handling** - Works with all Google services (Gmail, Drive, Docs, YouTube, etc.)
-  **Privacy First** - No data tracking, everything stored locally
-  **Modern UI** - Clean, dark-themed interface
-  **Lightweight** - Fast and efficient, no bloat

##  Screenshots

![EasySwitch Interface](https://github.com/SuryaGoud34/EasySwitch-Google/blob/main/image.png)

*Clean and intuitive interface*


## Installation


### Installation 
1. **Download or Clone** this repository:
   ```bash
   git clone https://github.com/SuryaGoud34/easyswitch-google.git
   ```

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the downloaded folder
   - The extension icon will appear in your toolbar

##  How to Use

### Setting Up Your Accounts

1. **Click the EasySwitch icon** in your Chrome toolbar
2. **Click "Add Account"** to register your first account
3. **Enter a nickname** when prompted "Account nickname for 1st account" (e.g., "Work Gmail", "Personal YouTube")
4. Your account will appear as **#01 Work Gmail** in the list
5. **Repeat** for all your Google accounts - each new account gets the next number (#02, #03, etc.)

### Switching Accounts

1. **Visit any Google service** (Gmail, YouTube, Drive, etc.)
2. **Click the EasySwitch icon**
3. **Click "Switch"** next to the account you want to use
4. **Done!** You'll be switched to that account instantly

### Managing Accounts

- **Add accounts**: Click the "Add Account" button and enter a nickname
- **Account numbering**: Your first account becomes #01, second becomes #02, and so on
- **Remove accounts**: Click "Remove Mode" then delete unwanted accounts
- **Organized display**: Each account shows with its number badge and custom nickname
- **Edit nicknames**: Delete and re-add with a new nickname (keeps the same number position)

## 🔧 How It Works

EasySwitch uses Google's native account switching mechanism:
- **URL Parameters**: Adds `?authuser=N` to Google URLs
- **Path Modification**: Uses `/u/N/` paths for supported services
- **Smart Detection**: Automatically detects the best switching method

**No passwords or sensitive data are stored** - we only save the nicknames you create!

##  Supported Sites

-  **Gmail** (gmail.com)
-  **Google Drive** (drive.google.com)
-  **Google Docs/Sheets/Slides** (docs.google.com, sheets.google.com, slides.google.com)
-  **YouTube** (youtube.com)
-  **Google Photos** (photos.google.com)
-  **Google Maps** (maps.google.com)
-  **All other Google services**


### Local Development
1. **Clone the repository**
2. **Make your changes**
3. **Load unpacked in Chrome** (see Manual Installation)
4. **Test thoroughly** on different Google services

### Building for Production
1. **Update version** in `manifest.json`
2. **Test all functionality**
3. **Create a ZIP file** of all extension files
4. **Upload to Chrome Web Store**

##  Contributing

We welcome contributions! Here's how you can help:

1. ** Report bugs** by opening an issue
2. ** Suggest features** in the discussions
3. ** Submit pull requests** with improvements
4. ** Improve documentation**

### Development Guidelines
- Follow the existing code style
- Test on multiple Google services
- Ensure compatibility with Manifest V3
- Add comments for complex logic

##  Changelog

### v1.0.0 (Current)
-  Initial release
-  Account switching functionality
-  Custom nickname system
-  Modern dark UI
-  Local storage only

##  FAQ

**Q: Is my data safe?**
A: Yes! EasySwitch only stores account nicknames locally. No passwords, emails, or personal data are collected.

**Q: Why doesn't it work on some sites?**
A: EasySwitch only works on Google-owned websites. It won't work on third-party sites.

**Q: Can I sync my accounts across devices?**
A: Currently, accounts are stored locally per browser. Cross-device sync may be added in future versions.

**Q: How are accounts organized?**
A: Each account gets a unique number badge starting from #01. When you add "Work Gmail" as your first account, it appears as "#01 Work Gmail" in the list.

**Q: What happens to numbering when I delete an account?**
A: The numbers update automatically. If you delete #02, then #03 becomes the new #02 to keep the sequence clean.

**Q: Can I change the order of my accounts?**
A: Currently, accounts are ordered by the sequence you added them. To reorder, you'd need to delete and re-add accounts in your preferred sequence.

**Q: The extension stopped working after a Chrome update**
A: Try reloading the extension or reinstalling it. Report persistent issues on GitHub.

##  Troubleshooting

### Common Issues

**Extension icon not showing:**
- Ensure Chrome Extensions are enabled
- Try reloading the extension
- Check if it's pinned to the toolbar

**Switching not working:**
- Make sure you're on a Google website
- Clear browser cache and cookies
- Try logging out and back in to Google

**Accounts not saving:**
- Check Chrome storage permissions
- Ensure you're not in Incognito mode
- Try restarting Chrome

## Support

-  **Bug reports**: [Open an issue](https://github.com/SuryaGoud34/easyswitch-google/issues)
-  **Feature requests**: [Start a discussion](https://github.com/SuryaGoud34/easyswitch-google/discussions)
-  **Contact**: [surya2k4@gmail.com](mailto:surya2k4@gmail.com)

---

<div align="center">

**⭐ Star this repo if EasySwitch helps you!**

Made with ❤️ by [Surya](https://github.com/SuryaGoud34)


</div>



