# Playback changelog (older builds)

The newest builds live in the `CHANGELOG` array at the top of `index.html` (the live site reads its first entry as the build id). When that array grows past about 25 entries, the oldest move here, newest first, unchanged in wording.

## 2026.11.26-b

NO MORE POP-IN IN THE LIBRARY (from your screen recording): opening All artists on a phone showed the headers with empty space under them for about half a second, then every sleeve popped in at once. The sleeves’ rise-in was starting while the phone was still decoding their pictures, so it was already over by the time anything could be shown. Now the sleeves on screen wait, hidden, until their pictures are ready (never more than about half a second), then rise in one after another from the start. Also: the splatter-record painting added in -a now only happens when the phone is truly idle (it could land in the middle of the rise-in), and a background date lookup no longer saves your whole log during the animation.

## 2026.11.26-a

SMOOTHER ARTIST ↔ LIBRARY ON A PHONE: switching between an artist and All artists does a lot less work now. The biggest fix: one style rule (the one that dims the other eras when an album is open) made the phone restyle the entire page 4 or 5 times on every switch, including twice while the record was flying back into its sleeve. That is gone. Also: comparing names (for the Listen list number in the top bar) no longer builds a throwaway page element thousands of times per redraw; the library and the artist header each measure the page once instead of two or three times; the artist page under the library is cleared in one step after the record lands, not in two steps mid-flight; opening an artist no longer builds the artist menu twice; and splatter records are painted ahead of time while the library is idle (or the moment your finger touches a sleeve). On a phone-speed test the longest freeze per switch dropped by about a quarter and the stutter during the animations by about a third. Nothing looks different.

## 2026.11.24-g

FROM YOUR LAG REPORT: on your iPhone, going to the library had one long freeze about half a second in, when the artist page underneath was being put to sleep. That step is gone (the page is simply cleared a little later, once the library has settled). Opening an artist also skips two of its extra full-page redraws: Fans also spin fills in its own box instead of redrawing everything.

## 2026.11.24-f

LAG TRACE: every tap now quietly times itself for 3 seconds (how long the screen froze, and which of Playback’s drawing steps ran and for how long). The last 12 ride along with Report a bug, so right after something feels laggy, Settings → Help & feedback → Report a bug sends the numbers behind it. Nothing is kept once the app closes.

## 2026.11.24-e

COVERS AND PHOTOS WORK OFFLINE: album covers and artist photos you have already seen are now saved on the device (up to about 1,200 of them, the oldest dropped first), so with no connection, say on a plane, the library, artist pages and open albums still show their art instead of blank sleeves. Rating, reviews and listens already worked offline and sync when you are back online. Art you have not looked at yet is not saved, so open the albums you want before you go.

## 2026.11.24-d

SNAPPIER LIBRARY ON A PHONE: tapping All artists starts the library about twice as fast. It no longer rebuilds the artist page underneath before fading in, and it no longer measures the page dozens of times over. Coming back to the library, the tile photos you just saw are already there instead of popping in one by one. The bottom bar no longer disappears behind the library for the first second or so.

## 2026.11.24-c

SOFT AGAIN: on phones the colors behind the library and the other pages showed as hard-edged circles. They are soft color pools again, as on a computer.

## 2026.11.24-b

PHONE CHECK-UP: Playback on a phone uses much less graphics memory, which is what makes iPhone Safari reload a page on its own (it looks like a crash, and the app can’t catch or report it). The soft color backgrounds behind Library, Stats, History, Settings and Account are drawn as gradients instead of a heavy blur the phone redrew every frame; the artist colors move as three layers instead of six (they still drift and wobble); they hold still while an album is open over them or the library covers them; buttons on frosted cards no longer blur a second time; and History only draws the months on screen. Fixes: the Listen number on the open album’s record no longer sits on top of the word Listen; a long “also known as” line under an artist name (Daniel Caesar) no longer runs off both sides of the screen; the Sign in button is white and readable on the dark pages; segmented rows (Import source, History filters, Stats periods) stay one row and slide instead of wrapping; the song rater’s buttons fit one line (“Leave out of avg”); and record photos from Cover Art Archive in Collection load again (they came as http links the page blocks).

## 2026.11.24-a

SCREEN IS NOW THE SHELF (still owner only). Films are a home-video shelf, and every film has a disc with one lit ring per watch. HOME: the player shows your last watch (or Tonight’s pick, a random film from your list that favors your services), with its score, rewatch change and shelf card. Face-out shows your top five (pin your own from a case) with a handwritten shelf card. Up next is your list, with what’s on your services first, plus Return by stickers for films you said are leaving soon. New this week shows your latest watches, with a ticket stub on theater trips. The shelf has every watched film as a spine, split by score bookends, with a spine number (the order you first watched it), a notch per watch, a stub peeking out for theater watches and a gold band if you own the disc. Sort it by score, No., director, decade or year watched, filter it (owned, theater, rewatched, unrated), or search it. OPENING A FILM: the case comes off the shelf, turns to face you, swings open, and the disc drops into the player and spins up as its rings light one by one. Back to the shelf sends the disc home into its spine. THE CASE: the liner notes (ticket stubs in the pocket, rank among everything you’ve rated, time spent with it, rank among the director’s films, the shelf card, owned on 4K/Blu-ray/DVD, where to watch with your services marked, cast, and If you liked this with + list), this watch (day, home or theater, service or format, review), Moments (timestamped scenes that spark on that watch’s ring at the point in the film they happen), friends’ ratings, and the player (rate in half steps, flip between watches, Rewatch, a ring legend with the change from the last watch). The latest rated watch sets the film’s score, so accounts, friends, Stats and exports work as before; films you had already rated got a first watch from their rating. BOX SETS: a show is a slipcase, each season a disc whose edge lights one mark per rated episode; rate the show, seasons and episodes, check episodes off, and read episode descriptions. PEOPLE: directors from TMDB credits with how much of their work you’ve seen; each opens a filmography timeline lit by what you’ve seen, with + Add to list. DIARY: every watch by month (theater watches as ticket stubs). STATS: films, watches, hours, average, theater trips, by month or year, your score spread, genres, decades, where you watch, top directors and most rewatched. Add with Search or + Log a watch (TMDB, or by hand), and set My services. On a phone the case is three swipeable pages (Disc, Liner notes, This watch). Screen now loads its own file the first time you open it, so Music stays as light as before.

## 2026.11.23-m

CENTERED: the Choose a Spotify or Apple export button on Stats (and any other file-picker button) has its text centered in the pill again; it sat at the top-left.

## 2026.11.23-l

FIXES FROM YOUR INBOX: the Importing box (when you add an artist) is now dark glass like the rest of the page instead of a white card whose white text you couldn’t read, and its bar glides instead of redrawing each step. Opening an artist from the library is lighter: the fading copy of the library only carries the sleeves on screen, sleeves off screen skip their entrance, and the artist page under the library is set aside quietly once it is covered. The record no longer flies past the turntable when an artist opens (the turntable was still sliding into place while the record aimed at it). Check now in the Listen list no longer redraws the whole list for every artist it checks; just its button and count change. The Open artist button in the library preview is gone (clicking the tile already opens them). New: a Play button in a song’s rating bar starts that exact song on Spotify, inside its album. Errors from a browser’s built-in crypto wallet (Brave on iPhone) are no longer reported as Playback crashes.

## 2026.11.23-k

A NEW WELCOME SCREEN: a brand-new log no longer opens on the old grey layout (an empty Artists list on the left, a white Start your log card on the right). It now opens on the library page itself, in the dusk and orchid of the app icon: Artists with a blank record on the left (every artist you add becomes a slice of it), Start your log on the right with Search for an artist and How Playback works, and a Start here row underneath on the same timeline your artists will fill (1 Add an artist, 2 Rate the songs, 3 Rate the album). It all rises in when the app opens, and Search for an artist opens the glass Add an artist sheet. On a phone it stacks. The first-run tour card is now dark glass with white buttons to match.

## 2026.11.23-j

ARTIST ART CLEANUP: the fan-art collecting (fanart.tv, TheAudioDB, Deezer) and the Spotify banner helper are removed. Nothing used them automatically anymore, and the collecting still cost sync-Worker calls every time an artist was opened. What stays: each artist’s official Apple and Spotify photos, shared out so the tile, the artist page and the library preview beside the wall don’t show the same one. Details is back to just Spotify / Apple Music.

## 2026.11.23-i

APP BAR COLOR: Playback’s color in the app bar at the top (and in your other apps’ bars) is now orchid to match the new icon, instead of the old teal, and the bar shows the new icon.

## 2026.11.23-h

NEW APP ICON: Playback has a new icon. A black record on a dusk background, its grooves lit one song at a time from the outer edge in, the way you rate an album, with the last few still dark. A spark sits on the newest lit groove, and the cream label holds a play button inside a 10-segment rating ring. It is used for the home screen, installed app, tab icon and the suite bar. Phones may keep showing the old icon until Playback is removed and added to the home screen again.

## 2026.11.23-g

SPOTIFY BANNERS: the wide banner on an artist’s Spotify page (their own, kept current, 1920 x 1080) can now fill the artist page header on wide screens. Spotify doesn’t hand it out, so it comes from the new Playback Spotify banner helper: install it in Tampermonkey from frostie4life9.github.io/playback/spotify-banner.user.js, then open any artist on open.spotify.com and the next time Playback is open it picks the banner up. With a banner in the header, the library preview and tile get the Apple and Spotify photos, so all three are different. Banner / Spotify / Apple Music in Details switches it per artist; very thin banners are skipped.

## 2026.11.23-f

OFFICIAL PHOTOS ONLY, NO ALBUMS: background art from fan sites is no longer picked automatically (much of it was years old, and some was drawn fan art); it is still there under Art / Next in Details if you want one. Album covers no longer stand in for artist photos anywhere. Each artist’s Apple and Spotify photos are shared out so places on the same screen never match: the artist page uses Apple’s, the tile Spotify’s, the library preview never repeats the tile beside it, and Stats avoids the artist page photo.

## 2026.11.23-e

ARTIST TILES ARE PHOTOS AGAIN: the last version gave tiles an album when the artist’s other photos were used elsewhere, which made the wall look like albums. Tiles now pick a photo right after the artist page header and always show a photo when the artist has one (an album only when there is none). The library preview and Stats are the places that fall back to albums.

## 2026.11.23-d

A DIFFERENT PICTURE IN EACH PLACE: an artist no longer shows the same photo on their tile, the artist page, the library preview (Last opened) and Stats. Each place gets its own picture from Apple, Spotify, fanart.tv, TheAudioDB and Deezer, only if it is sharp enough for that size, with copies of the same photo across sites counted once. When there is no other good photo, a place shows the artist’s albums instead (the preview and Stats take the albums after the one on the tile), so nothing gets softer. Extra photos are collected the first time you open an artist, so artists you open get more variety.

## 2026.11.23-c

ART SHARPNESS: some background art is only 1280 pixels wide and looked soft stretched across a wide header (Daniel Caesar). Backgrounds narrower than 1600 pixels are no longer picked automatically (the Art and next buttons in Details still show them), so the header keeps Apple’s sharper photo unless a sharp background is found. Artists are scored again the next time their page opens.

## 2026.11.23-b

MORE ARTIST ART, FIT CHECK LOOSENED: the first version only accepted a background when the artist sat well to the right, but the header only fades the far left, so a centered artist looks fine and most good backgrounds were being skipped. Artists already opened are scored again the next time their page opens. In Details, the Art button and the 1/N button show how many backgrounds an artist has.

## 2026.11.23-a

MORE ARTIST ART: so the same photo doesn’t show everywhere, Playback now collects extra pictures for each artist from fanart.tv, TheAudioDB and Deezer and picks them itself the first time you open their page. On wide screens the header uses the best wide background (scored on where the artist sits, since the left side fades into the colors, and on fanart.tv likes; duplicates across sites are skipped). If none fits, the Apple or Spotify photo stays. Stats gets a different photo from the library where there is one. To change it, open Details: Art turns background art on, the 1/4 button flips to the next one, and Spotify or Apple Music turns it off for that artist. Phones keep the Apple/Spotify photo. Each artist is checked again every 60 days.

## 2026.11.22-q

SUGGEST A CHANGE: press Alt+S on any page (or Settings, Help & feedback, Suggest a change) and jot down something you want changed while it is in front of you. Point at it picks the exact thing you mean: the sheet steps aside, whatever is under your pointer gets an outline, and a tap picks it without pressing it. The suggestion saves the page, artist and open album with it, plus what you pointed at (its text, where it sits and how it looks), so it makes sense later. The same sheet switches to Report a bug, which now also opens with Alt+B (Ctrl+Shift+B still works). Ctrl+Enter sends. Your inbox in Owner tools is now Bugs & suggestions, with a filter for each.

## 2026.11.22-p

REPORT A BUG: a new Report a bug button in Settings, Help & feedback (or Ctrl+Shift+B on a computer, from any page) opens a sheet over the page you are on. Describe what went wrong and the report also carries what Playback was doing: the last taps, any errors, failed network calls, the build and whether this device is running an older cached copy, the device and screen, lite mode, the page and the app state. Never your ratings, sync key or sign-in. The crash card now sends that same full report (and shows for the owner too). Reports land in Owner tools, Bug reports, where each can be copied or marked done; they are kept on the Worker in D1, so they do not use up the daily KV writes.

## 2026.11.22-o

STREAMING DATE FIXED AND ON THE TOP LINE: the streaming note vanished after the app restarted, because the start-up tidy rebuilds every imported artist’s albums and dropped it (it also reset the monthly MusicBrainz check, so each artist page would have asked again every visit). Now the rebuild keeps it, a copy is saved with the original date so it can always be restored, and notes already lost come back from Apple Music the next time you open that artist. The note sits at the end of the open album’s top line with a gap instead of dots: Studio album 2020   Streaming Jan 17, 2025. Singles too.

## 2026.11.22-n

STREAMING DATE ON THE TOP LINE: the streaming date of a record that came out earlier now sits at the end of the open album’s top line, like Studio album · 2020 · Streaming Jan 17, 2025, instead of on a line of its own. Tap it to change the original date, same as before. Singles show it the same way.

## 2026.11.22-m

ORIGINAL RELEASE DATES: a record that reached streaming years after it first came out now sits in the year it was born. Spotify and Apple only know their own date, so Mac Miller’s Faces (a free mixtape in May 2014, on streaming October 2021) landed after his death on the timeline. Playback now asks MusicBrainz, which keeps every edition of a record together with its first release date, and moves a release back when MusicBrainz has it in an earlier year under the same title (remaster, anniversary and deluxe tags ignored; singles only match singles; live albums and compilations never count). The timeline, Eras and oldest/newest sorting all follow the original date, and the open album shows the streaming date at the end of its top line (Studio album · 2020 · Streaming Oct 15, 2021). Tap it, or More → Set original release date, to type your own date, or clear it to go back to the streaming date; a date you set is never changed again. Each artist page checks itself once a month (and right after an import), and Settings → Your data → Original release dates checks every artist at once and lists what moved. It costs no Worker or Spotify calls.

## 2026.11.22-l

PICKED RECORDINGS STAY THEIR OWN: a release you add by search for a composer keeps its own songs even when an imported work has the same title, and Check for new releases never folds them into the imported ones or merges a picked album into an imported one with the same name. Song and album counts in the search say 1 song, not 1 songs.

## 2026.11.22-k

ADD A RELEASE BY SEARCH: the Add a release sleeve at the end of an artist’s Releases now starts with a search. Type a song, album or performer (like Clair de lune, or Martin Jones) and Playback asks Spotify (or Apple Music, if that is where your imports come from) for that artist’s matching songs and albums, with cover, performer and year. Add song brings in that exact recording as a single; Add its album or Add album brings in the whole album, keeping only that artist’s songs when an album mixes composers. It costs one or two calls, made for composers and other huge catalogs you can’t import whole. Releases added this way stay when you Check for new releases, for a composer each picked recording keeps its own songs (so you can rate Martin Jones’s Clair de lune apart from the one in Suite bergamasque), for anyone else a song already on the page is skipped, and the new release opens right away. Your plays of that exact recording count on it. Adding by hand is still there under Or add one by hand.

## 2026.11.22-j

A COMPOSER’S PLAYS COUNT ON ANY RECORDING: plays of a composer are now matched by the piece, not the exact track title. Spotify calls your most played Debussy track “Clair de Lune, L. 32”, while Debussy’s page has Clair de lune inside Suite bergamasque, so its 174 plays never reached it. Now any recording of Clair de lune counts on that song (and any Des pas sur la neige on the Préludes, and so on), so you can rate it and it shows its plays. Updating an artist who was imported before composers were handled (the 3-album Apple version of Debussy) now spots that he is a composer too and rebuilds him by work.

## 2026.11.22-i

COMPOSERS IMPORT PROPERLY: adding a classical composer like Claude Debussy used to break. Spotify lists him on thousands of releases (every pianist’s Clair de lune), so the import ran out of Spotify’s allowance, and Apple Music only found 3 albums because it credits the performers. Now a composer comes in by WORK: Playback reads his most played recordings, groups them into the pieces they belong to, and brings each piece in once from its most played recording. Suites and sets (Suite bergamasque, La mer, the Préludes) come in whole with their movements and get an album rating; single pieces (Rêverie, Syrinx) come in as singles. A lone Clair de lune folds into Suite bergamasque instead of showing twice, and pieces he only orchestrated (Satie’s Gymnopédies) stay out. The performer shows as “with”, and the dates are the recording’s. This takes about 30 to 50 Spotify calls instead of thousands, and composers are spotted from MusicBrainz (“French composer”) or from Spotify listing more than 400 releases. Check for new releases on a composer reads him the same way.

## 2026.11.22-h

REDESIGN POLISH. Scoring habits on your page now says how much your albums beat (or trail) their songs on average. On phones, the Stats top 3 sit side by side as a small podium instead of stacking, and the song rows have more room for titles. History’s month column is a little wider, so long month names like September no longer push the timeline sideways.

## 2026.11.22-g

ACCOUNT PAGES REDESIGN (yours and friends’). The page colors now come from your account color mixed with your top-rated albums (a friend’s page uses theirs). The big bead record is the hero beside your name, a stats line, your friend code chip, whether friends can see your page, and Share my page; tapping a bead still pops that album out. The tabs are glass pills (Overview, Albums, Shows & films, Settings). OVERVIEW: a row of big numbers; TOP SHELF, your 5 highest with records peeking out (same tie-break ranking as everywhere); the SCORE SPECTRUM (tap a score to see those albums); ALBUMS RATED PER MONTH where each block is one album in its own color; and the Year in review, Scoring habits and Top artists cards. Albums and Settings keep everything they had, in the new look. A FRIEND’S PAGE adds two overlapping records with your taste match, WHERE YOU SPLIT and WHERE YOU AGREE, and WHAT THEY LOVE THAT YOU HAVEN’T HEARD, with one tap to add it to your Listen list (it remembers it came from their page).

## 2026.11.22-f

FRIENDS SHEET REDESIGN. Friends is now a glass drawer on the right over whatever page you’re on (a full-height sheet on a phone), with your friends’ faces at the top. ACTIVITY: requests sit at the top with Accept and Decline, then what friends rated grouped Today / Yesterday / This week, each one a sleeve with the friend’s face on it, their rating pill, review snippets, and NEW: the gap to your own score ("you 8.5 +1"). FRIENDS: each friend is a sleeve in their account color with a record whose lit groove is your taste match (once you’ve opened their page), the last album they rated tucked in the corner, sorted by best match or A to Z. Friends who aren’t sharing are dimmed. ADD: your friend code as a ticket with Copy and Share, three short steps, the code box, and the requests waiting for them.

## 2026.11.22-e

LISTEN LIST AS THE CRATE. The Listen list is now a wide sheet that rises from the bottom (full screen on a phone) in the colors of the album at the front. UP NEXT is that album, big, with its record pulled out and spinning slowly, its grooves lit for the songs you’ve heard, when you added it and where it came from, friends’ scores when they’ve rated it, a segment bar of songs heard, Play (it tells you which song is next), Open album, Move to back and Remove. The rest stand in the crate as sleeves with their records peeking out; they lift on hover, show a progress bar, and say when they were added, where they came from, or that they’re not in your log yet. Add an album from the bar at the top. Fresh pressings are the new releases with a date stamp (white for ones not out yet), with Add, Artist, Dismiss, Check now and the daily-checks switch. Heard sits last with checkmarks and Clear.

## 2026.11.22-d

STATS REDESIGN. Stats now takes its colors from your #1 artist for the range you pick. The top has the range pills and a year menu, the big numbers, and how this period compares with the one before (for example +18% plays and 2 h more), beside your #1 artist with their photo fading in like the artist page header, Open artist and Play. Recently played starts with a turntable for what’s playing now (or the last thing you played), then sleeves with how long ago. Top of the month is a podium for the top 3 (records peeking out of their sleeves, artist photos for Artists), then rows with play bars in each album’s color. Beside it: plays over time as a waveform, and Highlights. Then TIME OF DAY AS A RECORD CLOCK (24 bars around a spinning record, peak hour on the label), day of the week, and a NEW record showing how much of what you play is from artists in your log. Your listening history, imports and the fake-stats preview stay at the bottom.

## 2026.11.22-c

HISTORY REDESIGN. History now sits on a color field from the albums you rated most recently, and as you scroll the colors follow the month you’re in. The top has the stats line, a button to add the missing days (it brings the albums with no day to the top) and Export CSV, beside YOUR RATING YEAR: 53 weeks of dots where each lit dot is a day you rated an album, in that album’s color, with the number of days and your best run (switch between years). The list is a timeline: the month name sticks in the left column with its count, average and color dots, a spine runs down like the artist Releases timeline, and each row has a date stamp shaped like a record label (tap it to change the day; the editor opens right under the row), the sleeve with its record peeking out (its lit groove is how many songs you’ve rated, and it slides out and spins on hover), chips for relistens, reviews and the kind, the song average, and the rating pill with ten segments in the album’s color. Albums with no day yet are sleeves at the bottom with a dashed + Day button.

## 2026.11.22-b

SETTINGS REDESIGN (first of the six redesigned pages). Settings now sits on a calm color field from the last artist you opened, with a big Settings title, a search box that hides everything that doesn’t match as you type, and a sync turntable that spins while you’re in sync (Save now and Check for newer right on it). On a wide screen a section list on the left follows you down the page. Connections are cards for Spotify, Apple Music, MusicBrainz and Rate Your Music with a status light, and the setup forms open in place under them. On/off switches have a knob that’s a tiny record and turns when you flip it. NEW: a Motion switch (turns off the spinning and sliding on this device), an album-cover default (Apple or Spotify for every artist; an artist’s own switch still wins), a backup reminder interval (7, 14, 21 days or off), Ideas for Playback, and What’s new (the last few builds).

## 2026.11.22-a

PHONE AND ALBUM FIXES. NO MORE GLITCHING WITH AN ALBUM OPEN: things finishing in the background (Apple covers being matched for other artists, play counts, Spotify’s auto-check, friends’ ratings, sync) used to rebuild the whole artist page under an open album, even when nothing on it had changed. Now a background update leaves the page alone unless something on it really changed, and an open album’s covers never switch under you (they switch when it closes). LIBRARY PHOTO: the old photo now fades out while the new one fades in, so there is no snap at the end of the fade. PHONE LIBRARY: the A–Z letters no longer sit on top of the + and Sort (they slide in once you scroll past them), the Add an artist fields are full size again, and the page fades under the status bar instead of being cut off. OPEN ALBUM ON A PHONE: it looks like a record jacket now. The cover is printed once across both inside pages (it was zoomed 3x and cut off oddly), the pages have a card grain and jacket corners, and the inside left has its own record sleeved in the outer edge, like the desktop’s 2LP. FASTER: opening, closing and switching albums, the Standard/Deluxe swap and turning to another listen all play about 40% faster, with the same moves. The phone’s pause before zooming into the inside left is shorter. OPENING AN ARTIST ON A PHONE: the page no longer scrolls down after it opens, so the record flies straight to the turntable instead of aiming low and being dragged up, and it stutters less in the air. SINGLES: fanning out a stack takes the top single off first, then the ones under it (the reverse of how they stack). DELUXE: an album with a deluxe edition shows the deluxe record too, peeking out behind the standard one in its own color, and the two records swap along with their sleeves.

## 2026.11.21-w

ARTIST LIBRARY CLEANUP (from your screen recording). NO MORE FLASHING: the library was drawn on top of the last artist you opened, and every redraw (changing the sort or filter, Add an artist, or a background update like play counts or sync) rebuilt both and faded the library back in, so that artist’s page flashed through. Now the library updates in place, and nothing is drawn behind it. ADD AN ARTIST is a glass sheet over the library with its own close button; Esc or a click outside closes it too, and closing it no longer opens an artist page (the round X on the library was actually the library’s own close button, so it’s gone; on a phone there’s a Back to [artist] chip instead). SMOOTHER PREVIEW: the new photo loads before it fades in, and the name, photo and colors change together, so there’s no snap at the end. Old photos no longer stack up, and the page waits for the pointer to rest on a tile before changing colors, so sweeping across the wall doesn’t flicker. SCROLLING: the slim preview only appears once the search and chips have scrolled away (it used to land on top of them). It now has a small record in the artist’s colors, and the hero fades out as it scrolls up. OPENING AN ARTIST: the library’s backing clears at once, so the artist page shows straight away (the library used to hang on screen for most of a second), the record’s flight onto the turntable is shorter, and the empty turntable is a faint platter instead of a black disc. The app bar stays visible over the library, so nothing jumps. GOING BACK: All artists is a glass chip. The library comes back scrolled to where you left it, and the artist’s record flies home into its sleeve. NEW: a glass Sort menu replaces the plain dropdown. Tiles and the big library record show how much you’ve RATED instead of heard (Done means every song rated). Labels are a little bigger. The A–Z rail shows every letter, with empty ones dimmed. There’s a Recently opened row. Searching lists Artists, then Albums (album results look like sleeves and open the album), with an Add “search” tile. The Rating sort breaks ties by song average, then plays. Keys: / to search, arrows to move between artists, Enter to open, Esc to close or clear. Empty filters get a proper message. Fans also spin photos load right away and fade in.

## 2026.11.21-v

APPLE MUSIC ALBUM COVERS: album covers now come from Apple Music by default, like artist photos. They’re sharper, and the open album shows them at full size (1200 px). Each artist is checked once (their page first, then the rest of your library slowly in the background), straight from your device to Apple, so your Worker isn’t used. A cover is only swapped when the title matches and the track count lines up (explicit copies win over clean ones), so a wrong edition doesn’t slip in; anything without a sure match keeps its old cover. Deluxe editions get their own Apple cover too. Albums you imported from Apple Music were saved at a small size and are now sharper. The Spotify / Apple Music switch for an artist’s photo now flips their album covers too (it shows up for any artist with Apple covers), and album colors stay the same as before.

## 2026.11.21-u

ARTIST LIBRARY PREVIEW, TAKE TWO: the photo now fades exactly like the artist page header (an Apple Music photo is shown whole on the right, with the same soft eased fades on the left and bottom, and no colored box behind it). And once you scroll past the top of the library, a slim preview bar rides along at the top of the list, so pointing at any artist further down still shows their photo, name, numbers, Open artist and Play, in their colors.

## 2026.11.21-t

ARTIST LIBRARY PHOTO, NO SHARP CORNER: the artist photo in the library’s preview now works like the artist page header. It runs to the top and right edges of the window (behind the top bar) and fades only on the left and bottom, instead of sitting in a box with a hard top-right corner. It slides away with the page as you scroll.

## 2026.11.21-s

A NEW ARTIST LIBRARY, MADE LIKE AN ARTIST PAGE: All artists is now a page of its own instead of a dark grey sheet. The whole window takes an artist’s colors (the last one you opened), and on a PC pointing at an artist slowly bleeds the page into their colors and shows them on the right with their photo, numbers, Open artist and Play. On the left: a big Artists title, your library numbers (artists, album and song averages, releases) and your library’s own record, one slice per artist sized by the songs you’ve heard, with a ring for everything heard and the arm swinging over as it opens. Search, Show, Sort and Add artist are glass pills like the Releases filter. The groups (A–Z, rating or progress) run down a timeline like the years on an artist’s Releases, with the big letter sticking as you scroll, and a glass A–Z rail on the right. Tiles lose the grey card: a score tinted in the artist’s color, a ring on the record for how much you’ve heard, and a small bar under the name. On a phone it’s the same page stacked, with the record beside the title. Closing it puts you back where you were on the artist page.

## 2026.11.21-r

CLEARER GROOVES ON THE SHARE CARD: the lit grooves on the share card’s record are brighter, a little thicker and softly glow in the album’s color, so the color reads clearly while the record still looks real.

## 2026.11.21-q

SHARE CARD POLISH AND A STORY SIZE: the record on the share card is now a solid record with a soft shadow, fine grooves and lit grooves tinted in the album’s color, so it reads as vinyl even on pale covers. Song bars fill deeper in the album color, so your favorite songs stand out. Favorites are chips, each with its score on a little record, popping in one by one in the animation. A footer shows whose log it is and the month, with the Playback mark. The share sheet has a new Post / Story switch: Story makes a 1080 × 1920 card for Instagram and Snapchat stories, still or animated.

## 2026.11.21-p

ONE “HIGHEST RATED” ORDER EVERYWHERE, AND READABLE SONG SCORES ON THE SHARE CARD: every highest or lowest sort now breaks ties the same way the album rank does: album rating, then song average (left-out songs stay out), then plays. That covers the big record and the Albums wall on account pages, the best-album pick, the month and top-artist cards, the year card, History sorted by score, Stats’ top albums and an artist’s Releases sorted by rating. On a friend’s page the song average comes from the song ratings they share (plays are not shared). On the share card the little score records next to each song are bigger, with a larger number, so they read at phone size.

## 2026.11.21-o

RANKS THAT DO NOT TIE: an album’s rank (on the inside left of the open album) used to go by the album rating alone, so every 10 was #1 and every 9 shared the same spot. Albums are now ordered by album rating, then by song average (songs you left out of the average stay out), then by plays, more plays ranking higher. Only albums even on all three share a rank. The rank also shows when you have rated just one album by an artist, as #1 of 1, with where it sits across your whole library underneath.

## 2026.11.21-n

SMOOTHER SHARE ANIMATION: the animated share card now plays at about 33 frames a second instead of 20, so the record turns, the ring fills and the song bars grow without stepping. Each frame lines up exactly with how GIFs time their frames, so the motion no longer drifts unevenly, and the record now eases up to speed instead of jumping straight into a full spin. Making the animation takes a little longer.

## 2026.11.21-m

PLAY, A RICHER INSIDE LEFT, AND THE LAST OLD-STYLE PIECES RESTYLED: an open album has a Play button that starts it from the first song on Spotify, on whichever device has Spotify open (reconnect Spotify once in Settings so Play is allowed to start music). Settings > Play button can switch it to Apple Music, which opens the album in Apple Music. The inside left now shows full spins and hours listened under Plays (song lengths come from Apple Music, once per album), where the album ranks among every album you have rated under the artist rank, and a Hidden gem: a song you rate high but rarely play. The record on the inside left shows which listen you are on. The song average moved out of the album rating pill to its own line heading the song list, so it is not mistaken for the album score. The friends card, the song rating editor and the share card and sheet now use the album's colors and the record look. The share sheet also opens above an open album on phones again.

## 2026.11.21-l

DELUXE RATING PILL IN THE DELUXE’S COLOR: on an album’s Deluxe edition the rating pill (Your deluxe, song average, record) was still tinted with the standard album’s color. It now takes the deluxe’s own color, matching its song rows and cover.

## 2026.11.21-k

CLOSING A DELUXE SWAPS BACK TO STANDARD: closing an album while you are on its Deluxe now plays the same edition swap as the Standard / Deluxe switch, the two sleeves trade places in the Releases row and the standard one ends up in front, with the album left shut. Changing artist with a deluxe open also resets it.

## 2026.11.21-j

DELUXE RESETS WHEN YOU LEAVE: close an album while you are on its Deluxe (or change artist with it open) and it goes back to Standard, so the next time you open it you start on the standard album and the Releases row shows the standard sleeve in front again. Switching Standard / Deluxe inside an open album still works as before.

## 2026.11.21-i

FULL DATES FROM MUSICBRAINZ TOO: when Apple Music does not have a release at all (Y2K’s DIRT (feat. JPEGMAFIA) is not on Apple), the date lookup on an artist page now asks MusicBrainz for it, so DIRT shows Oct 28, 2022 instead of 2022. Releases the first try marked as not found are looked at again.

## 2026.11.21-h

FULL DATES FOR FEATURES: a release by another artist that sits on this artist’s page (Y2K’s DIRT (feat. JPEGMAFIA) on JPEGMAFIA’s page) never got its full date, because the fill only read the artist’s own Apple Music list, so it showed just the year. Now anything still missing a full date is looked up on Apple by title when the artist page opens (up to 8 per visit, from your device, not the Worker), and gets the date when the title, artist and year line up. The open single’s label shows the full date too.

## 2026.11.21-g

SINGLES GET A RATED DAY: a single has no rating of its own, so its day is now the day its last song got rated. The moment every song on a single has a rating (a song shared with an album counts when you rate it there), the single gets today as its day and “Rated Nov 21, 2026” slides in under its title on the open 7-inch sleeve. Tap it (or ⋯ › Change date rated) to change or remove the day. Re-rating a song later keeps the original day. Singles finished before this build have no day yet: add one from the sleeve or from History. History now lists singles too, with their song average as the score: dated singles show under All in their month, and a new Singles chip shows every finished single, including the ones with no day yet. The History header counts singles separately so the album count and average stay album-only. Account pages still show album dates only.

## 2026.11.21-f

CRASH REPORTS SAY HOW FAR IT GOT: a second album (Skate Story: Vol. I) made the iPhone drop the page when opened, like Imaginal Disk. Both have deluxe tracks. The crash note now records each step of opening an album with the time since the tap (page built, sheet placed, cover in the air, zooming, then marks at 0.25, 0.7, 1.3, 2 and 3 seconds), so the next report shows exactly where it dies. Light mode for an album that crashed also drops the blurred copy of the cover on the back of the jacket.

## 2026.11.21-e

DELUXE STACKED BEHIND, A TIMELINE FOR EVERY ARTIST, COLOR DRIFT: an album with a deluxe edition now has the deluxe sleeve stacked behind it in the Releases row, peeking out above, and it stays there when the album opens. Switching Standard / Deluxe in an open album closes the record you have out (its cover flies home), the two sleeves trade places in the row, and the other edition is pulled out and swings open like any record, with its own cover, color and songs. Every artist now gets the timeline, even with one album or none (it used to need two albums); an artist with no albums has a Singles and EPs era. The artist color field now drifts up slowly as you scroll (15% of the scroll, at most a quarter of the screen) instead of staying glued in place; it is off in lite mode.

## 2026.11.21-d

FULL DATES, GROOVES BY RATING, CALMER FANS ALSO SPIN, SMOOTHER SINGLES STACK: releases on the timeline now show their full release date (Aug 3, 2018) instead of just the year. New imports keep the date; releases already in your log get theirs from Apple Music the first time each artist page opens (one lookup per artist) and from the daily new-release check. The lit lines on the records on the artist page now light for songs you have RATED, not just heard. Fans also spin records no longer restart their spin on every tap (the spin follows the clock), and each one takes its color from the artist's photo. Fanning out a singles stack deals the singles off the top of the stack one by one while the row slides over to make room; stacking them back gathers each one onto the stack. Best and weakest song ties are now settled by plays: the more-played song is the best, the less-played the weakest.

## 2026.11.21-c

DELUXE IS ITS OWN RECORD, LISTENS ARE PAGES, AND SMOOTHER CLOSING: in an open album, switching Standard / Deluxe now slides the record you had out down and away while the other edition rises out from behind it and comes forward, with its own cover, jacket print, color and songs. Going to a later listen turns the ratings page over like a booklet (on a phone, the page you are on), and going back turns the earlier page back over onto it. Closing an album before it has finished opening now folds it shut from wherever it was instead of snapping open first. The Spotify / Apple Music photo choice is now kept per artist (and synced), so switching one artist no longer switches everyone. The timeline's era years fade in once when an artist opens instead of flashing on every tap.

## 2026.11.21-b

ARTIST PHOTO FADE WITH NO LINE: on a bright photo against a dark artist color (Daft Punk) the left fade showed as a hard vertical line, because a straight fade has corners where it starts and where it changes speed. The left and bottom fades on Apple Music artist photos now ease in and out on an S-curve, so the photo melts into the colors with no edge; the top stays sharp.

## 2026.11.21-a

PHONE REVIEW FIXES + ONE SONG, SEVERAL ARTISTS. Crash guard: an album that makes the page reload when tapped (Imaginal Disk on iPhone) can no longer loop; the next start notices, says so, opens that album in light mode on that device (no zoom, cover print or blur), and files what it holds in your Suggest box so the cause can be found. Coming back: a reload puts you back where you were on the artist page, with the album you had open (never the one that crashed). Missing songs: a song whose title has no Latin letters (JPEGMAFIA’s 投影の芸術) was dropped on import; tap Check for new releases on the artist to bring it in. Shared songs: the same song on two artists’ releases, where one credits the other (WASSUP on HYPERYOUTH and JPEGMAFIA’s WASSUP single), is one song with one rating, checkmark and play count; the releases stay separate. Phone timeline: rows that scroll no longer sit 14px left of the others, and fade at the edge they continue past. Open album on a phone: Next record / Previous at the end of each page; the inside left no longer shows as a black block while closing; song discs no longer blank out while scrolling; the Details/Ratings labels stay readable mid-slide; Write a review and More are pills like Share. Artists list: tiles rise in right away and the letter headers fade into the list. Artist photo (wide screens): Apple Music photos fade like the Spotify banner, long and soft from the left and bottom, with a sharp top edge.

## 2026.11.20-q

PHONE ALBUM OPENS LIKE A REAL GATEFOLD, THEN ZOOMS IN: tapping a record on a phone now lifts its cover out of the row into the middle of the screen as a closed jacket, swings it open on its spine so you see the whole open album for a moment (both inside pages, the rating record peeking out of the right), then zooms into the inside left (Details) until it fills the screen. Swipe or tap Ratings for the right page like before. Closing plays it backwards from whichever page you are on: it zooms back out to the open jacket, the cover swings shut and flies home onto its sleeve. Dragging the sheet down still just drops it. COLLAPSE ON FANNED-OUT SINGLES: instead of a button standing in the row between the album and its singles, the fanned singles now hang under a thin bracket with Collapse and the singles count as its label, above the first one, so the singles sit right next to their album again.

## 2026.11.20-p

PHONE ALBUM MATCHES THE DESKTOP JACKET: the open album on a phone now follows the same design as the desktop gatefold, just one page at a time. Ratings opens with a “Your ratings” header, the title on the left like the desktop and the rating record sleeved in the outer edge, peeking in from the side of the screen; the giant centered record is gone. Details is the desktop’s inside left as is: title, heard, rated date and Listen again left-aligned, then plays, rank (which now wraps instead of cutting off), best and weakest songs, your listen history (it was hidden on phones), review and friends. The cover printed on the jacket is zoomed like the desktop, so the Parental Advisory sticker and giant lettering no longer sit behind your songs. Your album says “song avg” next to the 7.7 again, so it is clear the 9 is the album rating. The band behind Details / Ratings is always there, so the title never slides under them. Write a review matches the jacket instead of the old teal. ALSO: the page behind an open album keeps the artist colors (it showed bare grey around the sheet and flashed grey while closing); Collapse on fanned-out singles now sits where the stack was instead of at the far end of the row; $uicideboy$ sorts under S instead of a U section above A; and the artist’s other names stay on one line on a phone. NEW: LEAVE A SONG OUT OF THE SONG AVERAGE: open a song’s rating and tap Leave out of song avg (for interludes and skits you rate low on purpose). It keeps its rating and its spot in the list, marked Not in song avg, but no longer counts toward the album’s song average, the album’s vs-songs difference, best and weakest song, the artist’s Songs number or your song stats. Tap it again to count it.

## 2026.11.20-o

NO MORE BLINKING OPEN ALBUM ON SLOWER LAPTOPS: on a friend’s MacBook, checking songs off (or anything else that redraws the page) made the open album’s jacket flash see-through for a moment and the left record half-draw. The open album is now updated in place on a redraw instead of being thrown away and rebuilt, so the jacket, its records and its grain stay put and only what changed (the heard count, a rating, a new button) updates. In lite mode the back of the cover also skips its heavy blurred-art layer. Nothing looks different on a desktop.

## 2026.11.20-n

LITE MODE FOR SLOWER DEVICES: a friend found the artist page laggy on his MacBook. Playback now times its frames on the artist page, and if a device keeps dropping them it switches to lite mode on that device: the artist colors hold still, the buttons on the artist page get a flat tint instead of frosted glass (the top bar keeps its blur), the liquid record skips its blur, records spin up on the turntable instead of flying out of their sleeve, and Fans also spin records only turn on hover. Settings > Lite mode has Auto, Always on and Always off; ?lite=1 previews it for one visit. For everyone: a normal record now spins on the browser’s own animation once it’s up to speed instead of a script every frame, and the record and Fans also spin pause while scrolled out of view. Desktops that keep up look exactly as before.

## 2026.11.20-m

PHONE ALBUMS OPEN LIKE A GATEFOLD: on a phone, an opened album is now the open jacket instead of a plain sheet. The cover flies down out of the Releases row onto your rating record, then swings open toward you on its spine and away to the left, showing the inside of the jacket as it turns, while the record spins up underneath and the songs fade in. Inside are two pages side by side with the spine crease between them and a sliver of the other page showing at the edge: Ratings (where it opens: the rating record, the title, your album rating and every song) and Details (the cover with your progress record half out of it, plays, rank, best and weakest songs, listens, review, friends, Share and Find on RYM). Swipe between them or tap Details / Ratings at the top. Closing from Ratings swings the cover shut over the record before it flies home onto its sleeve. The page you are on and how far you scrolled stay put when you rate a song, and drag down, tap the dimmed page or the X still close it. Singles keep their 7-inch sheet. PC and tablet are unchanged.

## 2026.11.20-l

PHONE ARTIST PHOTO ENDS IN ONE CURVE: the photo now stays solid right down to a single curved edge (lowest in the middle, rising toward the sides) with only a short soft falloff, instead of a long fade with a curve laid over it. The shade behind the name follows the same curve instead of running straight across, and the moving artist colors no longer show through the photo as you scroll.

## 2026.11.20-k

PHONE ARTIST PHOTO, STRONGER CURVE: the curved bottom fade on the artist photo bends much more now, so the photo clearly reaches lowest in the middle and melts away well before the bottom at the sides.

## 2026.11.20-j

PHONE ARTIST PHOTO, ROUNDED BOTTOM: the top of the photo is back to how it was. Instead, the bottom fade is now curved: the photo reaches lowest in the middle and melts away a little earlier toward the sides, so it no longer ends in a straight line behind the name.

## 2026.11.20-i

PHONE ARTIST PHOTO TOP EDGE, ROUNDED: the top of the artist photo on a phone now fades in along a gentle arc, highest in the middle and a little earlier toward the corners, so it no longer reads as a straight line under the status bar. The sides and the rest of the photo stay at full strength.

## 2026.11.20-h

PHONE ARTIST PHOTO TOP EDGE: on a phone, the top of the artist photo now melts into the artist color over about 100px instead of stopping in a straight line under the status bar. The rest of the photo is unchanged.

## 2026.11.20-g

ARTIST PHOTO FADE: on a PC or tablet, the Apple artist photo now keeps more of itself. Its left, top and bottom fades are narrower, so hands, shoulders and clothes near the edges stay at full strength, and where the fades meet they curve into each other instead of forming a square corner. The edge still melts into the artist color. Phones are unchanged.

## 2026.11.20-f

PHONE ALBUMS OPEN AS A SHEET: on a phone, tapping a record no longer stretches or jumps the page. The page dims, the album slides up from the bottom as a sheet, and its cover lifts off the sleeve in the Releases row and flies into the top of the sheet, landing as the sheet does; then its record slides out from behind it. Close with the X, by tapping the dimmed page, or by dragging the sheet down from the top; the record tucks back in and the cover flies straight home onto its sleeve. The page underneath never moves, which fixes closing landing you at the bottom of the page. Singles and EPs open the same way. The sheet keeps its place when you rate a song, the dock slides away while it is open, and a band fades in behind the X as you scroll so it never sits on your ratings. Also on phones: the album score no longer runs into its averages, the words under the top buttons and the sync status are readable on the artist photo, the Releases filter fits the full width (Singles is never cut off), Your progress wraps instead of cutting off, Details and the sort menu scroll up clear of the dock, and on short phones like the SE the name and Play sit above the dock. PC and tablet are unchanged.

## 2026.11.20-e

THREE-COLOR ARTISTS: an artist with no ratings now takes three colors from their newest album (the main cover color plus the next two strongest), so the moving color blend and mixed records show on every artist instead of one flat color. Once you rate one album, the three colors come from that album instead. With two or more rated albums it works as before, a blend of every rated cover weighted by rating. A cover with fewer than three real colors gets a lighter and a deeper shade of its main color.

## 2026.11.20-d

PHOTO CHECK ON NEW RELEASES: when Playback finds a new release for an artist (the daily new-release check, or Check for new releases on their page), their Apple Music photo is looked at again the next time you open them, right then and not after 60 days, because artists often change their photo with a new release. It skips the Worker’s saved copy for that one check (Worker 21, it updates itself from GitHub). A failed check keeps your current photo.

## 2026.11.20-c

APPLE ARTIST PHOTOS RECHECK: an artist’s Apple Music photo is now checked again every 60 days, when their page opens, so a new photo on Apple Music shows up by itself. Photos you already have start their 60 days today. If a recheck fails or Apple has nothing, your current photo stays and it tries again the next day.

## 2026.11.20-b

SORT MENU: Default order is gone from the Releases sort, since it was just oldest first. Oldest first is now the starting order (a device that had Default order saved switches to it), and the rest of the menu is unchanged.

## 2026.11.20-a

FROM A FRIEND’S FEEDBACK. THE OPEN ALBUM FLOATS: tapping a record no longer pushes the rest of the timeline down the page. The open album lies on top of the records below its row, the rest of the shelf steps back behind it, and closing it puts the page back where it was. MORE ON THE INSIDE LEFT: the open album now shows your total plays, where it ranks among that artist’s albums (or EPs), its best and weakest song, every listen with its date and score, a preview of your review (tap it to read all of it), friends’ scores, and Share and Find on RYM buttons, all moved over from the ratings side. YOUR ALBUM RATING: the grey pill is now a bar in the album’s own colors that fills as far as your score, like the songs do. A small record at its end shows the number, and the gap to your song average is a small arrow beside it instead of the red and blue line. FIXES: the album rating slider often opened as a thin squashed strip on long albums, so it looked like it did not open. It opens fully now. The colored bars behind rated songs are back. Add artist (top bar and the Fans also spin records) opens the Add an artist box. Before, the box stayed hidden and you only saw the artist page again. Artist search ranks exact names first and copes with small typos. SORTING BY RATING keeps albums, EPs and singles in their own groups with headings. Fans also spin starts open (Hide folds it away and is remembered). ARTIST PHOTOS FOR FRIENDS: signed-in friends now get the Apple Music artist photo too. Your Worker saves each photo for everyone for 60 days, so each artist is only looked up once (Worker 20, it updates itself from GitHub).

## 2026.11.19-an

ARTIST PAGE DESIGN PASS: singles now open as a small 7-inch picture sleeve instead of a full gatefold. The cover flies down out of the row, then the record slides out of the sleeve’s open edge with the song average on its label, and the song or two sit inside. Each timeline row is now headed by the era’s name, with the year beside it, so two eras from the same year no longer both read “2020”. The year column is gone, so the timeline is narrower. On a wide screen (1400px and up), every record, single, stack and box set is about a quarter bigger, so the timeline fills more of the width. Add a release is now a button beside the filters, and its form opens right under the Releases heading. It no longer takes up a whole empty row at the bottom. The chip that stacks fanned-out singles back up now says Collapse instead of ‹ Stack.

## 2026.11.19-am

TIMELINE FIXES (from your screen recording): the timeline now stays when you pick Albums, EPs or Singles, or Newest first. Each era just shows the releases of that kind, an era with none drops out, and Newest first runs from the latest era down. Sorting by your rating, by how much you have heard, or A to Z puts the records on a grid that wraps onto new rows instead of running off the right edge, and each record shows its number (your rating, or the percent heard) so you can see why it is where it is. An open album now sits to the right of the year column instead of covering it, and the timeline line runs past it. Closing an album no longer leaves a blank gap for a moment after the cover lands. The space starts closing as soon as it lands. Changing the sort now brings back whole eras one after another, with no lone Stack button or stray line showing first, and quickly even for a long discography. Picking an artist from the artist menu clears the menu faster, so its tiles no longer sit over the artist page. Still to hear now shows a white Still to hear tag next to Releases that you tap to turn it off. When everything is heard it says so, with a Show all releases button, and the Tap a record hint is hidden when there are no records. Fans also spin records whose Apple Music photo is still loading now shimmer instead of looking empty (Apple only allows one lookup every few seconds, so a new row fills in left to right the first time). Fixed: right after Playback opened, the first sort change or album opened could throw the page back to the top.

## 2026.11.19-al

ERAS AS A TIMELINE: the Releases shelf now runs top to bottom like a timeline. Each era is its own row: the year sits on the left on a line that runs down through the whole discography, with a dot where each era starts, the album’s name heads the row and its records run to the right. Eras ease in as you scroll to them. On a phone it works the same way, with each era’s records swiping sideways, and an opened album unfolds right under its era there too.

## 2026.11.19-ak

ERAS, TIDIER, AND ALBUMS OPEN WHERE YOU ARE: singles and EPs now find their album by their own title (a single only keeps its B-sides, since its A-side already lives on the album), so Creep, High & Dry, Street Spirit, Pyramid Song, Knives Out and the rest stand with their albums. A second disc released as its own album (In Rainbows Disk 2) stands beside the first disc. Anything left over joins the era before it past a thin divider, so there is one label per album instead of extra year groups. On a PC, an opened album now unfolds right under the row its record is on and the page brings that row into view, instead of opening below the whole discography. The artist photo no longer stretches down the page with a tall Releases shelf.

## 2026.11.19-aj

ERAS: in Default or Oldest-first order with All showing, an artist’s Releases are now grouped into eras. Each album starts one, and the singles and EPs that came off it (matched by their songs, not their dates) stand next to it. Singles and EPs that are on no album stand between eras, and three or more of those singles in a row fold into a stack of 7-inches you tap to fan out. Live albums, remix albums and compilations go into a box set at the end that opens into its own era. On a PC the eras wrap onto as many shelves as they need instead of scrolling sideways, and while an album is open its era stays lit while the rest step back. On a phone the eras swipe one at a time, with a rail of years above to jump. Artists with fewer than two albums, other sort orders and the kind filters keep the plain shelf.

## 2026.11.19-ai

ARTIST STATS LINE: the line under an artist’s name now reads like “Albums 8.4 · Songs 7.6 · 28 releases”: your average album rating next to your average song rating (both out of 10), then the release count. The heard count is no longer repeated there, since the progress record already shows it.

## 2026.11.19-ah

SINGLES AS 7-INCH RECORDS, PLAY OPENS THE SPOTIFY APP, RATING FIX: singles in the Releases row are now about 70% the size of albums, like a real 7-inch, standing on the same line so all the titles still sit in one row; they pull out, open and glow just like albums. On a PC the Play button now opens the artist in the Spotify desktop app (the first time, your browser may ask to allow it; if the app isn’t installed, the web player opens instead). The average under the artist name was being halved (it showed out of 5); it now reads out of 10 like everywhere else.

## 2026.11.19-ag

PROGRESS RECORD MOVED UP, SMOOTHER MENU EXIT, CLEANER GROOVES: your progress record no longer sits in line with the albums. It is a bit bigger and has its own spot above Releases (with Your progress and your heard count beside it), and the Releases row moves down under it. Picking an artist from the full artist menu no longer makes the page pop up out of nowhere: every other sleeve dips away (nearest first), the menu fades to show the artist page underneath, and the sleeve you picked holds still while its record slides out and flies onto the progress turntable, then slips away itself. The new page eases in piece by piece (heard count, buttons, progress record, then the albums one after another). The lit grooves on every record (Releases row, open album, Fans also spin, album cards) are now drawn with soft edges, so they are smooth circles instead of lumpy, jagged rings, and the fine grooves on the big records no longer shimmer.

## 2026.11.19-af

ARTIST PAGE POLISH (from your screen recording): Still to hear now animates: the button gives a little press and the releases that stay glide into place while the rest drop out. Details (ⓘ) is now a popover that grows out of its button and folds back into it when you close it (or tap anywhere else, or press Escape) instead of pushing the Releases row down. Closing an album: the page holds still while the cover flies home, so it lands right on its sleeve, and only then does the space close up and the page ease back. The open album’s inside fades as the cover swings over it, so no buttons peek out beside a half-shut cover; its sleeve in the row no longer pops up and sinks again whenever the page redraws; the records in the open jacket are no longer cut off flat at the bottom; and Listen again sits under the album name instead of on top of long titles. “Tap a record to open it” eases in only when it first shows or comes back after an album closes, not on every redraw. The sort menu is now a glass pill with a matching menu instead of the browser’s white list, and a new sort order dips the records out and brings them back one after another instead of sliding them through each other. Fans also spin: no more box behind the row, the grooves hold still while the label spins so they stay crisp (softer grooves on every small record too), the arrows and mouse wheel move by whole records so none is left half cut off, and a redraw no longer throws the row back to the start or nudges the page. Also: the first record no longer shifts sideways between All and a filter, release details are easier to read, the artist colors always fill the window (no dark strip at the bottom of a short page), the ratings line uses one font, and on a phone the record that landed on top of an open album’s name is tucked away.

## 2026.11.19-ae

FANS ALSO SPIN, MATCH ON THE RECORD: each record now shows how close a match it is in its grooves, lit up in the label color from the rim inward (a 100% match is fully lit), filling in as the row opens, and it slowly spins, closer matches a little faster. Artists not in your log now get their Apple Music photo on the label, looked up once each and saved, fading in as they arrive (yours only, like the artist header photo). Show/Hide now sits right next to the heading, and the closed subtitle is just “Similar artists”.

## 2026.11.19-ad

FANS ALSO SPIN, SMOOTHER: Hide now folds the row shut (the records drop and spin back, the arrows slide away) instead of vanishing, Show slides it open, and the mouse wheel now glides the row along smoothly like the arrow buttons do instead of jumping.

## 2026.11.19-ac

FANS ALSO SPIN, RESTYLED AND SCROLLABLE: the grey card is gone, so the section now sits right on the artist’s color like Releases, with a glass Show/Hide pill and records lined up with the Releases row, running off the right edge with a soft fade. On a PC it now scrolls: arrow buttons next to Show/Hide (they dim at the ends) and the normal mouse wheel moves the row sideways. Also fixed the first record sitting flush against the left edge (it was snapping past the row’s padding).

## 2026.11.19-ab

ARTIST PAGE BOTTOM, CRATE STYLE: Similar artists is now “Fans also spin”, a slim bar that stays collapsed until you tap it, then opens to a row of records (artists in your log show their photo on the label and open when tapped; new ones show their initial and tap to add). Add a release is an empty sleeve at the end of the Releases row that opens the form in a panel, and Delete artist moved into Details (ⓘ). Also fixed the last jump when closing an album: the gap above the next item now closes up smoothly instead of vanishing at the end.

## 2026.11.19-aa

ARTIST PHOTO AND OPEN ALBUM TIDY-UP: the artist header now uses Apple Music’s sharper photo by default, and the Spotify / Apple Music switch moved off the header into Details (the ⓘ button). The open album no longer repeats its cover on the inside left: it is already in the Releases row and printed across the jacket.

## 2026.11.19-z

CLOSING AN ALBUM: THE RELEASES ROW NO LONGER JUMPS AT THE END (found from your screen recording): the “Tap a record to open it” line under the row was taken out while an album was open. The row sits at the bottom of the artist header, so it dropped by that line’s height when an album opened, then jumped back up in one frame when closing finished. The line now keeps its space while hidden, so the row never moves. The Spotify / Apple Music photo switch also no longer replays its fade-in on every redraw.

## 2026.11.19-y

CLOSING AN ALBUM: THE PAGE NO LONGER SNAPS AT THE END: the snap was the artist’s color background, not the cover. Closing an album rebuilds the artist page, and the rebuilt background started its slowly turning color pools over from the beginning, so the whole page behind everything lurched into a new position the moment the album finished closing (opening one did the same, hidden under the flying cover). The colors now carry on from exactly where they were through any redraw of the same artist, including ratings and background syncs.

## 2026.11.19-x

Closing an album: the cover now lands exactly on the sleeve (it was aiming at the sunk size, so it ended a few pixels off and then jumped), with a gentler lift so the hand-off is seamless.

## 2026.11.19-w

CLOSING AN ALBUM: NO MORE SNAP AT THE VERY END: the last step of closing swapped the flying cover for the real sleeve underneath, and the two didn’t match (the cover was a touch darker and its record looked different; the sleeve’s drop shadow came back all at once; a page that was scrolled sideways in the Releases row jumped back to the start; the page below shifted by a pixel). The cover now fades out over the sleeve as it lands, the sleeve eases back to exactly how a resting sleeve looks (shadow, record and all), the row keeps its scroll position, and the page height is matched to the pixel, so the redraw at the end changes nothing you can see.

## 2026.11.19-v

CLOSING AN ALBUM NO LONGER SNAPS THE PAGE: when you closed an album the space the open jacket held vanished all at once and the page jumped back toward the top, which made the cover’s trip home hard to follow. Now, as the jacket shuts and the cover flies home, the empty space closes up smoothly while the page eases back to where it was before you opened the album, and the “Tap a record to open it” line comes back without nudging anything.

## 2026.11.19-u

GATEFOLD OPENING, TAKE THREE: the cover used to slide behind the row’s sleeves (they sat on a higher layer than the jacket); it now stays in front of the whole row. The motion is new too: the cover lifts off the shelf at the size of its sleeve with a soft shadow, drops down out of the row first, then slides across and swells to full size as it comes to rest (position and size now ease separately, and there is no more tilting). The record goes with it, so the sleeve left in the row sits empty, sunk and darker, with a brighter glow in the album’s color and the notch pointing at the jacket. Closing plays it in reverse: the cover returns, the record slides back out of its sleeve and the sleeve rises up as it lands.

## 2026.11.19-t

GATEFOLD: THE COVER NOW LOOKS PULLED OFF ITS SLEEVE: the album in the Releases row stays put, but when you open it the cover pops up toward you, tilts and swings out along an arc instead of sliding straight over its own tile. The sleeve it left sinks and darkens, glows in the album’s color, and a small notch under it points down at the open jacket. Closing plays it in reverse: the cover arcs back and the sleeve rises up again as it lands.

## 2026.11.19-s

GATEFOLD: NO MORE FADE-AWAY AND POP-BACK: the album in the Releases row used to vanish the moment you tapped it, then fade back in halfway through the opening, so it looked like it blinked. It now stays put the whole time. The cover that flies out is a copy of it, and the row’s sleeve keeps its lifted, ringed look while the record is open; closing flies the cover back onto it.

## 2026.11.19-r

GATEFOLD NO LONGER SNAPS OPEN: opening a record asks the server what your friends rated for that artist, and when the answer arrived a second or so later the page was redrawn right in the middle of the opening, so the record skipped straight to fully open. Redraws caused by things arriving in the background (friends’ ratings, the activity feed, Spotify checks, new-release scans, photos, sync) now wait until the opening or closing has finished. Taps still redraw immediately.

## 2026.11.19-q

NO MORE POP ON THE ARTIST PHOTO: if the page redrew while the photo was still fading in, the photo jumped to full strength; it now carries on from where the fade was. When a sharper copy of the photo arrives a moment later, it waits for the fade to finish and then blends over the old one instead of snapping.

## 2026.11.19-p

ARTIST PHOTO STAYS PUT: the photo at the top of an artist page no longer flashes and reloads every time you open an album, and no longer re-fades two to four times in a row when an artist first opens. Any redraw of the page was throwing the photo away and putting it back, which restarted its fade-in; now it fades in once per artist and then just stays.

## 2026.11.19-o

ANIMATIONS NO LONGER SKIP AHEAD: a sync starting or finishing (which happens a moment after every rating or change), the Spotify check that runs every couple of minutes, and coming back to the app all rebuilt the whole page underneath whatever was animating, so the animation jumped straight to its end. Now the Sync chip at the top updates in place, and the background Spotify check only redraws when it actually found something new. Animations play through to the end.

## 2026.11.19-n

A REAL OPEN GATEFOLD: an opened album now looks like an actual open record jacket instead of a light box next to a dark one. On a wide screen it is two square panels of the same printed card, in the album’s color with its cover art printed faintly across both, a paper grain and a creased spine, with a record sleeved in each side and peeking out of the outer edges like a 2LP: the left one is your progress record (heard count on its label), the right one shows your rating. Hover a side and its record slides out far enough to read the label. Long track lists scroll inside the right panel. Opening: the cover flies out of the Releases row with its record still in it (the row’s sleeve empties while it is away), lands exactly as it looked in the row, then swings open toward you. No more dark slivers at the corners and no empty box sitting where the left half lands. On narrower screens the halves stack and the cover lifts like a lid. The records in the Releases row now have their lit grooves too (one per song, lit for the ones you have heard); they ripple when you hover them on a PC, and on a phone when they come onto the screen. The number still flies from the rating slider into the song’s record: the label now stays empty until it lands and pops in with it, and the ratings panel no longer jumps back to the top when the page redraws (that was sending the number off-screen).

## 2026.11.19-m

GATEFOLD, TAKE TWO: tapping a record now lifts its cover out of the Releases row (its record stays behind on the shelf) and flies it down into place, so it is the album itself that arrives, not a block. The sleeve then swings open toward you on its spine like a real gatefold, the cover darkening as it tilts away from the light and casting a shadow on the inside (it used to swing away from you, which looked backwards). Closing plays it in reverse and the cover flies home into the row. On a phone the cover lands right under the row and lifts open like a lid. RATING RECORDS: the circles beside each song are now tiny records: grooved black vinyl with a sheen, a paper label tinted the album’s color with your score on it, and the rating as a lit groove around the rim (a 10 is a full ring). Heard but unrated shows a blank label with its spindle hole; songs you have not heard are a faint ghost record. Hover one and it spins.

## 2026.11.19-l

ONE COLOR, AND RECORDS THAT OPEN LIKE A GATEFOLD: the artist’s colors now run down the whole artist page instead of stopping in a hard line above Similar artists; the flowing colors stay pinned behind everything as you scroll. The long list of album cards under the header is gone. The Releases row is now the discography (its All / Albums / EPs / Singles filter and sort sit beside it): tap a record and it opens below like a gatefold sleeve, the cover swinging open on its spine, with the album on the inside left (cover, record, title, listens, edition) and your ratings on the inside right (album rating, friends, every song, Share and more). Tap the record again or the × to fold it shut. Jumping to an album from History, Stats or the Listen list opens it the same way. On a phone the two halves stack and the cover flips up. Artists without a photo get the same page.

## 2026.11.19-k

APPLE PHOTO FITS THE HEADER: Apple’s artist photo is a tight square crop, and filling the wide header with it cut off the lower half of the artist (Spotify’s wider framing showed him to the waist). On a wide screen the Apple photo is now shown whole, as tall as the header and pinned to the right, with its left edge fading into the colors; Spotify’s and the phone layout are unchanged.

## 2026.11.19-j

APPLE PHOTO SWITCH NOW SHOWS UP: the Photo switch never appeared because Playback checked a saved “Worker version” number before asking for the Apple photo, and that number only refreshes during a full sync, so it still said the Worker was old right after the update. The check is gone: Playback just asks, and if the Worker really is old it tries again in an hour.

## 2026.11.19-i

APPLE MUSIC ARTIST PHOTOS, WITH A SWITCH: an artist’s header can now use their Apple Music photo, which Apple serves much larger and sharper than Spotify’s. A small Photo switch under the Play button flips between Spotify and Apple Music (your choice is remembered on this device); Spotify stays the default and nothing is replaced. The first time you open an artist, Playback asks Apple for the photo once (through your sync Worker, no Apple account or key) and remembers it, so there is no extra load after that. If Apple has no photo for an artist the switch simply does not appear. Owner only for now. The sync Worker moves to version 16 and redeploys on its own from GitHub.

## 2026.11.19-g

SHARPER ARTIST PHOTOS: the wide artist header used the mid-size Spotify photo, which looked soft stretched across the window. It now uses the biggest photo Spotify has. Artists added from now on save it right away; artists already in Playback get it the first time you open their page (one Spotify call each, not all at once, so the shared Spotify quota is safe).

## 2026.11.19-f

ARTIST PAGE, REBUILT LIKE THE APPLE MUSIC MOCKUP: an artist with a photo now gets a full-width header that runs edge to edge and up under the top bar. The photo fills the right side (the top on a phone) and dissolves into the artist’s rating colors. On the left: All artists, a big plain title, one summary line (heard, rated, average), a white Play pill (opens Spotify) and two round buttons, one for only-songs-still-to-hear and one (i) that opens the stats and import source. Along the bottom is a Releases row: your progress record (still spins, still catches the record flying in) then every release as a sleeve with its record peeking out; tap one to jump to it. On a PC the artist list steps aside for this page, and All artists opens it over the whole window. Artists without a photo keep the old header; Settings > Artist page turns the photo header off.

## 2026.11.19-e

ARTIST PHOTO HEADER, REDONE TO MATCH THE MOCKUPS: the first version faded the photo to almost nothing in a thin strip, left an empty purple middle, put a glow on the name and made the button gray. Now the photo shows at full strength and only dissolves at its edge into the artist’s colors. On a phone it fills the top with the name, a white Play on Spotify button, the record and the stats below. On a PC everything sits in one column on the left (big name, Play, a smaller spinning record beside the stats, filters) and the photo fills the right side, so the record no longer covers anyone’s face. The filter switch is see-through white to sit on the colors. Settings > Artist page still turns it off.

## 2026.11.19-d

ARTIST PHOTO HEADER: an artist’s page now opens with their photo fading down into the colors from their ratings, like the Apple Music artist page. Under the name is a Play on Spotify button that opens the artist in Spotify (in the Spotify app on a phone). On a PC the photo sits on the right and fades left and down. The record and tonearm stay under it. An artist with no photo keeps the plain color header. Settings has an Artist page card to turn the photo header off if you do not like it (saved on this device).

## 2026.11.19-c

NEW RELEASES NO LONGER LIST ALBUMS THAT ARE NOT OUT YET: an album Apple has announced for a later date (Justice’s GTA VI score, out Dec 11) was showing under New from your artists. Now only albums and EPs that are actually out appear. Anything already listed with a future date is taken off when Playback opens, and an announced album shows up on its own once its release day has passed (and within the last two months). If Apple moves a date later, the entry is taken back off.

## 2026.11.19-b

DELUXES FOLLOW THE TRACKLIST: Justice’s † (Anniversary Edition) stayed a separate album because its title shares no words with Justice. An edition now folds into the standard album when it carries at least 90% of that album’s songs and adds some, came out no earlier, and fits only that one album, whatever its title says. The edition keeps its own name and cover on the Deluxe side of the switch. Re-recordings, live and remix sets, and box sets that hold two albums still stay apart. New releases use the same test: Apple lists an edition apart from the album, so a fresh release is now checked against the songs of albums you already have and skipped if it is just an edition of one. Tap Check for new releases on the artist to fold an existing one; the rating on the stand-alone edition moves to your deluxe rating.

## 2026.11.19-a

EASIER TO FIND YOUR WAY (from a friend’s feedback on a phone): the bottom bar now has Music, Stats, History and Settings as real tabs, evenly spaced (Stats and History used to hide in a popup, and a friend’s two tabs sat bunched on the left); the round buttons at the top have words under them on a phone (Listen list, Add artist, Friends, Account); the artist page has an All artists button; Listen list and Listen again on an album say what they do; a new log shows Start your log with a Search for an artist button; and a short spotlight tour runs once for friends (replay it from Settings, Show the tour).

## 2026.11.18-v

SCREEN AND COLLECTION ARE OWNER-ONLY FOR NOW: both are still work in progress, so their tabs, pages and the Screen block on Stats are hidden for everyone except you (the owner, same check as the suite bar and People card). A friend whose browser had Screen saved as the last tab lands on Music instead.

## 2026.11.18-u

FRIENDS AND LISTEN LIST ANIMATE AGAIN: the Friends sheet had lost its opening animation in the last build (a side effect of the faster artist switching), and it is back. The Listen list now opens with a fade and slide-up, with its rows rising in one after another, and both the Friends sheet and the Listen list slide away when you close them (close button, tapping outside, or Esc).

## 2026.11.18-t

FASTER ARTIST SWITCHING: opening another artist no longer rebuilds the whole page. When nothing else on the page has changed, the top bar and the wall of artists stay as they are and only the artist pane is redrawn, so clicks land sooner on slower laptops (about 40% less work per click in testing with 70 artists, more with bigger libraries). The record is also drawn once in its new look instead of twice. Everything looks and animates the same; any other change still redraws the full page.

## 2026.11.18-s

SMOOTHER ON LAPTOPS: the top bar and the floating dock no longer blur what scrolls behind them (they were already almost solid, so they look the same, but the blur was re-done every scroll frame). The artist page background colors now run on three moving layers instead of six, two colors each, with every album color still there and still sized by your ratings, and they stop drifting while the artist card is scrolled out of view. The spinning liquid vinyl is unchanged.

## 2026.11.18-r

SETTINGS SPOTIFY CARD FIXED: the Spotify card in Settings failed to load (“Cannot read properties of undefined”) because two parts of the play counting shared a name, so the older Most played list broke once the Stats page was added. It works again. You can also still reach your counts on the Stats page.

## 2026.11.18-q

SETTINGS CAN NO LONGER GO BLANK: if one card in Settings fails to load, the page still opens and that card shows a short message saying what went wrong, instead of the Settings button doing nothing.

## 2026.11.18-p

SORT THE BIG RECORD: under the big record on an account page there is a row of orders: Highest (the usual, best at the outer edge), Lowest, Newest rated, Oldest rated and A–Z by artist. Pick one and the covers pop back onto the groove in the new order, with the caption telling you which end is the outer edge. It works on your page and on friends' pages, and goes back to Highest when you leave.

## 2026.11.18-o

ALBUM PAGES FOLLOW THE ALBUM COLOR: the pop-up you get from a cover on the big record and the Song ratings sheet are redesigned like the Music page's sleeves. The whole top takes the album's own color (the same one the Music page uses, or read from the cover for albums not in your log), the cover sits with a record sliding out from behind it, the rating bar and buttons use the banner's ink, and the song ratings sit on a wash of the album color with white bars. The record slides out when the page opens.

## 2026.11.18-n

ALBUM COLORS ON THE BIG RECORD: on account pages, each cover on the big record now has a ring in that album's own color, the same color the Music page gives it, instead of the same teal on every cover. Albums not in your log get their color read from the cover. The ring is still thicker for higher ratings, and turns white when you hover or pick a cover.

## 2026.11.18-m

RECENTLY PLAYED AND ARTIST PHOTOS ON STATS: the Stats page now starts with a Recently played card: your latest plays, newest first, each with its cover, artist and album and how long ago you played it (3 min ago, 2 h ago, 5 days ago; hover for the exact time, and the times keep ticking while the page is open). Show 10 more reaches further back. Artists in Stats now show their Spotify photo instead of a letter: it was reading the wrong picture field before, so even artists in your log showed letters. For artists not in your log, Playback looks their photo up on Spotify a few at a time (12 per visit, saved on this device, and it stops quietly if Spotify says quota).

## 2026.11.18-l

PLAY COUNT COLOR: the ▶ play count on song rows now uses the album color, the same as the rating ring beside it, instead of white.

## 2026.11.18-k

TRACK ROW LAYOUT: on song rows the rating ring now sits at the far right, with the play count (▶ and number) right beside it on its left in the same color as the song title. Before, the play count wrapped onto its own line and pushed the rating down.

## 2026.11.18-j

APPLE MUSIC IMPORT: Stats now reads Apple Music history too. Request your data at privacy.apple.com (Apple Media Services information), then choose the zip, or Apple Music Play Activity.csv, in the Stats import box. Apple plays count next to Spotify ones, songs match across services, and re-importing never double counts. An Apple import only replaces older Apple plays, never Spotify ones. Apple does not offer a free way to read plays as they happen (it needs a $99 a year developer account), so Apple plays come from the export.

## 2026.11.18-i

SONG LENGTHS FOR LIVE PLAYS: plays Spotify reports as they happen now come with the song's length, so Stats hours for them use the real length instead of an estimate. Spotify does not say how much of a live play you heard, so each counts as played in full; a Spotify data export (which has the exact time) replaces them for the dates it covers. Plays saved before this update have no length and are still estimated. Your Worker needs the new playback-sync.js (it takes it from GitHub on its own).

## 2026.11.18-h

SIMILAR MUSIC: every artist page has a Similar artists section (tap to open, nothing loads until you do) and every song you open to rate has Similar songs, both from Last.fm listening data. Each match shows a match bar and where you stand with it: % heard, Rated, Heard, or Not in your log; Open jumps to that artist, Add starts the Add an artist search for them. Rows rise in one after another and the match bars fill. Answers are saved on the Worker for 30 days, so looking again is free, and fresh lookups are capped per person per day. Needs Worker 19 and the LASTFM_KEY secret (a free Last.fm API key).

## 2026.11.18-g

STATS PAGE AND A PLAY HISTORY FOR EVERY SONG: Music menu › Stats is a stats.fm-style page: your top songs, artists and albums for the last 4 weeks, 6 months, 12 months, this year, any year or all time, plus plays over time, busiest day, longest streak, songs new to you, time of day and day of the week. Every play Spotify reports is now kept in a separate play history on this device, including songs from artists you have not added to Playback; add the artist later and its old plays show up as counts on its songs. To fill in the past, request Extended streaming history from Spotify (spotify.com/account/privacy) and choose the zip on the Stats page, no unzipping; it counts plays of 30 seconds or more like Spotify does, and importing a newer export later replaces the dates it covers so nothing is counted twice. Preview with fake stats shows the page with made-up listening that is never saved. Songs you have played are not checked off as heard on their own: after an import there is an optional button for that, with Undo. The history is kept on the device it was imported on (not synced), so keep the Spotify zip.

## 2026.11.18-f

PLAY COUNTS: every Spotify play of a song in your log is now counted. Song rows show a small ▶ number (hover for the last play date), and Settings › Spotify has a Most played list of your top songs and albums. The first time it runs it counts everything your Worker has saved (up to its last 3,000 plays); after that it adds each new play. Plays of songs not in Playback are not counted, and Spotify leaves out private-session plays.

## 2026.11.18-e

NEW RELEASES FROM YOUR ARTISTS: once a day while Playback is open (and on Check now), it asks Apple Music, which needs no key and uses none of your Spotify allowance, for the albums and EPs of up to 25 of your artists at a time, the ones checked longest ago first. Anything out in the last two months, or already announced, that is not in your log lands at the top of the Listen list under New from your artists, with Add to list, Artist and Dismiss, and the bookmark badge counts them. They also go to your morning brief (Worker 18 adds newReleases to /brief). Daily checks can be turned off in that box. It only runs while the app is open, and Apple is sent artist names only.

## 2026.11.18-d

YEAR IN REVIEW: Overview on your own account page has a Year in review card. Make my 2026 card builds a picture from your rated-on dates: albums rated, your average, how many artists, your top album big with its score, albums rated each month (busiest month lit) and your next best covers. Share it, copy it or save it like the rating card; switch years when you have rated 3+ albums in more than one.

## 2026.11.18-c

FRIENDS ACTIVITY: the Friends sheet opens on a new Activity tab (Friends keeps the list, codes and requests) showing the newest ratings from friends who share their page: cover, who rated, the title, the day, their score and the start of their review. Tap one to open that friend's page with the album already open. Rows rise in one after another. Needs Worker 18 (GET /acct/feed).

## 2026.11.18-b

WRITTEN REVIEWS: any album or deluxe you have rated has a Write a review button under its rating (1,000 characters; Edit review and Delete once it exists). Friends see it when they open your album on your page, and next to your score on their own album card behind a Read review button. It rides on the rating, is included in Export ratings (new Review column) and in Download backup, and the privacy page and Account note now say reviews are shared with friends. Needs Worker 18 for friends to see it.

## 2026.11.18-a

TIDYING AND SAFETY: a Content-Security-Policy keeps remote scripts, plugins and off-site forms out (it is a seatbelt, not a wall: friend names, titles and messages were already escaped on the friend pages and the friends list, which I re-checked). A song row can now be opened with Enter or Space from the keyboard, and keeps focus afterwards. The 187 oldest changelog entries moved out of index.html into CHANGELOG.md, so the page is about 80 KB lighter on every open.

## 2026.11.17-ay

LISTEN LIST OPENS THE ALBUM: tapping Open on a Listen list entry now takes you to that album on the artist’s page (scrolled into view with a little ripple) instead of just to the artist, and the Listen list closes behind you. If an entry is not in your log yet, Open still goes to the artist.

## 2026.11.17-ax

FRIENDS CAN SEE YOUR SONG RATINGS: opening one of your albums on your page (from the Albums wall, or the new Song ratings button when you tap an album on the big record) now shows its songs and their ratings to friends, the same list you see, with how many songs are rated and the song average. Each album now carries its song ratings when it is shared, so they show up after your next sync; a friend’s page fills in as that friend updates Playback. Anyone you share your page with can see them, like the album rating itself.

## 2026.11.17-aw

FRIEND PAGES ANIMATE AGAIN: opening a friend’s page the first time showed a “Loading…” card, and that first draw used up the page’s entrance animations, so when the friend’s ratings arrived a moment later the hero, covers, record and cards just appeared. The animations are now saved until the page has really been drawn.

## 2026.11.17-av

FRIENDS CODE STAYS PUT: your friend code no longer pops in a second time when the Friends list finishes loading (it had its own entrance animation that replayed on every redraw); the sheet’s slide-up is the only entrance now. The same goes for the code on the Account Settings tab.

## 2026.11.17-au

FIX: closing the month panel no longer makes the score hint above it flash; only the hint that belongs to the panel you closed fades in.

## 2026.11.17-at

SMOOTHER FOLD: when a score or month detail panel closes, it now shrinks to exactly the size of the “Tap a bar…” line that replaces it and that line fades in, so the cards below no longer rise too far and then snap back down.

## 2026.11.17-as

DETAIL PANEL CLOSES SMOOTHLY: tapping the selected bar again (a score under the tiles, or a month in Albums rated per month) now folds the detail panel away, shrinking and fading, with the cards below sliding up into the gap, instead of vanishing at once.

## 2026.11.17-ar

STEADY RECORD: tapping a bar under Overview (a score or a month) no longer makes the big rated-albums record jump. Every tap redrew the page, which started the record’s slow spin over from its first angle; it now keeps turning from wherever it was.

## 2026.11.17-aq

PAGE TRANSITIONS AND A STEADIER FRIENDS SHEET: switching between Music, Screen, Collection, Settings and Account now slides the new page in from the side it sits on in the top bar while it fades up (going back toward Music slides the other way). Opening Friends no longer plays twice: the sheet used to slide up, then slide up again a moment later when the list finished loading; now it slides up once and the list fills in without moving.

## 2026.11.17-ap

ALBUMS WALL: EVERYTHING, GROUPED BY SCORE, TAP FOR DETAILS. The Albums tab no longer stops at 60 and has no Show more button: every album is on the wall and the covers grow to use the width of your screen. Sorted by Highest or Lowest, the wall is split into rows headed by the exact score (10, 9.5, 9 and so on) with how many albums got it. Tap any cover (or a row in the list view) and a pop-up opens with the big cover, the rating, the day it was rated, and on your own page every song with its rating bar, how many songs you rated and the song average next to the album rating. On a friend’s page it shows their rating and date and, if you rated it too, yours; their song ratings stay private. Close with the X, by tapping outside, or Escape.

## 2026.11.17-ao

ACCOUNT SETTINGS TAB AND A TIDIER SETTINGS PAGE: your Account page has a fourth tab, Settings, that holds Friends (your code, add by code, requests) and Your account (photo, color, name, sharing, owner login, sync, sign out, delete), so they no longer sit under Overview, Albums and Shows & films. A friend’s page does not show it. The regular Settings page is now grouped under three headings: Library & imports (import source, Spotify, Rate Your Music, rating dates), Account & community (the account shortcut, friend suggestions, people using Playback) and Your data (sync, numbers, export, backup). The groups sit side by side on a wide monitor, in two columns on a tablet and stacked on a phone. The Account card in Settings now has an Account settings button that opens straight to the new tab.

## 2026.11.17-an

OVERVIEW REARRANGES WITH THE WINDOW: the account Overview now lays its cards out by screen size instead of letting them fall wherever. On a phone everything stacks in one column (months, scoring habits, top artists, then the record). On a tablet the months card spans the top, scoring habits and top artists sit side by side, and the record is centered below. On a desktop the big record sits on the left, staying in view as you scroll, with the months, scoring habits and top artists stacked beside it so there are no empty gaps. On a very wide monitor the record takes the left, the months card spans the top and scoring habits and top artists sit side by side under it. Friends and Your account sit side by side on wide screens and stack on narrow ones.

## 2026.11.17-am

FIXES AND FULL-WIDTH PAGES: tapping a month bar used to replay the animation on the score covers above it (and the reverse); now only the panel you opened animates. Every page now uses the whole window instead of a centered column about 1100px wide: Settings flows into columns, your page lays its cards side by side, and everything folds back to one column as the window shrinks. The cover previews are fitted to the space they have, so they stay correct inside the narrower cards and refit on resize without redrawing.

## 2026.11.17-al

COVER PREVIEWS FILL THE PANEL: the score and month details on Overview used to show just the first eight covers. They now fill two rows on a phone and three on a wider screen, with more columns the wider the window (it refits when you resize), and when there are more albums than fit the last tile says how many more (+33 more) and opens them in the Albums tab. The covers also fade in at an even pace.

## 2026.11.17-ak

OVERVIEW: TAP THE BARS. Your stat tiles now also show Songs rated (with its average) and Albums rated in this year (with how it compares to last year); on a friend’s page the songs tile appears once their copy has published it. Tap any score bar under the tiles to see how many ratings got that score, the albums and shows & films among them, and their covers, then See the albums takes you to the Albums tab filtered to exactly that score. Tap any bar in Albums rated per month to see that month: how many albums, their average, the best one and their covers, step to the previous or next month with the arrows, and See them in Albums opens the Albums tab on that month, newest first. The Albums tab’s Filters panel has a new Exact score row (1 to 10, with counts). The Worker needs the new playback-sync.js (it takes it from GitHub on its own) to keep your song count for friends to see.

## 2026.11.17-aj

ONE ALBUM, ONE RATING: an album made by several artists (like An Evening With Silk Sonic on Bruno Mars and Silk Sonic) now counts once in your album total, averages, score bars, record and Albums wall, and lists every artist on it (Bruno Mars, Anderson .Paak, Silk Sonic) instead of showing up once per artist. It is published once now, and a friend whose copy still sends one row per artist is merged the same way, so the counts match either way. Taste match still lines up albums whichever of the artists you each have. EVEN FADE-IN: the cover wall, list and the big record used to fade in one by one and then the rest all at once after about the 15th to 70th; every cover now fades in at the same steady pace, whatever the count. POP-OUT COVERS: tap an album on the big record and it lifts off the groove and grows into the middle, showing a big cover, the title, every artist, the exact score as a bar and the day you rated it. Tap anywhere or press Escape to put it back. The Worker needs the new playback-sync.js (it takes it from GitHub on its own) so a list of several artists is not cut short.

## 2026.11.17-ai

ACCOUNT PAGE SECTIONS AND A BETTER ALBUMS VIEW: your Account page (and a friend’s page) now has three tabs under the top card: Overview, Albums and Shows & films, so the page is no longer one very long list. OVERVIEW keeps the stat tiles, the score bars and the big rated-albums record and adds three cards: Scoring habits (your most common score, how many perfect 10s, and the share rated 8 or higher), Albums rated per month (a bar for every month since your first dated rating, with your busiest month and how many months you rated something) and Top artists (your five highest-averaging artists with two or more albums). ALBUMS is a wall of covers with the exact rating on each one (on a friend’s page your own rating sits in the corner of the albums you both rated). Sort by Highest, Lowest, Newest rated, Oldest rated or A–Z; the Filters button opens a score filter (10, 9+, 8+, 7+, Under 7) and a Year rated filter, and picking a year shows twelve month tiles you can tap to see just that month, with the albums grouped under month headings (the count and average for each month) whenever you sort by date. A switch beside Filters flips between the cover wall and the old list. Shows & films keeps the list with the same sorting and filters. The wall, the month tiles and the new cards all animate in. Nothing about what is published changed, so this works on friends’ pages straight away.

## 2026.11.17-ah

RATED DATES ON ACCOUNT PAGES: every album, show and film on your Account page (and on a friend’s page) now says the day it was rated, under the title (Rated Nov 14, 2026). The dates come from the days already on your ratings and are published with them, so a friend only sees them if you accept each other and sharing is on. Nobody can change them: only your own signed-in account can save your published ratings, and the private rating-dates list itself stays on your Worker, readable only with your sync key or owner login, with no way for anyone to write to it. The Worker needs the new playback-sync.js (it takes it from GitHub on its own).

## 2026.11.17-ag

THE RATED-ALBUMS RECORD: your Account page (and a friend’s page) now has a big vinyl under the stats with every album rated, each one a cover on a single spiral groove: the highest rated sit on the outer edge and it winds in to the lowest at the label. Hover a cover (or tap it on a phone) to read its title, artist and rating on the label, and tap again to keep it there. The record turns slowly, stops when you point at it, and pops in cover by cover when the page opens. A brighter ring means a higher rating. Deluxe editions rated on their own are not drawn, matching the albums count.

## 2026.11.17-af

FIX: DELUXE EDITIONS WITH A ROMAN NUMERAL TITLE NOW FOLD IN: Skate Story: Vol. I and its Deluxe Edition (titled Vol. 1) stayed as two separate albums because Playback read I and 1 as different words. Vol., Part, Chapter, Book, Act and Episode followed by a Roman numeral now count as the number when titles are compared. The tracklist check is unchanged: the deluxe still has to carry nearly all of the standard album’s songs and add more, so a different album with a similar name stays separate. Tap Check for new releases on the artist to apply it; the rating on the stand-alone deluxe moves to your deluxe rating and its song checks move onto the album.

## 2026.11.17-ae

FRIENDS AS A SHEET: the Friends button now slides a sheet up over whatever you are on (music, screen, collection) instead of replacing the page. Close it with the X, by tapping outside it, or with Escape, and you are exactly where you were, so your artists and the tab bar stay put. Opening a friend from it still works, and its back button reopens the sheet.

## 2026.11.17-ad

OWNER: PEOPLE USING PLAYBACK. In your Settings, a new People using Playback card lists everyone who has made an account: name, when they joined, when they last opened Playback, how many things they rated, how many friends they have, and whether their log is synced or their page is private. Load users reads it from your Worker (it takes the new playback-sync.js from GitHub on its own), and only you can see it. It never shows anyone’s ratings. FRIENDS PAGE FIX: the Friends page could come out wider than a phone screen, pushing the account icon and tab bar off the right edge; pages are now held to the screen width and rows wrap instead.

## 2026.11.17-ac

FRIENDS ONE TAP AWAY: once you are signed in, a Friends button (two people) sits in the top bar next to your account icon. It opens a Friends page with just the list: requests waiting for you first, then your friends (tap a name to open their page, and the back button returns to the list), then your friend code and the add-by-code box. A small number on the button shows how many requests are waiting. The list also lives on your Account page as before.

## 2026.11.17-ab

PROBLEM REPORTS: if Playback crashes on a friend’s phone, a small card slides in offering to send the error details to Skyler through the Suggest box (one tap, only after they press Send report). Network hiccups are not reported, and each error shows once. The owner does not see it. They read in Settings, Friend suggestions, starting with [auto].

## 2026.11.17-aa

MATCH FIX: friends could not open another person’s page (“Could not reach Playback’s server”) when that page had albums without a MusicBrainz id, which is most Spotify and Apple Music imports. The page now opens, taste match counts only things you both rated, and a drawing error is no longer reported as a connection problem.

## 2026.11.17-z

PROFILE PHOTO AND ACCOUNT COLOR: on your Account page, under Your account, you can add a photo (it is cropped square and shrunk to a small size), remove it, and pick your account color from a row of swatches, drag a slider for any shade, or tap Auto to go back to the color made from your name. Your photo and color show on the account icon at the top right, on your page, and for friends on your page, in their friends list and next to your ratings under an album. The picture and color are kept on Playback’s server, so your Worker needs the new playback-sync.js (it takes it from GitHub on its own); until it does, saving shows a short “give it a minute” note.

## 2026.11.17-y

COVERS ON ACCOUNT PAGES: albums on your page and on friends’ pages showed a letter instead of the cover whenever the album did not come from MusicBrainz (Spotify and Apple Music imports). The cover link you already have is now shared with your ratings, so those albums show their art. Only Spotify, Apple, MusicBrainz and TMDB picture links are accepted. Your page and your friends’ pages fill in as each person next opens Playback.

## 2026.11.17-x

OWNER LOGIN: Account has a new Owner login section. On a device that already syncs with your sync key, tap Make this my owner login once (it takes the key one time). After that, on any new phone or computer you just open Playback, sign in with Google, and the whole app unlocks: your log, photos, Spotify plays, Discogs and suggestions, with no Worker address or key to paste. A device can also switch to Google sign-in with Use Google sign-in on this device. Your sync key keeps working as a fallback, and Give up owner login undoes it. Friends are unaffected: only the one account you claimed gets this, and claiming needs your sync key. Your Worker needs the new playback-sync.js (it takes it from GitHub on its own).

## 2026.11.17-w

ACCOUNT SYNC: after signing in, Account has a Keep my log on all my devices switch. Turn it on and your whole log (ratings, listens, collection, shows and films, not photos) is saved under your Google account on Playback’s server, so it shows up on any phone or computer you sign in on, with no setup of your own. Saves are batched about every 20 seconds and sent when you leave the app, and a device that is behind never overwrites a newer copy. If a device already has its own log when you first turn it on and a saved copy exists, you choose which one wins. Only you can see the saved copy (friends still see just the ratings you publish), the size is capped at about 1 MB compressed, and you can delete the copy or your whole account any time. Your own Worker sync is unchanged and is used instead if you have it. The Worker needs the new playback-sync.js (it takes it from GitHub on its own).

## 2026.11.17-v

ACCOUNT ICON AND FRIEND PAGES: a round account icon sits at the top right (a person outline until you sign in, then your initial). It opens your Account page: your own page (rating counts and averages, how often you give each score, and your albums and shows) with Google sign-in, your friend code, friend requests and sharing underneath. Tap a friend to open their page, which shows the same plus a taste match with you, and lets you list what you both rated, or only what they rated that you have not (a quick way to find something to hear). Settings keeps a small card that points to it.

## 2026.11.17-u

ACCOUNTS ARE ON: Sign in with Google now shows in Settings under Account. Sign in, share your friend code, and add friends to see how they rated the same albums, shows and films.

## 2026.11.17-t

BLANK PAGE FIX: on a browser that already holds a copy of your log in its regular storage, Playback stopped on start-up with a blank page (the backup reminder tried to run before it was ready). It now waits a moment, so those browsers open normally. Nothing in your log changed.

## 2026.11.17-s

ACCOUNTS AND FRIENDS (built, switched on once Playback has a Google client ID, see SETUP.md Part 8): Settings has an Account card where you sign in with Google, get an 8-letter friend code, add friends by code and accept requests. Once you are friends, a Friends strip under each album (and show or film) lists what they rated it, with a bar and the group average, matched by MusicBrainz or TMDB id and by artist and title, so a friend on Apple Music lines up with you on Spotify. Only accepted friends see your ratings, a switch hides them, and Delete my account erases everything. Your log stays on your device; only title, artist and rating are shared. Your Worker needs the updated playback-sync.js (it takes it from GitHub on its own).

## 2026.11.17-r

BACKUPS AND SYNC GUIDE: Settings now has Download backup file and Restore from file (it asks before replacing your log). If sync is off and your last backup is more than three weeks old, a small banner offers to download one, and Later hides it for a week. Under Sync there is a step-by-step guide to setting it up with your own copy of the app and your own Cloudflare account, with a button that makes a secret key for you. Nothing changes if you already use sync.

## 2026.11.17-r

HISTORY: the No date sort chip is now always there, not only while some albums have no day. With none left it simply shows the list newest first.

## 2026.11.17-q

PRIVATE RATING DATES + SAFER STORAGE: your list of rating days no longer sits in the public GitHub repo; it is kept on your sync Worker and the Import rating dates button reads it from there (only you see that card now). Also, Playback now asks the browser to keep its saved log from being cleared when the device runs low on space, which protects friends who are not syncing.

## 2026.11.17-q

MUSIC MENU AND HISTORY SORT: History is no longer its own button in the bar. While you are on Music, tap Music again and a small menu drops open with Artists and History (it opens upward on your phone, closes when you tap anywhere else, and Music shows a little arrow when you can open it). History also has a new No date sort that puts the albums with no day first, so you can fill them in one after another; the rest follow newest first.

## 2026.11.17-p

IMPORT SOURCE BUTTONS: tapping Automatic, Apple Music or MusicBrainz only in Settings saved the choice but the buttons and the Right now imports read from line did not change until you left the page and came back. They now switch the moment you tap.

## 2026.11.17-o

CLEAN START: a brand-new Playback no longer comes with Radiohead and the Severance example already in it, so a friend opening it for the first time starts with an empty log, and the empty screen now tells them how to add their first artist. Anything already in your log, Radiohead and Severance included, stays exactly as it is.

## 2026.11.17-n

SUGGEST SOMETHING: friends who use your copy of Playback get a Suggest something box in Settings that sends their note to you (it uses your sync Worker, no sign-in for them, 10 an hour each, 600 characters). In your own Settings, Friend suggestions loads what they sent so you can copy the list, mark one Done or clear all. Your Worker needs the updated playback-sync.js, which it takes from GitHub on its own; until it has, a friend’s Send says it did not send. Open Playback with ?owner=1 on any device that is not already on your own sync Worker to see your side.

## 2026.11.17-m

FRIENDS MODE: before you share Playback, other people no longer see the app bar (it linked to your Kitchen, DishLog, Protocol and the rest) and their Ideas box can no longer send anything to your ideas Worker. You stay in owner mode automatically on any browser whose sync is set to your own Worker; on a new device or browser open Playback once with ?owner=1 on the end of the address to switch it on (?owner=0 turns it off). Nothing else changes for anyone.

## 2026.11.17-l

FIX: the app sat on “Loading your log”. The artist menu’s new opening animation (2026.11.17-j) referred to a value that did not exist where the menu is drawn, which stopped the page from drawing at all. Nothing in your log was touched. It is drawn again, and the menu animation is unchanged.

## 2026.11.17-k

SMOOTHER DELUXE SWITCH: the Standard/Deluxe transition was too quick and abrupt. Everything now runs about twice as slow and with softer easing: the old edition fades out gently, deluxe songs fold shut and open with a longer, more even stagger (they no longer open fast and then stall), and the cover, title and rating ease in instead of popping.

## 2026.11.17-j

ARTIST MENU OPENS WITH MOTION (PHONE): tapping the artist bar now slides the full-screen menu up from the bottom, the title and search settle in from the top, and the artists rise into the grid one after another, with the A-Z strip fading in last. It plays only on the tap that opens it, so a sync redraw while the menu is open never replays it. Reduced-motion settings skip it.

## 2026.11.17-i

DELUXE SWITCH TRANSITION: going between Standard and Deluxe now plays as a real transition instead of a snap. The old edition fades out (cover, title, rating), switching back folds the deluxe-only songs shut one after another, and going to Deluxe opens them up row by row while the new cover pops in and the title and rating fade up. The sliding switch thumb is unchanged. Reduced-motion settings skip all of it.

## 2026.11.17-h

NO MORE COVER FLASH: opening a song or album rating (or anything else that redraws the page) made the album cover blink, because every redraw rebuilt each cover as a new picture. Covers that are already on screen are now kept through a redraw and put straight back in place, so they no longer blink, flicker or reload.

## 2026.11.17-g

COVERS NO LONGER VANISH ON A HICCUP: if an album cover or poster failed to load once (weak signal, a slow image server), it was thrown away until the next redraw, which is why covers kept disappearing and flashing back. It now asks for the picture again up to two more times before giving up.

## 2026.11.17-f

MOBILE: THE RECORD COMES OUT SOONER: on a phone, an album’s vinyl now slides out of its sleeve (and starts its animation) as soon as the album is a little way onto the screen from the bottom, and stays out until it is nearly off the top, so it is out for much more of your scrolling. Before, it only came out while the album sat in a narrow band in the middle of the screen. Computers are unchanged.

## 2026.11.17-e

FIX: A DELUXE RATING YOU CLEARED NO LONGER COMES BACK: every time the app started (and on every import), an album with a deluxe edition and no deluxe rating copied its own standard rating onto the deluxe, because the two titles look the same once “(Deluxe)” is dropped. Short n’ Sweet (Deluxe) got Short n’ Sweet’s rating back each time you removed it. The deluxe now only takes a rating from a separate old deluxe album it is absorbing, never from the standard album itself.

## 2026.11.17-d

EVEN FEWER SPOTIFY CALLS: during a Spotify import, a plain one-song single (no brackets or dash in its title, and no other release with the same title) no longer costs a request to read its tracklist, because its song is just its own title. Anything with an edition, a remix tag, more than one song, or a saved copy is read exactly as before. Same discography, fewer requests, so more artists fit in a day.

## 2026.11.17-c

SPOTIFY CALL COUNTER SHOWS WHAT SPENT THE CALLS: each day in the list under Settings now says how many of its Spotify calls were searches, release lists, albums, artist lookups and so on (it only showed that for today before), so you can see what used up a day’s budget. Nothing else changes.

## 2026.11.17-b

MOTION: changing the artist filter (All, Started, New, Done) or sort, or the release kind or sort under an artist, no longer snaps. Tiles and album cards that stay slide to their new spot and the new ones rise in one after another.

## 2026.11.17-a

FEWER SPOTIFY CALLS ON IMPORT: a Spotify discography import no longer reads the tracklists of live, remix, instrumental, karaoke and demo albums when “include live albums, remixes and alternate versions” is off, since those were always thrown away afterward. Same results, fewer requests, so more artists fit before Spotify asks for a break. With the box ticked, nothing changes.

## 2026.11.16-ar

Picking a different artist now glides back to the top instead of snapping.

## 2026.11.16-aq

IMPORT: EPs now claim songs before singles, so a single’s song lands on the EP that carries it. A hand-made album with the same title as an imported release (Astroworld vs ASTROWORLD) is folded into that release instead of staying as a separate card. Picking a different artist now scrolls to the top.

## 2026.11.16-ap

LISTEN AGAIN: the record’s ripple on scrolling into view now runs through every band on a second listen, strongly through the ones you have lit on this listen and softly through the faded carried ones. CLEAR ANIMATION: clearing a song now shrinks its colour bar away (down to last listen’s rating on a later listen), pops its check, and fades its band on the record from lit to what it is now.

## 2026.11.16-ao

LISTEN AGAIN, ANIMATIONS: on a second listen the record now glows and ripples when you rate a carried-over song, and tapping a faded check confirms the song for this listen (it lights up) instead of unchecking it. Mark all heard confirms every carried song the same way.

## 2026.11.16-an

LISTEN AGAIN: each listen has its own day. A new listen is dated the day you start it, and the album card shows it as Listen 2 · that day (tap to change it). The record’s ripple, when it scrolls back into view, now runs only through the bands you have lit on the current listen, not the faded carried-over ones.

## 2026.11.16-am

LISTEN AGAIN: your first listen of an album can never be removed. Remove only appears on later listens.

## 2026.11.16-al

LISTEN AGAIN: on a new listen the record’s bands start faded (they are last listen’s songs carried over) and each band fills back in fully, with the usual glow, as you mark its songs off on this listen. The green and red change gradient in a song bar now slides with the bar while you drag the rating slider.

## 2026.11.16-ak

LISTEN AGAIN: Clear on a song or the album in your newest listen now puts last listen’s rating back (dimmed, carried over, with its gradient) instead of leaving it blank. If last listen had no rating there, Clear still leaves it blank.

## 2026.11.16-aj

LISTEN AGAIN: the green and red change gradient in a song bar now fades in from the color before it too, so it has no hard edge on either side.

## 2026.11.16-ai

LISTEN AGAIN, POLISH: the change marker in a song bar is now a gradient in the same style as the bar itself (green-tinted where you rated higher, red-tinted where lower, fading out to the right) instead of a box. Carried-over ratings are fainter: the numbers, rings and bar gradients. Fixed the album rating number not fading on a carried rating (the pop-in animation was holding it at full strength).

## 2026.11.16-ah

LISTEN AGAIN, CARRY-OVER: a new listen now starts with the last listen’s numbers (songs, checks, album and deluxe rating, dimmed) so sorting, History and totals keep working. A number becomes this listen’s own the moment you rate, check or clear it, and only those show a change. The change marker inside a song bar is now a soft tinted pill (green gained, red lost) with a thin tick at last listen’s rating.

## 2026.11.16-ag

LISTEN AGAIN, FIXES: switching listens now animates (the card slides, song bars grow back in, rating numbers pop). Song rows are back to their normal height, with the change chip sitting on the right. Each song bar now shows last listen’s rating inside it: a green striped stretch where you rated it higher, a red one where lower. The latest listen always sets your real scores; arrows only let you look at earlier listens (view only). A new listen clears the album rating, deluxe rating and song ratings. History keeps the album on its last rated listen until you rate the new one.

## 2026.11.16-af

LISTEN AGAIN, REDONE: any rated album now has a round arrow button in the top corner (where the bookmark sits). Tap it and the album starts a fresh listen: clean song checks, your album rating carried over so it stays in History. Once an album has two or more listens, arrows under the title flip between them, each listen keeping its own songs, ratings and day. On a later listen every song shows how its rating moved from the listen before (+1, −2), and a line gives the album difference and the average song difference. Remove deletes the listen you are on.

## 2026.11.16-ae

LISTEN LOG: an album you hear again can keep a log. On any rated album, tap Log another listen, pick the day, drag the rating and add a note. Each listen shows its day, its rating and how much it moved from the one before (+1, −0.5), with a little bar chart and a summary like 7 → 9 over 3 listens. Edit or delete any listen. Your album rating always follows your latest listen, so History, exports and the share card stay right. History marks relistened albums with ↻ and has a Relistened filter.

## 2026.11.16-ad

RATING DATES: the history list now runs through Nov 5, 2026 (59 more ratings, from Jan 29, 2026 on). An album that is in the history more than once takes its latest day, and a Deluxe listing only falls back to the plain album's rating when the plain album is not also in the history, so the two never share one day. The summary now counts ratings. Tap Import rating dates again to apply. Also restores the offline cache file (sw.js), which the previous update accidentally emptied.

## 2026.11.16-ac

FLUID COLORS: the strips are gone. The background behind the artist name is now a liquid: a soft base of all your album colors with big pools of each color on top. A pool is as large as its albums are rated high, and every pool circles the tile at its own speed and wobbles, so the colors flow into each other and the tile always stays covered.

## 2026.11.16-ab

FULL-COVER COLORS: the background behind the artist name is full again, no blobs. Each color is a wide band as big as its albums are rated high (a 10 takes far more room than a 5), three layers of bands at different angles rotate and slide slowly so the colors keep trading places across the whole tile, and a light fade at the bottom keeps the text readable over white.

## 2026.11.16-aa

ALBUM COLOR: a cover whose biggest color is a gradient (blue fading into violet, like HYPERYOUTH) is no longer outvoted by a small hot patch (the red at the bottom). Blue and violet now count as one cool field, and a field covering over 40% of the cover wins over a patch less than half its size. About one cover in twenty changes color; every cover is read again once.

## 2026.11.16-z

ARTIST COLORS MOVE: every color behind the artist name is now its own big soft blob that drifts across the whole card on its own slow path, so no color stays parked at the bottom. The colors are stronger and more saturated (reds read red, not pink), whites and greens from your albums keep their own blob instead of being merged away, and up to six colors show. The fade between artists carries the moving colors along.

## 2026.11.16-y

ARTIST BACKGROUND: the colored background behind the artist name now fades from the last artist's colors into the new ones instead of snapping. It is also redrawn: instead of up to 24 scattered blobs it is a few big soft fields of the artist's colors (similar colors are merged, the most-rated album gets the most room) with a glow behind the record, and the slow drift is gentler so it no longer flickers.

## 2026.11.16-x

ARTIST SWITCH: when you open another artist, its name, stats, filters and album cards now rise in one after another instead of popping onto the page. Same for shows and films. Redraws on the same artist (rating, syncing) do not replay it.

## 2026.11.16-w

FAST CLICKS: if you pick another artist while a record is still on its way to the turntable, that record now turns around from wherever it is and goes back into its own sleeve (or slides back in if it was still coming out) instead of vanishing.

## 2026.11.16-v

RECORD COMES OUT FROM BEHIND THE RING TOO: the selected tile's green ring was being drawn under the record as it slid out. The record now stays hidden behind the ring as well as the cover until it is fully out.

## 2026.11.16-u

RECORD STAYS UNDER ITS OWN TILE: when an artist's record leaves its sleeve for the turntable (and when it comes back), it can cross other albums on the way, but the part that is over its own tile is now always hidden behind that tile instead of flying across the cover.

## 2026.11.16-t

EDGE FIXES: the green ring around the open artist on the wall is no longer clipped on the left edge, and a record sliding out on hover now stops at the end of its sleeve instead of poking past it (it overshot by a few percent, worst on well-heard artists).

## 2026.11.16-s

RATING ANIMATION NO LONGER CUTS OUT: the page redraws itself about a second and a half after you rate (your sync starting and finishing), and that rebuilt the record in the middle of the effect. A redraw now picks the effect up exactly where it was, so it plays through every time.

## 2026.11.16-r

SOFTER ENDING: the rating animation no longer cuts off. The ripple, glint, shockwave and flare run a little longer and fade out gradually, and nothing is removed until it has finished.

## 2026.11.16-q

SMOOTHER RATING ANIMATION: the grooves now swell with a GPU transform instead of resizing every frame, the glows are lighter, and the glint and shockwave sit on their own layers, so the effect should no longer lag.

## 2026.11.16-p

BIGGER RATING ANIMATION: rating a song now sends a bright shockwave ring out from the label to that song's band, the glint trails a longer glow and spins further, the new groove flares much harder, the ripple through the grooves swells and shines more, and the label count gives a bigger bounce.

## 2026.11.16-o

RATING ANIMATION: when you rate a song, the glint that circles the record and the ripple through the grooves now go out only as far as that song's band instead of the whole record. Inner grooves still light up, anything outside the band stays still.

## 2026.11.16-n

RATING HISTORY: a new History tab lists every album, EP and deluxe you have rated as a dated list: the day on the left (31 Aug), the cover, the title and artist, and your stars with the number. Newest first with a heading for each month, or oldest first, or highest first. Search by album or artist, and show just Albums, EPs or Other. Tap the cover or title to open the album; tap the day to change it, and albums with no day yet sit at the bottom with a + Date button so you can fill them in right there.

## 2026.11.16-m

RATING DATES: Settings has a new Rating dates card. Tap Import rating dates and every album you rated gets the day you rated it, read from your rating history (it then shows as Rated Aug 3, 2024 on the banner and the share card). Albums are matched by title, a Deluxe listing lands on the deluxe rating when the album has one, and a day you already have is never replaced. The summary lists albums with no rating here, albums that are not in Playback yet, and any whose rating here differs from the history. Run it again after adding artists or a new batch.

## 2026.11.16-l

LIST SCROLL: on a wide screen the artist list could not scroll far enough to show your last artists. It was a tall box that started low on the page, so its bottom ran off the window, and its scrolling would not pass to the page. The artist column now stays on screen as you scroll and the list fills the rest of the window, so its end is always visible.

## 2026.11.16-k

GREEN COVERS STAY GREEN: ii (Kenny Beats) had a brown banner because the small orange hand at the bottom of the cover won over the big teal field. The bonus that lets a brown or green ground beat a bright sky now only applies when that earthy area is a real share (at least 40%) of the biggest color on the cover. Every cover is read again.

## 2026.11.16-j

SET-DOWN POP: when a record lands on the turntable it no longer pops. The flying record used to vanish in one frame (its shadow, a slightly different sheen and the percent label all changed at once). Now the shadow shrinks as it touches, its sheen matches the landed record, and it fades out over the real record. Every look.

## 2026.11.16-i

PINK BANNERS: a cover with a big soft pastel backdrop and a white frame (The Divine Feminine) was being read as white paper, so its banner came out gray. A pastel field that covers over a third of the art now counts as the cover's color, and gets a little extra color so it reads as pink instead of beige. Busy covers like Don't Be Dumb and bold ones like Blue Slide Park are unchanged. Every cover is read again.

## 2026.11.16-h

COVER COLORS: a middle ground for busy covers. The white-paper banner now only applies when the cover is mostly white and no single color covers more than about a seventh of it. Don't Be Dumb (its biggest color is only about a tenth) stays on the paper, and Blue Slide Park (one blue triangle family is about a fifth) keeps its blue, both with room to spare instead of sitting on the edge. Covers right between the two could still go either way. Every cover is read again.

## 2026.11.16-g

DARK RECORDS: a black or very dark album no longer gives a record you can barely see. On the record only (the banner stays black), a dark color is lifted to a visible charcoal in every look, the soft fade and marble are no longer darkened further for a dark artist, and every record has a faint light rim so its edge reads on the dark card. BUSY COVERS: when a cover is mostly white paper and no single color covers more than about a fifth of it (like Don't Be Dumb), the banner follows the paper instead of picking one of many colors; a big earthy ground area still counts as a color. Every cover is read again with the new rule.

## 2026.11.16-f

SPLATTER: the second splatter is back on a dark tint of your highest-rated album's color (like the original), and the first stays on clear vinyl. LIQUID: the record that flies to the turntable is now finished exactly like the landed one (it was missing the glassy sheen, so detail seemed to appear when it landed), it is no longer scaled up from a small cached picture while it moves, and the paint now drifts much less while it spins up so the record keeps its shape.

## 2026.11.16-e

SPLATTER: redrawn from your photo. Real splatter pressings are hundreds of fine radial streaks, soft at the edges and patchy along their length, with the vinyl showing between them, so that is what both splatter records are now: every rated song owns streaks in its album color (a higher rating means more and wider streaks) and overlapping streaks mix like wet paint. The second splatter is the same paint on white vinyl. LIQUID: the record no longer changes when set down. The label no longer fades in over a black hole as it lands, and the pools now keep their place (they only slip a little while it spins up, then settle) instead of drifting into a different picture. TEXT: banner text is now clearly white or clearly dark, never a gray in between (bright reds like My Beautiful Dark Twisted Fantasy had gray text), and a banner that gets white text is held to a shade where white reads well. COVER COLORS: the ground now anchors a picture. A big earthy area (brown, tan, olive, grass) in the lower part of a cover can win over a vivid sky above it, so 3D Country takes its brown instead of the sky blue; covers without a big lower earthy area pick as before. Every cover is read again with the new rule.

## 2026.11.16-d

LIQUID: the liquid record is now one record everywhere. The paint layout is the same in the sleeve, in the air and on the turntable, so it no longer changes when it is set down; it is two rings of pools so there is never a hole, and very dark colors are lifted slightly so a black album reads as dark liquid. SORTING: changing the release sort no longer breaks the record and colors on the artist card (the record was being cut off inside the page). SCROLLING: the artist wall headings and tiles no longer clip through each other. SPLATTER: both splatter records now look like a real splatter pressing, paint thrown out along spokes from the label to the rim in streaks and dashes, one each; the flung paint look is now the same splatter on white vinyl. RATING SORT: when two releases have the same rating, the one with the higher song average comes first (and last when sorting low to high).

## 2026.11.16-c

RELEASES: under the artist card you can now show just Albums, EPs, Singles or Other, and sort the discography: newest or oldest first, by how you rated it (high or low), most or least heard, or by title. The sort is remembered; the kind resets when you open another artist. SPLATTER: no more neat rings. Each song is thrown at a random spot again, at loose angles with stray drops, but every one looks for room first, so they rarely land on each other. LIQUID: the liquid record now behaves like liquid in a spinning dish. When the record starts the paint is left behind and smears into arcs, catches up, is pushed outward as the speed builds, and keeps slipping slowly round; bubbles drift toward the middle. DARK ALBUMS: a black or very dark album keeps its dark banner, but its song rows now wash in a lighter tone of the same color so the rating gradient shows.

## 2026.11.16-b

RECORD ON THE TURNTABLE: pick an artist on the wall and its record slides out of the sleeve, is carried over and set down on the turntable, then the arm comes across and it spins up. The open artist's sleeve stays empty while its record is playing. SLEEVED BACK: the record you were on is lifted off and slid back into its own sleeve, and its next look slides out from inside instead of snapping to a new design. SPLATTER: every rated song now has a spot of its own, so splatters no longer cover each other and all of them can be seen; higher ratings are still bigger. LIQUID: the liquid records move, the paint drifts and swells and the bubbles wander.

## 2026.11.16-a

THE CRATE: the frame now matches the albums. Music, Screen, Collection and Settings are one switch like Everything / Still to hear, the sync status is plain text, and the artist list has a big title, one search bar with the sort inside it, and a single All / Started / New / Done switch. Each artist is a sleeve with its record sliding out: the more you have heard, the further out it sits. That record is pressed from the albums you rated and is the same one that opens, and an artist gets a new look each time you leave it. SPLATTER: the splatter records were drawn off-center and are fixed. Each splatter is now one song you rated, in its album color, and the higher the rating the bigger the splatter. GROOVE LIGHT: when you rate a song for the first time or tick it heard, its groove on the album record flares as the number lands, a glint runs around the record and the count jumps. The small text on the artist card is also easier to read.

## 2026.11.15-h

CLEAR SPLATTER VINYL: the two splatter records (streak splatter and flung paint) are now pressed on clear vinyl. The black backing is gone, so the glow behind the card shows through the record, with just the grooves, a glassy rim and the paint on top.

## 2026.11.15-g

Rating or clearing an album now updates the artist card colors, glow and record right away, no reopening needed.

## 2026.11.15-f

RANDOM VINYL + BRIGHTER GLOW: each time you open an artist the record picks one of five looks at random (soft fade, marble, streak splatter, flung paint, or liquid), all drawn from the colors of the albums you rated. The glow behind the card is stronger now, with three differently placed color layers that drift and cross-fade so the movement is easy to see.

## 2026.11.15-e

LIVELIER GLOW: the colors behind the artist card now travel farther and faster, with a third layer and a slow fade in and out, so they swirl and breathe instead of just drifting. The colors are pulled in toward the middle so every album you rated stays on the card as they move.

## 2026.11.15-d

BREATHING GLOW: the colors behind the artist card now drift and swell slowly, two layers moving at different speeds, so the card feels alive. They hold still if your phone is set to reduce motion.

## 2026.11.15-c

ARTIST COLORS, SPINNING RECORD, LISTEN LIST BACK: the record now wears the artist’s colors — every album you rated lends its cover color, and the higher you rated it the bigger its wedge on the vinyl and the bigger its glow behind the card (a 1 still shows a little). The record spins up and the arm swings onto it when you open an artist. The Listen list is back as a bookmark button at the top with a count; it opens as a sheet. The album bookmark buttons are back too.

## 2026.11.15-b

NEW FRAME AROUND THE ALBUMS: the artist header is now a record — your heard percentage runs around the vinyl, with the stats under the name and the Everything | Still to hear switch tucked in the same card, tinted with your best-rated album’s color. On a phone the bottom tab bar is a floating pill (the open tab shows its name), and the artist switch and Add an artist are buttons up top instead of boxes in the page. Up next and the Listen list are gone from the Music page; your saved listen list is kept, just not shown.

## 2026.11.15-a

BOLD COLORS WIN BANNERS: a very saturated color on a cover now counts for more, so Blue Slide Park gets a blue banner (from the big blue brushstroke) instead of the tan of its paper and triangles. Covers with one clear color or none look the same as before; covers with a bold accent on a muted background may now take the accent. Every cover reads its color again once.

## 2026.11.14-m

CORNER ALBUM NO LONGER SLIDES OVER THE LETTER HEADER: when you scrolled the artist list, the small favorite-album picture in a tile’s corner (and the rating pill) drew on top of the sticky letter row and the edge of the list. Each tile now keeps its corner pieces to itself, so the header stays in front.

## 2026.11.14-l

APPLE MUSIC IMPORTS: discographies can now be read from Apple Music, with no account, key or Worker needed, so a friend who only has Apple Music (or nothing at all) gets real tracklists and covers instead of MusicBrainz’s. Settings has a new Import source card: Automatic (Spotify when it is connected, Apple Music when it is not), Apple Music, or MusicBrainz only. Apple’s releases are reshaped to look like Spotify’s, so the same rules fold deluxe, clean and explicit editions into one album, keep deluxe songs inside the standard album and leave out remixes and live albums unless you ask. When Spotify says it is out of quota, the error now offers Use Apple Music this time next to MusicBrainz. Apple allows about 20 lookups a minute, so a big artist takes a few extra seconds; tracklists are saved on this device so a repeat run is quicker. Artist photos still come from Spotify, so Apple-only artists show an album cover instead.

## 2026.11.14-k

SHARE RECORD MATCHES THE APP: the record on the share card (still and animated) now has one groove per song like the record in the app, and the songs you have heard light up in the cover’s color. In the animation they light one after another as the record slides out.

## 2026.11.14-j

SEARCH ALBUMS TOO: the search box on the Music tab now finds albums as well as artists. Type part of an album title (or the artist and the title together) and an Albums section appears above the matching artists, with each cover, its artist, year and your rating. Tap one to open that artist and jump to the album. Enter still opens the top artist match, or the first album if no artist matches. Singles stay out of the album results.

## 2026.11.14-i

QUIETER BANNERS: the + collab and + date rated links are gone from every album banner. Add or change a collab credit or the date rated from the ⋯ menu at the bottom of the album; the form opens up on the banner. A collab credit or date you have set still shows on the banner.

## 2026.11.14-h

DATE RATED: an album’s banner now shows the day you rated it (Rated Nov 14, 2026), and so does the share card, under the rating. From now on the day is saved when you set a rating. Albums you rated before today have no day yet, so their banner shows + date rated: tap it, pick the day and save. Tap the date any time to change it, or clear the box to remove it. Rating an album again sets the day to today.

## 2026.11.14-g

ANIMATED CARD NO LONGER GETS CUT OFF IN MESSAGES: iMessage crops very tall pictures, which sliced off the top of the cover and the bottom song rows. The animated card is now padded wider (same artwork, side margins) so its shape fits and nothing is cropped.

## 2026.11.14-f

SHARE SENDS ONLY THE CARD: the share sheet no longer adds the "My album rating for..." text line, so Messages gets just the picture.

## 2026.11.14-e

LONGER SPIN ON THE ANIMATED CARD: the GIF now plays the reveal once (record slides out, ring fills, bars fill, favorites appear), then the record keeps spinning for several more seconds before it slows to a stop on the finished card. It still plays once, so the pull-out never repeats.

## 2026.11.14-d

ANIMATED CARD STOPS: the GIF now plays once and stays on the finished card instead of looping. The record spins up and slows to a stop as the card finishes. If an app loops it anyway, the finished card is held for 30 seconds before it restarts.

## 2026.11.14-c

COPY ON A COMPUTER: on Windows the share window showed Share instead of Copy image, because those browsers report they can share files. A computer now always shows Copy image first with Save beside it, and phones keep Share. If a copy is ever blocked, the message now says why.

## 2026.11.14-b

ANIMATED CARD FIXES: the animated card now includes every song rating (the bars fill in one after another) and follows the Show every song rating switch, and the shine on the spinning record no longer has a hard edge.

## 2026.11.14-a

ANIMATED SHARE CARD: the share window now has Still and Animated. Animated makes a looping GIF of your card: the record slides out of the sleeve and keeps spinning, the rating ring fills as the number counts up, and your favorites fade in. A GIF plays by itself in chats, with no play button. It takes a few seconds to make and shares like the still card. Browsers cannot copy an animation to the clipboard, so on a computer it is Save GIF, then drop the file into your chat.

## 2026.11.13-v

COPY THE SHARE CARD ON A COMPUTER: the share window now has Copy image, so you can paste the card straight into Discord, Messages or an email with Ctrl+V. Save is still there beside it. Phones keep the normal Share button.

## 2026.11.13-u

FAVORITES STAY ON THE FULL CARD: with every song rating shown, your favorite songs now sit in their own line between the album rating and the song list instead of disappearing.

## 2026.11.13-t

SONGS ON THE SHARE CARD: the share card now lists every song with its rating, in track order, each on a bar that fills with the score. Switch off Show every song rating under the picture for the short card with just your favorites.

## 2026.11.13-s

SHARE YOUR RATING: under each album you have rated there is now a Share button. It makes a picture of your rating with the cover, your album number, your song average and your favorite songs, then opens your phone’s share sheet so you can send it to a friend in Messages (on a computer it saves the picture instead). The three dots at the bottom of an album also moved: they now sit in line with the rating circles above them instead of floating at the edge.

## 2026.11.13-r

RATING SLIDES SOONER: the number now starts flying into its circle right after a quick lift, while the slider is still folding away, instead of waiting for it to finish.

## 2026.11.13-q

RATING LANDS IN ITS CIRCLE: when you rate a song or album for the first time and close the slider (Done, or tapping another song), the big number now lifts off the slider and flies into its circle instead of popping in. The ring then draws itself around it and the circle gives a small bump. Changing an existing rating still follows your finger live, as before.

## 2026.11.13-p

DELETE ALBUM FIXED AND TUCKED AWAY: the second tap now actually deletes (it was resetting itself), and the button lives behind a small ... at the bottom-right of each album instead of sitting out in the open.

## 2026.11.13-o

DELETE AN ALBUM: every album now has a Delete album button at the bottom (tap twice to confirm). It removes that one album, its songs and their ratings, and leaves the rest of the artist alone. A later MusicBrainz import of the same artist can bring a removed album back, so use Undo import if that happens.

## 2026.11.13-n

OPENS WHERE YOU LEFT OFF: Playback used to open on the first artist in your list (Radiohead) every launch. It now remembers the last artist or title you had open and reopens it, falling back to the first only if that one was removed.

## 2026.11.13-m

CORNER ALBUM ALWAYS SHOWS: an artist tile now shows your best-rated album in its corner even when the tile picture is that same album cover, which is what Spotify uses for some artists like Mid-Air Thief. Before, the corner was hidden whenever the two matched.

## 2026.11.13-l

SPOTIFY NAMES + MISSING PHOTOS: when an artist goes by more than one name, Playback now shows the name Spotify uses (Mid-Air Thief instead of the Korean spelling) and keeps the other names so your RYM list and searches still find them. The artist-photo lookup used to search only the saved name, so artists saved under a different spelling never got a Spotify photo, and without one the tile could not show your favorite album in its corner. It now tries every name the artist goes by, then fills in the photo and the name. Artists that already have more than one name are checked once, about 25 at a time, and the photo lookup retries earlier misses once.

## 2026.11.13-k

ONE ALBUM, TWO ARTISTS: an album that sits on two artist pages, like An Evening With Silk Sonic on both Bruno Mars and Silk Sonic, is now linked. It stays on both pages, but a rating or a checkmark on either page shows on the other, so you no longer get an empty copy next to the rated one. Playback matches the copies by title when one is credited on the other (with ...) or both came from the same release, and any marks already on one copy move to the shared record. Exports list the album once. Deleting one artist keeps the ratings on the other.

## 2026.11.13-j

SPOTIFY CALL COUNTER: Settings now has a Spotify calls from this device line under the Spotify box. It counts every request Playback sends Spotify, today and over the last 24 hours, split into searches, release lists, albums and so on, plus how many your Worker answered free from its saved copy. Each time Spotify says the quota is used up it records how many calls had gone out in the hour and the day before, so after a day or two you can see the real daily limit and what is using it. It counts this device only, and not the Worker’s hourly check. Copies from your Worker show as free once the Worker has redeployed.

## 2026.11.13-i

LESS SPOTIFY QUOTA USED: albums and artists Spotify has already told your Worker about are now saved there for 30 days and shared by your phone and PC, so a second device (or a rebuild) no longer asks Spotify again. The artist-photo pass now does 25 artists per visit, retries artists with no photo after 2 weeks instead of daily, and stops for at least 6 hours after Spotify says the quota is used up. Needs the updated sync Worker (playback-sync.js, version 10) pasted into Cloudflare; the app works without it, it just will not save the extra quota.

## 2026.11.13-h

EVEN WIDER: on very wide screens the page now uses nearly the full width (up to about 2800px) and the artist wall gets a wider list with bigger portraits.

## 2026.11.13-g

USES WIDE SCREENS: the Music and Screen pages now grow with the window (up to about 1840px) instead of staying a narrow column, and the artist wall gets a wider list with bigger portraits.

## 2026.11.13-f

BIGGER ARTIST WALL: on wide screens the artist list is wider and taller with bigger tiles, so portraits have more room, and the corner album is smaller so it covers less of the photo.

## 2026.11.13-e

CORNER ALBUM: artist tiles in the Wall now show your best-rated album in the bottom-left corner of the artist photo. It only appears once you have rated an album for that artist.

## 2026.11.13-d

GOLDER BANNERS: a banner now takes its color mostly from the cover’s most vivid shades instead of averaging them with the dull ones next to them, so a gold cover like Thee Sacred Souls gets a real gold banner rather than khaki.

## 2026.11.13-c

Album banners now follow the biggest color on the cover even when it comes in several shades, so a mostly-teal cover like ii gets a teal banner instead of one picked off the gold chains.

## 2026.11.13-b

COLLAB CREDITS FILL IN BY THEMSELVES: when you import or check for new releases on an artist, Spotify and MusicBrainz now tell Playback who else is credited on an album, and the banner shows it (with Kenny Beats). Nothing changes until you tap Check for new releases on an artist, and a credit you typed in yourself is never overwritten.

## 2026.11.13-a

COLLAB CREDIT ON THE ALBUM BANNER: an album made with another artist now says so under its title (with Kenny Beats). Albums that RYM credits to a pair, like "Denzel Curry & Kenneth Blume", pick the other name up on their own when they fold into the artist’s page. For any album already in your log, tap + collab under the song count, type the other artist (use & for more than one) and save; clear the box to remove it. A credit you set survives Check for new releases.

## 2026.11.12-h

RYM NAMING FIXES: "Travi$ Scott" and "Travis Scott" are now read as one artist (a $ counts as an S), and any two artists whose names match once case and punctuation are set aside fold together, ratings and songs included. A collab RYM credits as one name, like "Denzel Curry & Kenneth Blume", folds into the member whose page already has that album, so you no longer get an empty copy next to the full one.

## 2026.11.12-g

PHOTO PASS SHOWS ITS WORK: a small pill near the bottom now says which artist just got a photo (or had none), and if the pass stops it says why. It disappears a few seconds after a clean finish and stays up, with an x, if something went wrong.

## 2026.11.12-f

ARTIST PHOTOS ALL AT ONCE: instead of ten artists per visit, the photo pass now works through everyone who is missing one in a single run, about a second and a half apart (roughly two minutes for 80 artists). It still stops quietly if Spotify asks it to slow down, and tries again next time you open Playback.

## 2026.11.12-e

ARTIST PHOTOS ACTUALLY START: the photo pass was skipped for anyone whose Spotify runs through the sync Worker, because it was started after a step that ends early for them. It now starts as soon as Playback opens.

## 2026.11.12-d

ARTIST PHOTOS WAIT THEIR TURN: if an import is running when Playback opens, the photo pass now waits for it to finish and then starts, instead of skipping that visit.

## 2026.11.12-c

ARTIST PHOTOS: each artist tile on the Music tab now shows the artist’s own Spotify photo, falling back to their best-rated album cover and then a colored letter. New imports save the photo; artists you already have fill in a few at a time each time you open Playback (it needs the updated Worker file, playback-sync.js, redeployed).

## 2026.11.12-b

ARTIST WALL: the artist list on the Music tab is now a grid of covers instead of a box of rows. Each artist shows your best-rated album as its cover, your average rating as a small badge, and how much you have heard as a bar along the bottom; a dashed Add an artist tile sits at the end of the grid. On a phone, Switch artist opens the whole list as a full screen with a close button, search, and one Sort menu (Progress, A–Z, Rating, Size) instead of two rows of chips, and on A–Z a letter rail down the right edge jumps to a letter. The Screen tab keeps its list for now.

## 2026.11.12-a

SONGS WITH TYPOS FIND THEIR ALBUM TOO: a hand-made or RYM-made album whose song titles have typos (“Forgotten Battlefied”, “Gestral ViIllage”) used to sit beside the real album forever, with your ratings stuck on it. Now, when at least 3 of its songs each have one clear closest match on the same real album (and that covers most of them), the songs, checkmarks and ratings move onto the real album, and the album rating follows if that album has none. It never moves songs that differ by a number, short titles, a song with two equally close matches, songs spread across different albums, or songs whose ratings disagree with the real one; those stay put. Undo last import puts the artist back.

## 2026.11.11-zd

LONGER-TITLE MATCHING, TIE-BREAK: when an album has two songs that fit a longer title, like “don’t rely on other men” and its deluxe copy “don’t rely on other men (single)”, the plain one now wins, so a rating stuck on “Don’t Rely on Other Men (Album)” moves onto the album song and the stray one-song album copy goes away. If neither or both fit equally, nothing moves.

## 2026.11.11-zc

BANNER COLOR NO LONGER FLIPS: on some covers the banner could flip between dark and light depending on tiny differences in how the cover was read (I LAY DOWN MY LIFE FOR YOU came out pale blue-gray because of the white cross). The rule is now steadier: if the cover has a clear color, the best of those is used; if not (gray, black, cream, white), the banner follows the backdrop around the edge of the art. It also reads the same square of the cover that you see on screen. I checked each test cover 36 slightly different ways and the banner stayed in the same color family every time. Every cover is read again once.

## 2026.11.11-zb

BANNERS FOLLOW THE COVER’S BRIGHTNESS: a pale cover now gets a pale banner (with dark text and buttons) and a near-black cover gets a near-black one, instead of every banner being forced to the same dark middle. The song rows keep a darker copy of the color so their text stays easy to read. Faces no longer set the color: Heavy Metal takes the gray wall behind him, not his skin. Every cover is read again once.

## 2026.11.11-za

BANNERS PICK THE COVER’S REAL COLOR: instead of blending everything on the cover into one average, the app now finds the cover’s main color groups and picks the most vivid one that covers a fair share of it. The Mercurial World deluxe banner is now the purple of its orb instead of a gray-violet, and covers with a clear color get a truer shade of it. Gray, black and cream covers look the same as before. Every cover is read again once.

## 2026.11.11-z

GRAY COVERS, FINISHED: the record’s grooves used to be the same peach on every album, which stood out against a gray banner. They now take the banner’s own hue and amount of color (pale gray on a gray cover, pale rose on a red one), and the glow when they pulse follows. Banners for gray and sepia covers are also a little darker so the cover and title stand out.

## 2026.11.11-y

GRAY COVERS GET GRAY BANNERS: an album with a black-and-white or sepia cover used to get a tan or olive banner, because the color picker pushed even a faint tint up to a minimum amount of color. Banners now follow how colorful the cover really is, so a near-gray cover gets a quiet charcoal banner and colorful covers look the same as before. Every cover is read again once so old banners update.

## 2026.11.11-x

SONGS WITH LONGER TITLES FIND THEIR MATCH: a song whose title only differs by a subtitle in brackets, like “2 + 2 = 5 (The Lukewarm.)” against “2 + 2 = 5”, or “Don’t Rely on Other Men (Album)” against “don’t rely on other men”, now lands on the matching song instead of being left on its own. Your checkmark and rating move with it, so the ratings stuck in Kept from your earlier list and the stray one-song album copies fold back into the real album the next time the app opens. It only does this when exactly one song fits, never when the two songs have different ratings, and (Reprise), (Part 2) and (Intro) still count as different songs. Song ratings from the RYM helper use the same rule, and the import summary lists every song it matched this way so you can check them. If it moves anything for an artist, Undo last import puts that artist back.

## 2026.11.11-w

UPDATE BAR RETRY FIX: right after you tap Reload, if GitHub is still handing out the old copy, the check now waits one quiet minute instead of queuing a new retry on every 30-second look.

## 2026.11.11-v

FASTER UPDATE CHECK: the new-build bar now checks every 30 seconds while the app is open (it was every couple of minutes). Each check reads about 2 KB.

## 2026.11.11-u

UPDATE BANNER KEEPS LOOKING: the “new build is ready” bar used to check only when the app opened or when you came back to it after a few minutes, so it never appeared while you were using it. It now checks every couple of minutes while the app is open, using a tiny file so it costs almost nothing.

## 2026.11.11-t

SMOOTH SLIDER: the rating slider no longer jumps from half number to half number. The thumb and the filled line glide to each new value a moment behind your finger, while the number and the song’s wash keep up live.

## 2026.11.11-s

JUMP BACK, NO SNAP: the grooves jump again as the ripple passes, but by swelling their real size instead of scaling, so they settle without snapping. An opened rating slider now simply starts at its rating instead of climbing from 1.

## 2026.11.11-r

MORE MOTION: the groove ripple no longer lifts the lines, so they cannot snap when it finishes, and it now also plays when you switch to Deluxe or check off a song. Tapping a song settles it with a little press, and its rating slider unfolds out of it (and folds away when you close it); the thumb pops in and grows while you hold it. While you drag, the song’s color wash, number and ring follow the slider live. The listen-list button now sits in the top right of every release’s banner.

## 2026.11.11-q

RECORD PULSE: as a record slides out of its sleeve, a ripple now runs from the label out through the grooves you have heard, lighting each one in turn. The record’s slide is also smoother, so the lines no longer glitch while it moves. Singles lose their Mark all / Clear all button, since they are short enough to tap through, so their header lines up with the other releases.

## 2026.11.11-p

TRUER COLOR, SMOOTHER FADE: the wash behind each song now uses the album’s real banner color instead of a washed-out version, and it eases out gradually with a soft, still visible end at the rating. The stray dark chip and off-center number in the rings are gone. Deluxe: switching to Deluxe now recolors the banner from the deluxe cover, and only the deluxe songs get the deluxe color in their fade; standard songs keep the standard album color.

## 2026.11.11-o

RINGS AND WASH: each song’s heard-check is now a ring that fills to your rating with the number inside (a dot when it’s heard but not rated, empty when you haven’t heard it), and a soft wash of the album’s color fades out behind the row toward the rating. Tap the ring to check a song off; tap anywhere else on the row to rate it.

## 2026.11.11-n

TAP A SONG: tapping anywhere on a song row opens its rating, not just the number, and rating a song you hadn’t checked off counts it as heard. The record no longer slides over the start of the title. Singles lose the empty row: their listen-list and mark-all buttons now sit under the title.

## 2026.11.11-m

SMOOTHER RECORDS AND RATINGS: the record now slides back into its sleeve when you scroll the album’s header off the top of the screen, as well as sliding out as it comes in. The rating bar of grooves is replaced by a clean slider: drag or tap along the line, 1 to 10 in half steps, and it saves when you let go. Clear and Done sit underneath.

## 2026.11.11-l

CLEANER SLEEVES: the Side A and Side B headings are gone from album track lists. The sleeve is softer and lighter, with calmer type, a quieter rating pill and more room. The record now slides out as an album scrolls onto the screen instead of when you touch things, and it no longer jumps or resets when you tap a song or rating.

## 2026.11.11-k

SAFER SYNC: a device that has fallen behind can no longer overwrite the newer log on your other devices. Each upload now says which saved version the device last saw, and your Worker turns it away if the log has changed since then, so you get the choice instead. That choice now shows what each version holds (ratings, songs and when it last changed), puts the fuller one first, and asks for a second tap before keeping a version with fewer ratings. Nothing uploads while the choice is waiting. Your Worker also keeps one dated copy of your log each day for two weeks, so a slip like this can be rolled back. Your log was restored today from Nov 5, plus your vinyl Collection; changes made after Nov 5 could not be recovered.

## 2026.11.11-j

TIDIER RECORDS: the Photos from Discogs strip is gone from opened records, since your own photos fill Open the record now. Open on Discogs moved to the buttons under each record.

## 2026.11.11-i

YOUR OWN PHOTOS: in Open the record, each view has an Add your photo button (front, back, inner sleeve, Side A and Side B labels). Take or pick a photo, drag, zoom and straighten it into the guide, and it is cropped, shrunk and saved by your sync Worker, so it shows on every device. Your photos win over scans and Discogs picks, your front photo becomes the cover in your crate, and a label photo becomes the record’s center label. A label photo also reads the real color of your vinyl from the ring around the label, so the drawn disc matches your copy (Edit details can still override it). Removing a record removes its photos.

## 2026.11.11-h

OPEN THE RECORD: every record in your Collection has an Open the record button. It fills the screen with the sleeve: flip it to the back, slide out the inner sleeve, then pull out the record, which spins, and flip it to Side B. It looks for clean, labelled scans on the Cover Art Archive (MusicBrainz), first for your exact Discogs pressing and then for another vinyl pressing of the album, and remembers what it found. Any Discogs photo can fill a spot with its new Use as… menu (Front, Back, Inner sleeve, Side A or B label). DISC COLORS are closer to the real thing: shade words count, so Red (Deep) is now a dark cranberry, and Edit details has a Disc color picker for when the guess is off.

## 2026.11.11-g

THE CRATE: the Collection tab now looks like the rest of the Sleeve design. Your records sit in a grid of sleeves, and hovering over one (or, on a phone, the edge that peeks out) slides the record out so you can see the vinyl itself: its color, splatter, marble, half-and-half, clear or picture-disc look, drawn from the pressing’s color, with the cover as its center label. Each record takes its color from its cover like albums do. Tap a record to open it: the record spins out of the sleeve, the pressing details sit underneath, and Photos from Discogs shows the back cover, inner sleeves and labels that Discogs owners uploaded for that exact pressing (it uses the same Discogs token as Find a pressing; your Worker learns the photo lookup when it updates itself from GitHub). Each Discogs search result also shows a small disc of that variant.

## 2026.11.11-f

CLEARER PRESSINGS: each result in Find a pressing, and each record in your Collection, now shows its details as labelled fields instead of one run-on line: Region, Catalog #, Vinyl (with a color dot, or Standard when Discogs lists no color), Format, Edition (reissue, limited, deluxe and so on), Label and Year. Results are grouped by catalog number so the same pressing in different regions sits together, and the edition words come along when you add a record.

## 2026.11.11-e

DISCOGS FROM THIS DEVICE: Discogs was turning away searches that went through your Worker (its limit counts every request from the Worker’s shared address, and it was already past it). Under Find a pressing there is now a Discogs token box; with a token saved there, the search runs straight from this device, which has its own limit of 60 a minute. The token stays in this browser only and is never synced, so add it on each device you search from. Without one, or if the browser cannot reach Discogs, it still goes through your Worker.

## 2026.11.11-d

DISCOGS LOOKUP: when Discogs turns a search away as too busy (HTTP 429), your Worker now waits a moment and tries once more, and if Discogs still refuses, the message shows exactly what Discogs said so the cause can be pinned down. Nothing in your collection changes.

## 2026.11.11-c

COLLECTION: a new Collection tab keeps an inventory of the vinyl you own, one entry per physical copy, so two pressings of the same album are two entries. Each one holds the pressing details (year, country, label, catalog number, barcode, format, color or variant, edition), media and sleeve condition, what you paid, when and where you bought it, and notes. Find a pressing searches Discogs for your album and you tap the one that matches your copy (it needs a free Discogs token on your sync Worker as a secret named DISCOGS_TOKEN; the Worker updates itself from GitHub), or use Add by hand with no setup. Records you want go on a Wishlist and Got it moves them to the shelf. An entry shows your Music rating when the album is in your log, and Open jumps to it. Search and sort the list, and export it as a spreadsheet. It syncs with the rest of your log.

## 2026.11.11-b

SLEEVE REDESIGN: every album now looks like a record pulled halfway out of its sleeve. The cover sits on the record, and each groove is a song: the grooves you have heard light up in the album’s own color, which the page picks up from the cover art. Albums split into Side A and Side B, each song is one clean line, and your rating shows as a number. Tap the number (or Rate) to open the groove meter right on that song and tap a groove to rate in half steps; Rate the album works the same way and shows your song average beside it. Setup moved out of the way: Spotify, Rate Your Music, Sync, Your numbers, Export and Backup now live on a new Settings tab, and adding an artist folds into one Add an artist panel. On a phone the Music, Screen and Settings tabs sit at the bottom, and the artist list folds into a Switch artist button so the album is the first thing you see.

## 2026.11.11-a

LISTEN LIST: a new Listen list panel under Up next on the Music tab holds the albums you want to get to. Type an artist and an album to add one (artists already in your log autocomplete), or tap Add to listen list next to Find on RYM under any album, EP or compilation you have not heard yet. Each entry shows its cover and how many songs you have checked off, so it fills in as you listen (Spotify plays count too), and the moment you have heard the whole standard album or given it a rating it moves to the bottom as Heard. Open jumps to the artist, Remove takes an entry off, and Clear the heard tidies up. Albums for artists you have not imported yet are fine: the entry links up by itself once you import that artist. It syncs with the rest of your log.

## 2026.11.10-b

DELUXE EDITIONS WITH THEIR OWN NAMES: Playback no longer needs the word “deluxe” to spot a deluxe album. If a release has the standard album’s title at the front, carries nearly all of its songs and adds more, it is that album’s deluxe edition. So Call Me If You Get Lost: The Estate Sale and OK Computer OKNOTOK 1997 2017 now sit behind the Standard | Deluxe switch on their albums instead of showing up as albums of their own. Re-recordings, live albums and remix sets stay separate. Tap Check for new releases (or Rebuild from Spotify) on an artist to apply it; the rating you gave the old stand-alone deluxe album becomes your deluxe rating and its song checkmarks and ratings move onto the album’s songs. Undo last import puts it back. LOOK: the switch has a sliding thumb, the deluxe view gets a violet header wash, a Deluxe badge and a glowing cover, and its songs ease in one after another. Buttons give a little press feedback. All of it respects reduced-motion settings.

## 2026.11.10-a

FIND IT ON RYM: every album and EP now has a Find on RYM link beside its rating. It opens Rate Your Music’s search for that artist and album in a new tab, so you land one tap from the real page. Nothing is fetched or saved; it is just a link.

## 2026.11.06-a

YOUR NUMBERS: a new Your numbers panel at the bottom of the page (above Export ratings) sums up your ratings: how many albums and songs you have rated and your averages, a bar chart of how you spread your album and song ratings, your top 10 albums, the artists you rate highest, albums you rate better or worse than their songs, and your show and film ratings. Tap any row to jump to it. It is only a view of your log; nothing is saved or changed.

## 2026.11.05-n

UNDO FOR IMPORTS: before any import changes an artist you already have, Playback saves how that artist looked (releases, songs, ratings and checkmarks) on this device. Under the artist’s title, Undo last import (tap twice) puts it back exactly, for 2 weeks. The MusicBrainz fallback button now says plainly when it would replace a Spotify-built list.

## 2026.11.05-m

SPOTIFY IMPORTS ASK LESS: every tracklist Spotify gives you is now saved on this device, so rebuilding an artist only asks Spotify about releases it has not read before (a first import still reads everything). An import that gets cut off keeps what it read and carries on next time. When Spotify says the quota is used up, you now see that plainly, and a Use MusicBrainz this time button imports the artist from MusicBrainz instead (you keep every checkmark and rating).

## 2026.11.05-l

SPOTIFY IMPORT NO LONGER LOOKS STUCK: when Spotify asks for a pause, the import now counts it down (retrying in 12s), slows its pace for the rest of that import so it asks less often, and if Spotify says to wait a long time it stops right away and tells you roughly how long, instead of waiting and failing minutes later. Nothing in your log changes when an import stops.

## 2026.11.05-k

FIX: the page came up blank after the last update. Something that runs at start-up used the new deluxe code before it was ready. It is ready first now, and nothing in your log was touched.

## 2026.11.05-j

DELUXE SWITCH: an album with a deluxe edition now has a Standard | Deluxe switch under its title. Tap Deluxe and the whole release turns violet: the cover and title change to the deluxe edition’s, every deluxe song shows in its place, and the rating becomes a separate Your deluxe rating with a song average that includes the deluxe songs. Your album rating is untouched. Both ratings come out in the album export. Check for new releases on an artist to pick up the deluxe cover and title.

## 2026.11.05-i

ARTISTS WITH TWO NAMES: every artist now remembers the other names they go by (MusicBrainz aliases and the name Spotify uses), shown under the artist’s name as “also…”. Spotify plays, RYM ratings and imports match under any of them, so 공중도둑 and Mid-Air Thief are one artist, and if you already have both they fold into one with every checkmark and rating kept. Artists you already imported fill in their other names by themselves in the background; Check for new releases also tries each name on Spotify.

## 2026.11.05-h

DELUXE SONGS STAY ON THE ALBUM: a song that was released as a single before the album’s deluxe edition now goes into the album’s Deluxe & bonus tracks dropdown instead of staying a single of its own, and the empty single disappears. Tap Check for new releases (or Rebuild from Spotify) on an artist to apply it; checkmarks and ratings move with the song.

## 2026.11.05-g

KANYE’S ALBUMS: Check for new releases on Kanye West now looks him up on Spotify afresh (most popular exact match, under either name) instead of reusing a saved Spotify profile that may have been the wrong one. Press it once and his albums should fill in; ratings and checkmarks stay.

## 2026.11.05-f

DELUXE EDITIONS TUCK INTO THE ALBUM: a studio album with a deluxe edition now keeps its own standard tracklist, and a violet Deluxe & bonus tracks bar under the rating opens the extra songs right inside it, in the deluxe edition’s own order and in a different colour, with their own heard count and a Mark deluxe heard button. The album’s count, bar and song average cover just the standard songs. Nothing changes until you tap Check for new releases (or Rebuild from Spotify) on an artist; checkmarks and ratings stay.

## 2026.11.05-e

KANYE WEST, NOT YE: the artist now shows as Kanye West, including the one you already have and any new import (Ye on MusicBrainz or Spotify still matches him). Releases, songs, checkmarks and ratings are unchanged.

## 2026.11.05-d

FEATURES AND KANYE = YE: songs now show their guest artists under the title (feat. Travis Scott, and so on). Imports from Spotify and MusicBrainz fill them in, and songs you already have show them when the credit is in the title; update an artist (Find on MusicBrainz, Update) to fill in the rest. Kanye West and Ye are now treated as the same artist everywhere: RYM imports, Spotify plays and imports all land on one artist, and if you already have both, they fold into one with every checkmark and rating kept.

## 2026.11.05-c

MORNING BRIEF HOOK: Playback now sends a short list of the next episode of each show you follow (title, episode, air date, nothing else) to your sync Worker, so your morning brief can say which episodes land tonight. It needs the new worker/playback-sync.js pasted into Cloudflare (version 5) and a BRIEF_KEY secret added; the steps are at the top of that file. Until then nothing changes.

## 2026.11.05-b

WHERE YOU STOPPED: every season of a show now says Finished, Caught up (everything out so far is watched, more is on the way) or Stopped at the last episode you watched. The top of the show says where you stopped overall and how many seasons you have finished, and the show list shows the same under each name, so you can see where to pick back up.

## 2026.11.05-a

EXPORT YOUR RATINGS: at the bottom of the page, Export ratings downloads spreadsheets of your album ratings (with the song average beside each), every song rating, and your show, season, episode and film ratings. Below them, Not yet in Rate Your Music lists the ratings you added or changed here, so you know exactly what to type into RYM. Tap Everything is on RYM now once to start tracking, and importing your RYM file or song ratings again keeps it up to date.

## 2026.11.03-f

FIND ARTISTS FAST: the artist list (and shows & films) now has a search box, filters for All, Started, New and Done with counts, and four sorts: Progress (in progress first, then new, then done), A–Z (with letter headings, ignoring “The” and symbols, so $uicideboy$ sits under S), Rating (your album ratings, or song ratings if you have no album ratings) and Size. Each row shows your average rating and a progress bar. The list scrolls in its own box so the rest of the page stays close, keeps its place when you open an artist, and on your phone jumps you down to the artist you tapped. Enter opens the top search match; Esc clears it. Sort and filter are remembered per tab.

## 2026.11.03-e

RATED MEANS HEARD: giving a song a rating now checks it off as heard automatically, and every song you had already rated (including RYM imports) is checked off too. Same for anything else you rate, like an episode or film. To uncheck something, clear its rating first.

## 2026.11.03-d

SEE WHAT SPOTIFY CHECKED OFF: the Spotify box on the Music tab now lists the songs it matched, newest first, with the artist, album, when you played it and how many times. Songs it newly checked off have an Uncheck button in case a play shouldn’t count; ones you had already heard are greyed out. Tap a song to jump to that artist. The list starts from your next Spotify check.

## 2026.11.03-c

TRACKLISTS STRAIGHT FROM SPOTIFY: with Spotify connected, importing or updating an artist now reads their albums, EPs and singles from Spotify itself, so every song listed is one you can actually play, and deluxe or bonus songs Spotify carries show up under their album. Marked songs Spotify doesn’t have move to “Kept from your earlier list”. Open an artist and tap Rebuild from Spotify to switch them over; checkmarks and ratings stay. Paste the updated sync Worker into Cloudflare first (one more time). Also fixed for every import: albums no longer lose a song because an earlier album has one with the same name (a second “Intro”), and “Song (Reprise)” or “(Part 2)” no longer disappear into “Song”.

## 2026.11.03-b

SPOTIFY CHECKS OFF WHAT YOU PLAY, AND WHERE TO WATCH: on the Music tab, connect Spotify once (on your PC) and songs you play there get checked off as heard here, matched to the artists and songs already in your log. Ratings stay yours to set. Once you paste the new sync Worker into Cloudflare and turn on its hourly check, your Worker keeps watching even when the app is closed. On the Screen tab, every show and film from TMDB now shows where it is streaming in the US, plus where to rent or buy it (data from JustWatch), and Up next says which service a show is on.

## 2026.11.03-a

ROOM TO GROW: your log now saves in your browser’s built-in database, which holds hundreds of MB, instead of the roughly 5 MB space it used before (smallest on iPhone), so big discographies and long shows won’t quietly stop saving. If a save ever does fail, a red banner tells you right away. Sync now sends the log compressed, about 5 times smaller, once you paste the new sync Worker code into Cloudflare. Backup & restore shows how big your log is.

## 2026.11.02-c

RATE THE WHOLE SHOW, AND EPISODE DETAILS: every show now has its own overall rating at the top, next to the average of your season ratings and of your episode ratings. Shows from TMDB also bring in their description, genres, network and creators, and each episode shows its name, air date and runtime. Tap an episode name to read its description; they stay folded so nothing is spoiled. Films from TMDB get their description and genres too (tap Refresh from TMDB on a film you already added).

## 2026.11.02-b

RATE EPISODES ONE BY ONE: on a show, each episode is now its own row with a checkmark and a 1–10 rating, like songs on an album. Each season still has its own overall rating, and next to it you see the average of the episodes you rated and how far your season rating is above or below it. The show header counts how many episodes you have rated.

## 2026.11.02-a

SHOWS AND FILMS FROM TMDB: on the Screen tab, search The Movie Database and tap a result. Shows come in with their poster and every season, counting only the episodes that are out, plus the date of the next one. Films get their poster, year and runtime. It needs a free TMDB key once (the steps are on the Screen tab), and it syncs to your other devices. Shows still airing check for new episodes by themselves once a day, or tap Check for new episodes. Shows you added by hand can be linked with Find on TMDB, and every checkmark and rating stays.

## 2026.10.31-a

SONG RATINGS FROM RATE YOUR MUSIC: RYM’s file only has album ratings, so there is now a helper for Tampermonkey on your computer. Open your album pages on RYM (a batch of tabs at a time) and each one saves your song ratings; back on the Music tab, tap Import song ratings. Albums that came in from the file with no songs get RYM’s tracklist, and a later MusicBrainz import keeps those ratings. A song rating you already set here is never overwritten. The helper never loads RYM pages by itself.

## 2026.10.24-a

IDEAS BUTTON: a lightbulb in the top bar opens a list for writing down features you want in this app. Tick them off or delete them. They save on this device and sync in the background, so Claude can read them. On a narrow computer window the tabs other than the current app show just their icons so the button fits.

## 2026.10.23-e

YOUR RATED ARTISTS COME IN: importing your Rate Your Music file now also adds every artist you were missing, with just the albums you rated and those ratings already on them. They have no songs yet; tap Find on MusicBrainz on an artist to fill in the full tracklists, and your album ratings stay put.

## 2026.10.23-d

IMPORT YOUR RATE YOUR MUSIC RATINGS: on the Music tab, pick the CSV you exported from RYM and your album and EP ratings go onto the matching releases. Ratings for artists you have not imported yet are held and fill in by themselves the moment you import that artist. A rating you already set here is never overwritten, and the summary lists anything it could not place.

## 2026.10.23-c

RATE WHOLE ALBUMS: studio albums, EPs, live albums and compilations now have their own 1–10 rating under the title, separate from the song ratings. Next to it you see the average of your song ratings for that release and how far your overall rating is above or below it, which is handy when you are deciding what an album is worth. Singles and B-sides do not get one.

## 2026.10.23-b

IMPORT FIX: the discography import now only counts digital releases, so songs that only exist on CD, vinyl or Japan-only pressings (and so are not on Spotify) stay out. Albums show their standard tracklist instead of every bonus track from every edition (OK Computer is back to its 12 songs); bonus-edition songs only come in if you tick “other versions”. Re-run the import on an artist to apply it; checkmarks and ratings stay.

## 2026.10.23-a

IMPORT A DISCOGRAPHY: search an artist on MusicBrainz, pick the right one, and every official release comes in, sorted into studio albums, EPs, singles, compilations and the rest, with each song listed once (deluxe editions, remasters and repeats on singles fold into the original). Live albums, remixes and alternate versions stay out unless you tick the box. Cover art from the Cover Art Archive. Importing again only adds what’s new; checkmarks and ratings never move. Radiohead’s hand-typed B-side lists can be swapped for the verified list in one tap.

## 2026.10.21-a

JOINS THE SUITE: a teal P with a cassette for its home-screen icon, the same top bar and app grid as Kitchen, Grocery, Lift, DishLog, Protocol, The Rail and Game Log, and the new-version bar — when a newer copy is on GitHub, it slides down from the top; tap Reload.
