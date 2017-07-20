# Hookbot

Bugsnag doesn't support Discord webhooks. Hookbot forwards Bugsnag webooks to
Discord ones, using Discord's rich embeds formatting. Recommend hosting this on
Heroku.

Environment variables required:
* `DISCORD_WEBHOOK`: The Discord webhook url from your Discord channel
* `PORT`: Usually provided by heroku.
