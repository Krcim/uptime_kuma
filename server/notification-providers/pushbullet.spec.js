jest.mock("axios", () => ({
    post: jest.fn(),
}));

const axios = require("axios");
const { UP, DOWN } = require("../../src/util");
const NotificationSend = require("../notification");

beforeEach(() => {
    axios.post.mockReset();
});
const Pushbullet = require("./pushbullet");

describe("notification default information", () => {
    it("should have the correct name", () => {
        let notification = new Pushbullet();
        expect(notification.name).toBe("pushbullet");
    });
});

describe("notification to act properly on send", () => {
    it("should call axios with the proper default data when UP", async () => {

        let response = {
            data: {
                Message: "OK"
            }
        };
        axios.post.mockResolvedValueOnce(response);

        let notif = new Pushbullet();
        let notificationConf = {
            type: "pushbullet",
            pushbulletAccessToken: "token",
        };
        let monitorConf = {
            name: "testing",
        };
        let heartbeatConf = {
            status: UP,
            msg: "some message",
            time: "example time",
        };
        let msg = "PassedInMessage😀";
        let res = await notif.send(notificationConf, msg, monitorConf, heartbeatConf);

        expect(axios.post).toHaveBeenCalledWith("https://api.pushbullet.com/v2/pushes", {
            "body": "[✅ Up] some message\nTime (UTC): example time",
            "title": "UptimeKuma Alert: testing",
            "type": "note",
        }, {
            "headers": {
                "Access-Token": "token",
                "Content-Type": "application/json",
            },
        });
        expect(res).toBe("Sent Successfully.");
    });
    it("should call axios with the proper default data when UP", async () => {

        let response = {
            data: {
                Message: "OK"
            }
        };
        axios.post.mockResolvedValueOnce(response);

        let notif = new Pushbullet();
        let notificationConf = {
            type: "pushbullet",
            pushbulletAccessToken: "token",
        };
        let monitorConf = {
            name: "testing",
        };
        let heartbeatConf = {
            status: DOWN,
            msg: "some message",
            time: "example time",
        };
        let msg = "PassedInMessage😀";

        let res = await notif.send(notificationConf, msg, monitorConf, heartbeatConf);

        expect(axios.post).toHaveBeenCalledWith("https://api.pushbullet.com/v2/pushes", {
            "body": "[🔴 Down] some message\nTime (UTC): example time",
            "title": "UptimeKuma Alert: testing",
            "type": "note",
        }, {
            "headers": {
                "Access-Token": "token",
                "Content-Type": "application/json",
            },
        });
        expect(res).toBe("Sent Successfully.");
    });

    it("should call axios with the proper data when monitor nil", async () => {
        let response = {
            data: {
                Message: "OK"
            }
        };
        axios.post.mockResolvedValueOnce(response);

        let notif = new Pushbullet();
        let notificationConf = {
            type: "pushbullet",
            pushbulletAccessToken: "token",
        };
        let msg = "PassedInMessage😀";

        let res = await notif.send(notificationConf, msg, null, null);

        expect(axios.post).toHaveBeenCalledWith("https://api.pushbullet.com/v2/pushes", {
            "body": "Testing Successful.",
            "title": "Uptime Kuma Alert",
            "type": "note",
        }, {
            "headers": {
                "Access-Token": "token",
                "Content-Type": "application/json",
            },
        });
        expect(res).toBe("Sent Successfully.");
    });

});

describe("notification to act properly on error", () => {
    it("should respond with an axios error on error", async () => {

        axios.post.mockImplementation(() => {
            throw new Error("Test Error");
        });
        let notif = new Pushbullet();
        let notificationConf = {
            type: "pushbullet",
            pushbulletAccessToken: "token",
        };
        let msg = "PassedInMessage😀";

        try {
            await notif.send(notificationConf, msg, null, null);
            expect("Error thrown").toBe(false);
        } catch (e) {
            expect(e.message).toBe("Error: Error: Test Error ");
        }

        expect(axios.post).toHaveBeenCalledWith("https://api.pushbullet.com/v2/pushes", {
            "body": "Testing Successful.",
            "title": "Uptime Kuma Alert",
            "type": "note",
        }, {
            "headers": {
                "Access-Token": "token",
                "Content-Type": "application/json",
            },
        });
    });

});

describe("notification to get proper data from Notification.send", () => {
    it("should call axios with proper data", async () => {
        let response = {
            data: {
                Message: "OK"
            }
        };
        axios.post.mockResolvedValueOnce(response);
        let notificationConf = {
            type: "pushbullet",
            pushbulletAccessToken: "token",
        };
        let monitorConf = {
            name: "testing",
        };
        let heartbeatConf = {
            status: UP,
            msg: "some message",
            time: "example time",
        };
        let msg = "PassedInMessage😀";

        NotificationSend.Notification.init();
        let res = await NotificationSend.Notification.send(notificationConf, msg, monitorConf, heartbeatConf);
        expect(axios.post).toHaveBeenCalledWith("https://api.pushbullet.com/v2/pushes", {
            "body": "[✅ Up] some message\nTime (UTC): example time",
            "title": "UptimeKuma Alert: testing",
            "type": "note",
        }, {
            "headers": {
                "Access-Token": "token",
                "Content-Type": "application/json",
            },
        });
        expect(res).toBe("Sent Successfully.");
    });

});
