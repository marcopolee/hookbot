# Hookbot

Bugsnag and Buddybuild don't support Discord webhooks. Hookbot forwards their
webooks to Discord ones, using Discord's rich embeds formatting. Recommend
hosting this on Heroku.

# Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Environment variables:
* `BUGSNAG_WEBHOOK`: The webhook url from your Discord channel for Bugsnag messages
* `BUDDYBUILD_WEBHOOK`: The webhook url from your Discord channel for Buddybuild messages
* `PORT`: Usually provided by heroku.

# What does this look like?

### Buddybuild
![Buddybuild](/screenshots/buddybuild.png)

### Bugsnag
![Bugsnag](/screenshots/bugsnag.png)
