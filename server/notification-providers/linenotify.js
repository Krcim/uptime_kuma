const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const qs = require("qs");
const { DOWN, UP } = require("../../src/util");

class LineNotify extends NotificationProvider {
    name = "LineNotify";

    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            let config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + notification.lineNotifyAccessToken
                }
            };
            if (heartbeatJSON == null) {
                let testMessage = {
                    "message": msg,
                };
                await axios.post("https://notify-api.line.me/api/notify", qs.stringify(testMessage), config);
            } else if (heartbeatJSON["status"] === DOWN) {
                let downMessage = {
                    "message": "\n[🔴 Down]\n" + "Name: " + monitorJSON["name"] + " \n" + heartbeatJSON["msg"] + "\nTime (UTC): " + heartbeatJSON["time"]
                };
                await axios.post("https://notify-api.line.me/api/notify", qs.stringify(downMessage), config);
            } else if (heartbeatJSON["status"] === UP) {
                let upMessage = {
                    "message": "\n[✅ Up]\n" + "Name: " + monitorJSON["name"] + " \n" + heartbeatJSON["msg"] + "\nTime (UTC): " + heartbeatJSON["time"]
                };
                await axios.post("https://notify-api.line.me/api/notify", qs.stringify(upMessage), config);
            }
            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }
}

module.exports = LineNotify;
