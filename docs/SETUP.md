# Kanaku Book — setup guide

Kanaku Book is a phone app that replaces the paper notebook. You tap a
member's name, type the amount, press **Save entry**, and the record lands
in a Google Sheet — with the date, a note, and who logged it.

The Google Sheet **is** the notebook. You can open it any time on a computer
or phone to see every entry, make totals, or print it.

There are four setup steps. You only do this once; after that, everyone just
opens the app on their phone.

1. Create the Google Sheet
2. Add the Apps Script and deploy it as a web app
3. Paste the web app URL into `index.html`
4. Put the app online (GitHub Pages or Netlify) and add it to the phone's home screen

Allow about 20–30 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to **https://sheets.google.com** in your browser (signed in to your Google account).
2. Click the big **+ Blank spreadsheet** button.
3. At the top-left it says *Untitled spreadsheet* — click that and type **Kanaku Book**.

That's it for the sheet itself. The script in the next step will automatically
create three tabs the first time they are needed:

| Tab | What it holds |
|---|---|
| **Users** | Who may log in — `Username` and `Password` columns |
| **Members** | The team member names shown as buttons in the app |
| **Entries** | Every payment: Timestamp, Date, Name, Amount, Note, LoggedBy |

You do **not** need to create these tabs by hand — but after Step 2 you must
add at least one row to **Users**, otherwise nobody can log in (see Step 2.9).

## Step 2 — Add the script and deploy it as a web app

1. In your new sheet, click **Extensions** in the menu bar, then **Apps Script**.
   A new browser tab opens with a code editor.
2. You'll see a file called `Code.gs` with a few lines of starter code.
   **Select all of it and delete it.**
3. Open the `Code.gs` file from this folder on your computer, copy **everything**
   in it, and paste it into the editor.
4. Click the **floppy-disk (Save)** icon at the top, or press Ctrl+S.
5. Click the blue **Deploy** button (top-right) → **New deployment**.
6. Click the **gear icon** next to "Select type" and choose **Web app**. Then set:
   - **Description:** Kanaku Book (anything is fine)
   - **Execute as:** **Me** (your email)
   - **Who has access:** **Anyone**  ← important, otherwise the phones can't reach it
7. Click **Deploy**. Google will ask you to **Authorize access**:
   - Choose your Google account.
   - You may see a scary screen saying *"Google hasn't verified this app"*.
     That's normal — it's **your own script**. Click **Advanced**, then
     **Go to Kanaku Book (unsafe)**, then **Allow**.
8. You now get a **Web app URL** that starts with
   `https://script.google.com/macros/s/...` and ends with `/exec`.
   Click **Copy**. **This URL is the key to everything — keep it handy.**
9. **Add your login users.** Go back to the spreadsheet tab. Paste this into
   your browser's address bar to wake the script up and create the tabs
   (replace with your copied URL):

   ```
   YOUR-WEB-APP-URL?action=getMembers
   ```

   You should see a short line of text with 12 member names. Now, back in the
   spreadsheet, you'll see the new tabs at the bottom. Open the **Users** tab
   and add a row per person under the headers, for example:

   | Username | Password |
   |---|---|
   | appa | choose-a-password |
   | uncle | another-password |

   To add or remove users later, just edit this tab — no code changes needed.
10. Open the **Members** tab and replace the placeholder names
    (Member 1 … Member 12) with your real team members' names.

> **If you ever change `Code.gs` later:** after saving, click **Deploy →
> Manage deployments → pencil icon → Version: New version → Deploy**.
> Just saving is not enough; the live URL serves the deployed version.

## Step 3 — Paste the web app URL into index.html

1. Open `index.html` from this folder in any text editor (Notepad works).
2. Near the top of the `<script>` section find this line:

   ```js
   var SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
   ```

3. Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the URL you copied in Step 2.8,
   keeping the quotes. It should look like:

   ```js
   var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```

4. Save the file.

## Step 4 — Put the app online

The app is just files, so any free static host works. **Netlify Drop is the
easiest** (no account knowledge needed); GitHub Pages is a good alternative.

### Option A: Netlify Drop (easiest — about 2 minutes)

1. Go to **https://app.netlify.com/drop** and sign up free (you can use your Google account).
2. Drag the **whole folder** containing `index.html`, `manifest.json`, `sw.js`,
   `icon.png`, and `icon-192.png` onto the page.
3. In a few seconds you get a link like `https://something-random.netlify.app`.
   You can rename it: **Site settings → Change site name** → e.g.
   `kanaku-book` → your app lives at `https://kanaku-book.netlify.app`.
4. To update the app later, drag the folder onto the site's **Deploys** page again.

### Option B: GitHub Pages

1. Go to **https://github.com** and sign up / sign in.
2. Click **+** (top-right) → **New repository** → name it `kanaku-book` →
   keep it **Public** → **Create repository**.
3. Click **uploading an existing file**, drag in all the files
   (`index.html`, `manifest.json`, `sw.js`, `icon.png`, `icon-192.png`),
   then click **Commit changes**.
4. Go to **Settings → Pages** (left sidebar). Under **Branch**, pick **main**
   and folder **/ (root)**, then **Save**.
5. After a minute your app is at
   `https://YOUR-USERNAME.github.io/kanaku-book/`.

### Put it on the phone's home screen

Send the link to each phone (WhatsApp works well), open it, log in once, then:

- **Android (Chrome):** tap the **⋮ menu → Add to Home screen** (or the
  "Install app" prompt if it appears) → **Add**.
- **iPhone (Safari):** tap the **Share** button (square with arrow) →
  **Add to Home Screen** → **Add**.

The **SM TEX** icon appears on the home screen and opens full-screen like a
real app, with no browser bar.

---

## Daily use

1. Tap the app icon. (It stays logged in until you press **Log out**.)
2. Tap the member's name.
3. Type the amount, optionally a note, change the date if needed.
4. Tap **Save entry** — you'll see a green tick. Done.

The entry is now in the **Entries** tab of the Google Sheet. The
"Recent entries" list in the app shows what was saved **from that phone**;
the sheet is the complete ledger from all phones.

## Everyday admin (all in the Google Sheet, no code)

- **Add/remove a login:** edit the **Users** tab.
- **Rename or remove a member:** edit the **Members** tab, then tap the **⟳**
  button in the app to reload the list. (Members can also be added from the
  app with **+ Add**.)
- **See totals:** in the Entries tab, e.g. `=SUMIF(C:C,"Ravi",D:D)` totals
  everything given to Ravi.

## Good to know

- **Internet is required to save.** Writes are "fire and forget" — the app
  shows the tick immediately and the entry lands in the sheet a moment later.
  If the phone is fully offline when saving, the entry will NOT reach the
  sheet, so make sure there's a signal when saving.
- **Security is "family-grade", not bank-grade.** Passwords are stored as
  plain text in the sheet and checked by the script. That's fine for keeping
  honest people organized, but don't reuse an important password here.
- **Never share the Google Sheet itself** with the team — only you (the sheet
  owner) can see it. The app only lets people add entries, not read or edit
  the ledger.

## Troubleshooting

- **Orange "Setup needed" banner:** the web app URL hasn't been pasted into
  `index.html` (Step 3), or the file wasn't re-uploaded after editing.
- **"No answer from Google" on login:** check the phone's internet; check the
  deployment has **Who has access: Anyone**; check the URL ends in `/exec`.
- **Wrong username or password (but it's right):** check for extra spaces in
  the Users tab; passwords ARE case-sensitive, usernames are not.
- **Changed the code but nothing changed:** you must create a **new version**
  under Deploy → Manage deployments (see note in Step 2), and for `index.html`
  changes re-upload to Netlify/GitHub. Phones may also keep an old cached
  copy for a little while — close and reopen the app.
