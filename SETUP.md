# Playback setup guide

Playback is a personal music and TV/film rating log. It runs in a web browser, keeps your log on your own device, and can optionally sync between devices and connect to other services. **Nothing here is required except Part 1.** Each later part adds one feature, and you can do them in any order, whenever you want them.

## Which parts do I need?

| I want to... | Do these parts | Time | Cost |
|---|---|---|---|
| Rate albums and songs on one device | 1 and 2 | 5 min | Free |
| Use the same log on my phone and computer | 1, 2 and 4 | 25 min | Free |
| Have songs checked off automatically as I play them on Spotify | 1, 2, 4 and 5 | +15 min | Needs Spotify Premium |
| Track TV shows and films | 1, 2 and 6 | +5 min | Free |
| Keep an inventory of my vinyl | 1, 2 and 7 | +5 min | Free |
| Run my own copy of the app (own web address) | 3, then the rest | 10 min | Free |

You never need Apple Music, Spotify or any account to rate music. Apple Music is used behind the scenes to look up artists' albums and tracklists, and it needs no sign-in.

---

## Part 1. Open and install the app

1. Open **https://frostie4life9.github.io/playback/** in your browser. If you made your own copy (Part 3), open your copy's address instead.
2. Install it so it opens like a normal app and works offline:
   - **iPhone or iPad (Safari):** tap the Share button, then **Add to Home Screen**, then **Add**.
   - **Android (Chrome):** tap the three-dot menu, then **Install app** (or **Add to Home screen**).
   - **Windows or Mac (Chrome or Edge):** click the install icon at the right end of the address bar, then **Install**.
3. Open it from your home screen or app list.

> **Where is my data?** Your log is saved inside this browser on this device. Clearing the browser's site data, or deleting the app on iPhone, erases it. Part 3's backup steps and Part 4's sync protect against that. If you only do one extra thing, do Part 3's backup.

---

## Part 2. Add an artist and rate their music

Playback reads an artist's albums and songs from a catalog. By default it uses **Apple Music's public catalog**, which needs no account, no key and no setup.

### Add an artist

1. Go to the **Music** tab and find **Import a discography**. It sits beside the artist list, and on a phone just below it.
2. Type the artist's name and tap **Search**. Playback finds artists on MusicBrainz, a free music database, and lists matches. The top one is tagged **Best match**.
3. Tap the right artist. Check the details shown (country, years active) so you pick the right one when several artists share a name.
4. Optional: tick **Include live albums, remixes and alternate versions** if you want those too. They are left out by default.
5. Tap **Import**. A progress bar shows the steps (finding the artist on Apple Music, reading releases, reading tracklists, sorting out duplicates). A normal artist takes 10 to 30 seconds. A big discography takes about a minute.
6. A green message at the end tells you how many albums, EPs, singles and songs were added. Tap **Got it**.

What the import does for you:
- Albums, EPs, singles and compilations are sorted into their own groups.
- Deluxe, clean and explicit versions of an album are folded into one album. Deluxe-only songs appear in a **Deluxe & bonus tracks** section instead of as separate singles.
- Songs that only feature the artist on someone else's release are left out. Collaborations the artist is credited on are kept.

### Rate things

1. Tap an album, then tap a song.
2. Drag the slider to rate it from 1 to 10 in half-point steps, then tap **Done**.
3. Albums and EPs also get their own overall rating, shown next to the average of your song ratings. Singles do not.
4. Mark a song as heard with its checkmark, or let Spotify do it for you (Part 5).

### Choose where imports come from

Go to **Settings**, then **Import source**:

- **Automatic** (the default): uses Spotify if you have connected it (Part 5), otherwise Apple Music.
- **Apple Music:** always use Apple Music, even if Spotify is connected.
- **MusicBrainz only:** skip the streaming catalogs. Tracklists are less exact and covers can be missing, but nothing depends on Apple or Spotify.

If the first choice has no answer or is temporarily limiting requests, Playback tells you and offers **Use MusicBrainz this time** (and **Use Apple Music this time** when Spotify is the one limiting you). Nothing in your log changes until an import succeeds, and **Undo last import** (under the artist) puts an artist back as it was.

### Good to know about Apple Music imports

- Apple allows roughly 20 lookups a minute from each device. Playback paces itself, so you may see "Apple Music asked for a pause." Just wait, it retries on its own.
- Tracklists are saved on your device, so updating an artist you already imported is much faster.
- Which country's catalog you see follows your phone or computer's region setting (for example English (United States)). Releases that Apple does not sell in your country will be missing.
- Apple lists at most 200 releases for one artist. Very large catalogs can come up short. Importing with **MusicBrainz only** fills the gaps.
- Apple does not provide artist photos. Artists imported only from Apple show an album cover on their tile. Artist photos come from Spotify when it is connected.
- If an artist's name is shared with another artist and the wrong one is picked, set **Import source** to **MusicBrainz only**, rebuild that artist, then set it back. **Undo last import** is there if you change your mind.

---

## Part 3. Back up your log and make your own copy

### Back up (do this once, then now and then)

1. Go to **Settings**.
2. Open **Backup & restore** and tap **Download backup file** (or **Copy backup text**).
3. Keep the file somewhere safe, like your email or a cloud drive. To restore later, tap **Restore from file** and choose it (or paste copied text into the box and tap **Restore from pasted text**). Restoring replaces everything in Playback on that device, and it asks you first.
4. If sync is off, Playback shows a reminder banner when your last backup is more than three weeks old. **Later** hides it for a week.
5. For spreadsheets of your ratings, open **Export ratings** and tap **Albums**, **Songs** or **Shows & films**.

### Make your own copy of the app (optional)

You only need this if you want your own web address, or if you want to change the app. Using the shared address in Part 1 works fine otherwise.

1. Make a free account at **github.com** and sign in.
2. Open **github.com/Frostie4Life9/playback** and click **Fork** (top right), then **Create fork**.
3. In your fork, open **Settings**, then **Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose branch **main** and folder **/ (root)**, then **Save**.
5. Wait a minute or two. Your app is then at **https://YOUR-GITHUB-NAME.github.io/playback/**. Open that and do Part 1 again.

Your copy starts empty. Your data and settings are separate from everyone else's.

---

## Part 4. Sync between devices (optional)

Sync keeps one log shared across your phone and computer and doubles as an online backup. It uses a small program called a **Worker** that runs on Cloudflare's free plan and stores your log. Every person needs their **own** Worker. Never share one: it would mix everyone's ratings together.

You need your own copy of the app on GitHub (Part 3, "Make your own copy") for this route, because the Worker is deployed from the repo.

### A. Make the accounts

1. Make a free account at **cloudflare.com** and sign in. You do not need to add a domain.

### B. Create the storage

1. In the Cloudflare dashboard, open **Storage & databases**, then **KV** (the sidebar may say **Workers KV**).
2. Click **Create** (or **Create a namespace**), name it **playback**, and save.
3. Find the new namespace in the list and **copy its ID** (a long string of letters and numbers).

### C. Point your copy of the app at your storage

1. On GitHub, open your fork and click the file **wrangler.jsonc**.
2. Click the pencil icon (Edit).
3. Find the line with `"id": "123626e20f3e4780ba3064ff22077e7e"` and replace the long string between the quotes with the ID you copied in step B. This line belongs to the original owner's storage and will not work for you.
4. Click **Commit changes**, then **Commit changes** again.

### D. Deploy the Worker from GitHub

1. In Cloudflare, open **Workers & Pages** and click **Create application**.
2. Choose **Import a repository** (or **Connect to Git**) and connect your GitHub account. When asked, allow access to your **playback** fork only.
3. Select your **playback** fork. Keep the project name **playback-sync**. Leave the other settings as they are and click **Deploy**.
4. Wait for the deploy to finish. Cloudflare shows your Worker's address, which looks like `https://playback-sync.YOUR-NAME.workers.dev`. Copy it.

Cloudflare's screens change from time to time, so button labels may differ a little. The goal is the same: a Worker named playback-sync, built from your fork, with a workers.dev address.

### E. Set your secret password

1. Open your **playback-sync** Worker, then **Settings**, then **Variables and Secrets**.
2. Click **Add**. Set **Type** to **Secret**, **Name** to `SECRET` (capital letters), and **Value** to a long random string you make up (40 or more characters of mixed letters and numbers). **Save this string somewhere safe**, because you need it for every device.
3. Click **Deploy** if it asks you to.

### F. Check the Worker

Open the Worker's address in a browser. You should see `{"error":"unauthorized"}`. That means it is running and locked. If you see anything else, such as an error page, recheck steps C to E.

### G. Connect the app

1. In Playback, open **Settings**, then **Sync**.
2. Paste the Worker's address into **Worker URL**, and the secret from step E into **Sync key**.
3. Tap **Save and sync**. The status line should say it is synced.
4. On each other device, install the app (Part 1), then repeat step G with the same two values. The log comes down from the Worker.

### Updating later

When the original app gets new features, open your fork on GitHub, click **Sync fork**, then **Update branch**. Your web page and your Worker both update automatically. Your secret and storage stay as they are.

---

## Part 5. Spotify: check off songs as you play them (optional)

This needs **a Worker from Part 4** and **a Spotify Premium account**. Spotify limits free apps like this one, and the app's own error message says to confirm Premium is active.

### A. Make a Spotify app

Do this on a computer.

1. Go to **developer.spotify.com/dashboard** and log in with your Spotify account.
2. Click **Create app**.
3. For **App name** and **Description**, write anything (for example Playback).
4. Under **Redirect URIs**, add your app's address exactly. In Playback, open **Settings** and the **Spotify** card: the exact address is shown there with a **Copy** button. It looks like `https://YOUR-GITHUB-NAME.github.io/playback/`, including the final slash. A single wrong character makes sign-in fail.
5. Tick **Web API**, agree to the terms and click **Save**.
6. Open the app's **Settings** and copy the **Client ID**.
7. Still in the app's settings, open **User Management** and add the name and email of your Spotify account if it is not already listed.

### B. Connect it

1. In Playback, open **Settings**, then the **Spotify** card.
2. Paste the Client ID and tap **Save Client ID**, then tap **Connect Spotify**.
3. Sign in on Spotify's page and tap **Agree**. You return to Playback.
4. Play a few songs on Spotify. After a minute or two, open Playback. Songs you played that match your imported albums are checked off, and the Spotify card lists what it matched.

### C. Make it keep checking while the app is closed

The Worker checks Spotify every hour. Your `wrangler.jsonc` already contains that schedule, so there is nothing to set up. Spotify only keeps your last 50 plays, so the hourly check is what catches everything.

### Good to know

- Once Spotify is connected, **Automatic** imports use Spotify's catalog instead of Apple Music.
- Spotify counts every app on your developer account against one shared daily limit. If an import stops with a quota message, tap **Use Apple Music this time**, or wait and try again later.

---

## Part 6. TV shows and films (optional)

1. Go to **themoviedb.org** and make a free account.
2. Open **themoviedb.org/settings/api** and request an API key. Choose **Developer** and personal use. Fill in the short form (any honest description works).
3. Copy the **API Read Access Token** (the shorter API key also works).
4. In Playback, open the **Screen** tab, paste the token where it asks for a TMDB key, and tap **Save key**.
5. Search a show or film and add it. Playback fills in seasons and episodes, and shows where it streams in your country.

---

## Part 7. Vinyl collection (optional)

The **Collection** tab keeps an inventory of records you own, one entry per physical copy. You can add records by hand with no setup. To look up the exact pressing on Discogs:

1. Make a free account at **discogs.com**.
2. Go to **Settings**, then **Developers**, and click **Generate new token**. Copy it.
3. In Playback, open the **Collection** tab, find **Discogs token**, paste the token and save it. It is stored on your device only.
4. Search an album under **Find a pressing** and pick the pressing you own.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| "Apple Music asked for a pause" | Apple limits lookups to about 20 a minute. Wait and it retries on its own. Cancel and try again in a few minutes if it keeps failing. |
| "Could not find (artist) on Apple Music, so this came from MusicBrainz" | Apple has no artist with exactly that name. The import still worked from MusicBrainz. |
| Wrong artist picked, or the wrong albums | Set Import source to **MusicBrainz only**, rebuild that artist, then set it back. Use **Undo last import** to go back. |
| An album or release is missing | Apple does not sell it in your country, or it is a live, remix or alternate release. Re-import with **Include live albums, remixes and alternate versions** ticked, or try **MusicBrainz only**. |
| Worker address shows an error page instead of `{"error":"unauthorized"}` | Recheck Part 4 steps C to E. The KV ID and the `SECRET` name are the usual mistakes. |
| "The sync key does not match the SECRET on your Worker" | Paste the secret again in **Settings**, **Sync**. It is case-sensitive and must be identical on every device. |
| Spotify says the Client ID or redirect is wrong | The Redirect URI on the Spotify dashboard must match the address shown in Playback's Spotify card exactly, including the final slash. |
| Spotify says it is out of quota | Wait, or use **Use Apple Music this time** for imports. Spotify's limit is shared across all of your developer apps. |
| My ratings are gone | Check **Settings**, **Backup & restore** for a saved backup. If sync was on, open **Sync** and tap **Check for newer**. |
