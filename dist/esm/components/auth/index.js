import wwwAuthenticate from 'www-authenticate';
import { merge } from '../../utils/config';
import { statusCode } from '../../utils/protocols/rtsp';
import { Tube } from '../component';
import { MessageType } from '../message';
import { createTransform } from '../messageStreams';
const UNAUTHORIZED = 401;
const DEFAULT_CONFIG = {
    username: 'root',
    password: 'pass',
};
/*
 * This component currently only supports Basic authentication
 * It should be placed between the RTSP parser and the RTSP Session.
 */
export class Auth extends Tube {
    constructor(config = {}) {
        const { username, password } = merge(DEFAULT_CONFIG, config);
        let lastSentMessage;
        let authHeader;
        const outgoing = createTransform(function (msg, encoding, callback) {
            if (msg.type === MessageType.RTSP) {
                lastSentMessage = msg;
                if (authHeader && msg.headers) {
                    msg.headers.Authorization = authHeader;
                }
            }
            callback(undefined, msg);
        });
        const incoming = createTransform(function (msg, encoding, callback) {
            if (msg.type === MessageType.RTSP &&
                statusCode(msg.data) === UNAUTHORIZED) {
                authHeader =
                    'Basic ' + Buffer.from(username + ':' + password).toString('base64');
                const headers = msg.data.toString().split('\n');
                const wwwAuth = headers.find(header => /WWW-Auth/i.test(header));
                const authenticator = wwwAuthenticate(username, password)(wwwAuth);
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
//# sourceMappingURL=index.js.map