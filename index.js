const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const bugsnagWebhook = process.env["BUGSNAG_WEBHOOK"];
const buddybuildWebhook = process.env["BUDDYBUILD_WEBHOOK"];

function assertEnvVariable(variable) {
    if (!process.env[variable]) {
        console.error(`fatal: missing environment variable: ${variable}`);
        process.exit(1);
    }
}

assertEnvVariable("BUGSNAG_WEBHOOK");
assertEnvVariable("BUDDYBUILD_WEBHOOK")

app.use(bodyParser.json());

// Bugsnag
app.post('/webhooks/bugsnag', (req, res) => {
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
            url: bugsnagWebhook,
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

// Hipchat supports: yellow, green, red, purple, gray, random.
function convertHipchatColorToDiscord(color) {
    const COLORS = {
        yellow: 0xF1C40F,
        green: 0x2ECC71,
        red: 0xE74C3C,
        purple: 0x9B59B6,
        gray: 0x95A5A6,
        grey: 0x95A5A6
    }
    if (color.toLowerCase() === 'random') {
        return Math.floor(Math.random() * (0xFFFFFF + 1));
    }
    const resolvedColor = COLORS[color.toLowerCase()];
    if (resolvedColor) {
        return resolvedColor;
    } else {
        throw new Error("invalid hipchat color encountered")
    }
}

function convertHipchatAttrsToDiscordFields(attributes) {
    let fields = [];
    let actions = [];
    for (const attr of attributes) {
        let field = {};
        if (!attr.label && attr.value.label && attr.value.url) {
            actions.push(attr);
            continue;
        }
        field.name = attr.label;
        if (attr.value.url) {
            field.value = `[${attr.value.label}](${attr.value.url})`;
        } else {
            field.value = attr.value.label;
        }
        fields.push(field);
    }
    if (actions.length > 0) {
        let field = {};
        field.name = "Actions";
        field.value = actions.map((attr) => `[${attr.value.label}](${attr.value.url})`).join(" ");
        fields.push(field);
    }
    return fields;
}

// Buddybuild
app.all('/webhooks/buddybuild', (req, res) => {
    const msg = req.body;
    console.log(JSON.stringify(msg));
    try {
        const color = convertHipchatColorToDiscord(msg.color.toLowerCase());
        const message = {
            embeds: [
                {
                    title: msg.card.title,
                    url: msg.card.url,
                    description: msg.card.description,
                    color: color,
                    fields: convertHipchatAttrsToDiscordFields(msg.card.attributes)
                }
            ]
        }

        request({
            url: buddybuildWebhook,
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

// Default

app.use((req, res) => {
    console.log(req.path);
    console.log(req.body);
    res.sendStatus(404);
    res.end();
});

const port = process.env["PORT"] || 11337
app.listen(port);
