# Where is My Setup.exe File?

After running `npm run electron:build:win`, your Windows installer will be here:

## 📍 Location

```
tabledadrian2.0/
└── dist/
    ├── Table d'Adrian Wellness Setup x.x.x.exe    ← Full installer
    └── Table d'Adrian Wellness-x.x.x-portable.exe  ← Portable version
```

## 🎯 Exact Path

**Full path from project root:**
```
tabledadrian2.0/dist/Table d'Adrian Wellness Setup x.x.x.exe
```

## 📦 What You'll Find in `dist/` Folder

After building, the `dist/` folder contains:

1. **Setup Installer** (Recommended for distribution)
   - Name: `Table d'Adrian Wellness Setup x.x.x.exe`
   - Size: ~150-200 MB
   - Type: NSIS installer
   - Use: Full installation with setup wizard

2. **Portable Version** (No installation needed)
   - Name: `Table d'Adrian Wellness-x.x.x-portable.exe`
   - Size: ~150-200 MB
   - Type: Portable executable
   - Use: Run directly, no installation

3. **Other Files** (if any)
   - Unpacked files
   - Build logs
   - Cache files

## 🚀 Quick Steps

1. **Build the app:**
   ```bash
   npm run electron:build:win
   ```

2. **Find your .exe:**
   ```bash
   # Windows
   cd dist
   dir *.exe
   
   # Or just open the dist folder in File Explorer
   ```

3. **Distribute:**
   - Upload `Table d'Adrian Wellness Setup x.x.x.exe` to your website
   - Or share via GitHub Releases
   - Or distribute via USB/email

## 📂 Folder Structure

```
tabledadrian2.0/
├── dist/                          ← YOUR .EXE IS HERE!
│   ├── Table d'Adrian Wellness Setup 1.0.0.exe
│   └── Table d'Adrian Wellness-1.0.0-portable.exe
├── electron/
├── public/
└── ...
```

## 💡 Tips

- **The `dist/` folder is created automatically** when you build
- **If `dist/` doesn't exist**, the build will create it
- **You can delete `dist/` folder** and rebuild anytime
- **The .exe file name** includes the version from `package.json`

## 🔍 If You Can't Find It

1. **Check if build completed:**
   - Look for "Packaging" messages in terminal
   - Should see "Building..." then "Packaging..."

2. **Check dist folder exists:**
   ```bash
   ls dist/    # Mac/Linux
   dir dist\   # Windows
   ```

3. **Rebuild:**
   ```bash
   rm -rf dist
   npm run electron:build:win
   ```

4. **Check build logs:**
   - Look at terminal output for errors
   - Check for "dist" folder creation message

## 📝 Example Output

When build completes, you'll see:
```
✔ Building and packaging application
  • building       target=nsis arch=x64 file=dist\Table d'Adrian Wellness Setup 1.0.0.exe
  • building       target=portable arch=x64 file=dist\Table d'Adrian Wellness-1.0.0-portable.exe
✔ Building and packaging application — completed
```

Then your files are in `dist/` folder!

---

**TL;DR:** Your setup.exe is in the **`dist/`** folder after building! 🎉

