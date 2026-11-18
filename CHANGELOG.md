# Playback changelog (older builds)

The newest builds live in the `CHANGELOG` array at the top of `index.html` (the live site reads its first entry as the build id). When that array grows past about 25 entries, the oldest move here, newest first, unchanged in wording.

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
