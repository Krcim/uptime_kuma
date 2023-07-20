import dayjs from "dayjs";
import timezones from "timezones-list";
import { localeDirection, currentLocale } from "./i18n";
import { TYPE, POSITION } from "vue-toastification";

/**
 * Returns the offset from UTC in hours for the current locale.
 * @param {string} timeZone Timezone to get offset for
 * @returns {number} The offset from UTC in hours.
 *
 * Generated by Trelent
 */
function getTimezoneOffset(timeZone) {
    const now = new Date();
    const tzString = now.toLocaleString("en-US", {
        timeZone,
    });
    const localString = now.toLocaleString("en-US");
    const diff = (Date.parse(localString) - Date.parse(tzString)) / 3600000;
    const offset = diff + now.getTimezoneOffset() / 60;
    return -offset;
}

/**
 * Returns a list of timezones sorted by their offset from UTC.
 * @returns {object[]} A list of the given timezones sorted by their offset from UTC.
 *
 * Generated by Trelent
 */
export function timezoneList() {
    let result = [];

    for (let timezone of timezones) {
        try {
            let display = dayjs().tz(timezone.tzCode).format("Z");

            result.push({
                name: `(UTC${display}) ${timezone.tzCode}`,
                value: timezone.tzCode,
                time: getTimezoneOffset(timezone.tzCode),
            });
        } catch (e) {
            // Skipping not supported timezone.tzCode by dayjs
        }
    }

    result.sort((a, b) => {
        if (a.time > b.time) {
            return 1;
        }

        if (b.time > a.time) {
            return -1;
        }

        return 0;
    });

    return result;
}

/**
 * Set the locale of the HTML page
 * @returns {void}
 */
export function setPageLocale() {
    const html = document.documentElement;
    html.setAttribute("lang", currentLocale() );
    html.setAttribute("dir", localeDirection() );
}

/**
 * Get the base URL
 * Mainly used for dev, because the backend and the frontend are in different ports.
 * @returns {string} Base URL
 */
export function getResBaseURL() {
    const env = process.env.NODE_ENV;
    if (env === "development" && isDevContainer()) {
        return location.protocol + "//" + getDevContainerServerHostname();
    } else if (env === "development" || localStorage.dev === "dev") {
        return location.protocol + "//" + location.hostname + ":3001";
    } else {
        return "";
    }
}

/**
 * Are we currently running in a dev container?
 * @returns {boolean} Running in dev container?
 */
export function isDevContainer() {
    // eslint-disable-next-line no-undef
    return (typeof DEVCONTAINER === "string" && DEVCONTAINER === "1");
}

/**
 * Supports GitHub Codespaces only currently
 * @returns {string} Dev container server hostname
 */
export function getDevContainerServerHostname() {
    if (!isDevContainer()) {
        return "";
    }

    // eslint-disable-next-line no-undef
    return CODESPACE_NAME + "-3001." + GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
}

/**
 * Regex pattern fr identifying hostnames and IP addresses
 * @param {boolean} mqtt whether or not the regex should take into
 * account the fact that it is an mqtt uri
 * @returns {RegExp} The requested regex
 */
export function hostNameRegexPattern(mqtt = false) {
    // mqtt, mqtts, ws and wss schemes accepted by mqtt.js (https://github.com/mqttjs/MQTT.js/#connect)
    const mqttSchemeRegexPattern = "((mqtt|ws)s?:\\/\\/)?";
    // Source: https://digitalfortress.tech/tips/top-15-commonly-used-regex/
    const ipRegexPattern = `((^${mqtt ? mqttSchemeRegexPattern : ""}((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$)|(^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?$))`;
    // Source: https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
    const hostNameRegexPattern = `^${mqtt ? mqttSchemeRegexPattern : ""}([a-zA-Z0-9])?(([a-zA-Z0-9_]|[a-zA-Z0-9_][a-zA-Z0-9\\-_]*[a-zA-Z0-9_])\\.)*([A-Za-z0-9_]|[A-Za-z0-9_][A-Za-z0-9\\-_]*[A-Za-z0-9_])(\\.)?$`;

    return `${ipRegexPattern}|${hostNameRegexPattern}`;
}

/**
 * Get the tag color options
 * Shared between components
 * @param {any} self Component
 * @returns {object[]} Colour options
 */
export function colorOptions(self) {
    return [
        { name: self.$t("Gray"),
            color: "#4B5563" },
        { name: self.$t("Red"),
            color: "#DC2626" },
        { name: self.$t("Orange"),
            color: "#D97706" },
        { name: self.$t("Green"),
            color: "#059669" },
        { name: self.$t("Blue"),
            color: "#2563EB" },
        { name: self.$t("Indigo"),
            color: "#4F46E5" },
        { name: self.$t("Purple"),
            color: "#7C3AED" },
        { name: self.$t("Pink"),
            color: "#DB2777" },
    ];
}

/**
 * Loads the toast timeout settings from storage.
 *
 * @return {Object} The toast plugin options object.
 */
export function loadToastSettings() {
    return {
        position: POSITION.BOTTOM_RIGHT,
        containerClassName: "toast-container mb-5",
        showCloseButtonOnHover: true,

        filterBeforeCreate: (toast, toasts) => {
            if (toast.timeout === 0) {
                return false;
            } else {
                return toast;
            }
        },
    };
}

export function getToastSuccessTimeout() {
    let successTimeout = 20000;

    if (localStorage.toastSuccessTimeout !== undefined) {
        const parsedTimeout = parseInt(localStorage.toastSuccessTimeout);
        if (parsedTimeout != null && !Number.isNaN(parsedTimeout)) {
            successTimeout = parsedTimeout;
        }
    }

    if (successTimeout === -1) {
        successTimeout = false;
    }

    return successTimeout;
}

export function getToastErrorTimeout() {
    let errorTimeout = -1;

    if (localStorage.toastErrorTimeout !== undefined) {
        const parsedTimeout = parseInt(localStorage.toastErrorTimeout);
        if (parsedTimeout != null && !Number.isNaN(parsedTimeout)) {
            errorTimeout = parsedTimeout;
        }
    }

    if (errorTimeout === -1) {
        errorTimeout = false;
    }

    return errorTimeout;
}
