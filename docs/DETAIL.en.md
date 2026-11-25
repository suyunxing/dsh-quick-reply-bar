# Quick reply bar

A small button above the composer. Open it and you get a row of phrases; one click sends that phrase.

## Using it

| Action | Result |
| --- | --- |
| Click the collapsed 「Quick replies」 pill | Expands to a horizontal row of phrase buttons |
| Click a phrase | Sends that text immediately (it is not inserted into the draft) |
| Click the chevron at the left | Collapses back to the single pill |
| Click ＋ at the right | Opens the editor; press 「Done」 when finished |
| ↑ / ↓ in the editor | Reorder the button |
| × in the editor | Delete that entry |
| 「Add reply」 | Append a blank entry |
| 「Restore defaults」 | Put the four built-in examples back |

## Editing

Each entry has two fields:

- **Button caption** — leave it empty and the first characters of the text become the caption.
- **Text to send** — sent verbatim when clicked; multiple lines are fine.

Entries with an empty text are hidden from the bar but stay in the editor.

## Where it is stored

- Phrases: browser `localStorage`, key `dsh-quick-reply-bar:v1`.
- Expanded state: `dsh-quick-reply-bar:ui:v1`.

It follows the browser profile, not the profile's config files. Another browser or cleared site data returns to the four defaults.

## Details

- Up to 60 entries, 4000 characters each.
- A half-written draft is stashed and put back after the phrase is sent.
- Buttons go grey while a send is still in flight.
- Colours come from theme variables, so light and dark both follow.
