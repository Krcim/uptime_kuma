const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { setSettings, setting } = require("../util-server");
const { getMonitorRelativeURL, UP, flipStatus, DOWN} = require("../../src/util");
const {R} = require("redbean-node");
const dayjs = require("dayjs");

const duration = require('dayjs/plugin/duration')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(duration)
dayjs.extend(relativeTime)


class Slack extends NotificationProvider {

    name = "slack";

    /**
     * Deprecated property notification.slackbutton
     * Set it as primary base url if this is not yet set.
     * @deprecated
     * @param {string} url The primary base URL to use
     * @returns {Promise<void>}
     */
    static async deprecateURL(url) {
        let currentPrimaryBaseURL = await setting("primaryBaseURL");

        if (!currentPrimaryBaseURL) {
            console.log("Move the url to be the primary base URL");
            await setSettings("general", {
                primaryBaseURL: url,
            });
        } else {
            console.log("Already there, no need to move the primary base URL");
        }
    }

    // Keeps track of open alerts in order to update them
    static openAlerts = {};

    /**
     * Builds the actions available in the slack message
     * @param {string} baseURL Uptime Kuma base URL
     * @param {object} monitorJSON The monitor config
     * @returns {Array} The relevant action objects
     */
    static buildActions(baseURL, monitorJSON) {
        const actions = [];

        if (baseURL) {
            actions.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Visit Uptime Kuma",
                },
                "value": "Uptime-Kuma",
                "url": baseURL + getMonitorRelativeURL(monitorJSON.id),
            });

        }

        if (monitorJSON.url) {
            actions.push({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Visit site",
                },
                "value": "Site",
                "url": monitorJSON.url,
            });
        }

        return actions;
    }

    /**
     * Builds the different blocks the Slack message consists of.
     * @param {string} baseURL Uptime Kuma base URL
     * @param {object} monitorJSON The monitor object
     * @param {object} heartbeatJSON The heartbeat object
     * @param {string} title The message title
     * @param {string} msg The message body
     * @returns {Array<object>} The rich content blocks for the Slack message
     */
    static buildBlocks(baseURL, monitorJSON, heartbeatJSON, title, msg) {

        //create an array to dynamically add blocks
        const blocks = [];

        // the header block
        blocks.push({
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": title,
            },
        });

        // the body block, containing the details
        blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Message*\n" + msg,
                },
                {
                    "type": "mrkdwn",
                    "text": `*Time (${heartbeatJSON["timezone"]})*\n${heartbeatJSON["localDateTime"]}`,
                },
                {
                    "type": "mrkdwn",
                    "text": `*After*\n${duration.humanize()}`,
                }
            ],
        });

        const actions = this.buildActions(baseURL, monitorJSON);
        if (actions.length > 0) {
            //the actions block, containing buttons
            blocks.push({
                "type": "actions",
                "elements": actions,
            });
        }

        return blocks;
    }

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        let okMsg = "Sent Successfully.";

        if (notification.slackchannelnotify) {
            msg += " <!channel>";
        }

        try {

            // check if the notification provider is being tested
            if (heartbeatJSON == null) {
                let data = {
                    "text": msg,
                    "channel": notification.slackchannel,
                    "username": notification.slackusername,
                    "icon_emoji": notification.slackiconemo,
                };
                await axios.post(notification.slackwebhookURL, data);
                return okMsg;
            }

            const duration = await Slack.calculateDuration(heartbeatJSON);

            const baseURL = await setting("primaryBaseURL");

            const title = "Uptime Kuma Alert";
            let data = {
                "text": `${title}\n${msg}`,
                "channel": notification.slackchannel,
                "username": notification.slackusername,
                "icon_emoji": notification.slackiconemo,
                "attachments": [
                    {
                        "color": (heartbeatJSON["status"] === UP) ? "#2eb886" : "#e01e5a",
                        "blocks": Slack.buildBlocks(baseURL, monitorJSON, heartbeatJSON, title, msg, duration),
                    }
                ]
            };

            if (notification.slackbutton) {
                await Slack.deprecateURL(notification.slackbutton);
            }

            const response = await axios.post(notification.slackwebhookURL, data);

            console.log({response: response.data});

            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }

    }

    /**
     *
     * @param {object} heartbeatJSON
     * @returns {Promise<null|number>}
     */
    static async calculateDuration(heartbeatJSON) {

        console.log(heartbeatJSON);
        const previousDifferentBeat = await R.findOne("heartbeat", " monitor_id = ? AND status = ? ORDER BY time DESC", [
            monitorJSON.id,
            flipStatus(heartbeatJSON.status)
        ]);

        let durationInMs = null;

        if(previousDifferentBeat){
            durationInMs = new Date(heartbeatJSON.time) - new Date(previousDifferentBeat._time);
        }

        return durationInMs;
    }
}

module.exports = Slack;
