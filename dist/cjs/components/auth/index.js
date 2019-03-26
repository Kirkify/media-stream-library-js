"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const www_authenticate_1 = __importDefault(require("www-authenticate"));
const config_1 = require("../../utils/config");
const rtsp_1 = require("../../utils/protocols/rtsp");
const component_1 = require("../component");
const message_1 = require("../message");
const messageStreams_1 = require("../messageStreams");
const UNAUTHORIZED = 401;
const DEFAULT_CONFIG = {
    username: 'root',
    password: 'pass',
};
/*
 * This component currently only supports Basic authentication
 * It should be placed between the RTSP parser and the RTSP Session.
 */
class Auth extends component_1.Tube {
    constructor(config = {}) {
        const { username, password } = config_1.merge(DEFAULT_CONFIG, config);
        let lastSentMessage;
        let authHeader;
        const outgoing = messageStreams_1.createTransform(function (msg, encoding, callback) {
            if (msg.type === message_1.MessageType.RTSP) {
                lastSentMessage = msg;
                if (authHeader && msg.headers) {
                    msg.headers.Authorization = authHeader;
                }
            }
            callback(undefined, msg);
        });
        const incoming = messageStreams_1.createTransform(function (msg, encoding, callback) {
            if (msg.type === message_1.MessageType.RTSP &&
                rtsp_1.statusCode(msg.data) === UNAUTHORIZED) {
                authHeader =
                    'Basic ' + Buffer.from(username + ':' + password).toString('base64');
                const headers = msg.data.toString().split('\n');
                const wwwAuth = headers.find(header => /WWW-Auth/i.test(header));
                const authenticator = www_authenticate_1.default(username, password)(wwwAuth);
                authHeader = authenticator.authorize(lastSentMessage.method, lastSentMessage.uri);
                // Retry last RTSP message
                // Write will fire our outgoing transform function.
                outgoing.write(lastSentMessage, () => callback());
            }
            else {
                // Not a message we should handle
                callback(undefined, msg);
            }
        });
        super(incoming, outgoing);
    }
}
exports.Auth = Auth;
//# sourceMappingURL=index.js.map