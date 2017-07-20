const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const discordUrl = process.env["DISCORD_WEBHOOK"];

app.use(bodyParser.json());

app.post('/webhooks/bugsnag', (req, res) => {
    console.log(req.body);
    var bug = req.body;
    try {
        var fields = [];
        const errorTitle = `${bug.error.exceptionClass}: ${bug.error.message}`;
        const method = bug.error.context;
        const appName = bug.project.name;
        const environment = bug.error.releaseStage;
        const errorUrl = bug.error.url;
        fields.push({
            "name": "Error",
            "value": errorTitle,
        });
        if (bug.stackTrace) {
            const errorLocation = `${bug.stackTrace.file}:${bug.stackTrace.lineNumber} - ${bug.stackTrace.method}`;
            fields.push({
                "name": "Location",
                "value": errorLocation
            });
        }
        message = {
            embeds: [
                {
                    "title": `Event in ${environment} from ${appName} in ${method}`,
                    "url": errorUrl,
                    "fields": fields
                }
            ]
        }

        request({
            url: discordUrl,
            method: "POST",
            body: message,
            json: true
        }, (e,r,b) => {
            if (e) throw e;
        });

        res.status(200);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500);
        res.end();
    }
});

const port = process.env["PORT"] || 11337
app.listen(port);
