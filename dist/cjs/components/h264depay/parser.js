"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("../message");
const rtp_1 = require("../../utils/protocols/rtp");
const debug_1 = __importDefault(require("debug"));
/*
First byte in payload (rtp payload header):
      +---------------+
      |0|1|2|3|4|5|6|7|
      +-+-+-+-+-+-+-+-+
      |F|NRI|  Type   |
      +---------------+

2nd byte in payload: FU header (if type in first byte is 28)
      +---------------+
      |0|1|2|3|4|5|6|7|
      +-+-+-+-+-+-+-+-+
      |S|E|R|  Type   | S = start, E = end
      +---------------+
*/
const h264Debug = debug_1.default('msl:h264depay');
function h264depay(buffered, rtp, callback) {
    const rtpPayload = rtp_1.payload(rtp.data);
    const type = rtpPayload[0] & 0x1f;
    if (type === 28) {
        /* FU-A NALU */ const fuIndicator = rtpPayload[0];
        const fuHeader = rtpPayload[1];
        const startBit = !!(fuHeader >> 7);
        const nalType = fuHeader & 0x1f;
        const nal = (fuIndicator & 0xe0) | nalType;
        const stopBit = fuHeader & 64;
        if (startBit) {
            return Buffer.concat([
                Buffer.from([0, 0, 0, 0, nal]),
                rtpPayload.slice(2),
            ]);
        }
        else if (stopBit) {
            /* receieved end bit */ const h264frame = Buffer.concat([
                buffered,
                rtpPayload.slice(2),
            ]);
            h264frame.writeUInt32BE(h264frame.length - 4, 0);
            const msg = {
                data: h264frame,
                type: message_1.MessageType.ELEMENTARY,
                timestamp: rtp_1.timestamp(rtp.data),
                ntpTimestamp: rtp.ntpTimestamp,
                payloadType: rtp_1.payloadType(rtp.data),
            };
            callback(msg);
            return Buffer.alloc(0);
        }
        else {
            // Put the received data on the buffer and cut the header bytes
            return Buffer.concat([buffered, rtpPayload.slice(2)]);
        }
    }
    else if ((type === 1 || type === 5) && buffered.length === 0) {
        /* Single NALU */ const h264frame = Buffer.concat([
            Buffer.from([0, 0, 0, 0]),
            rtpPayload,
        ]);
        h264frame.writeUInt32BE(h264frame.length - 4, 0);
        const msg = {
            data: h264frame,
            type: message_1.MessageType.ELEMENTARY,
            timestamp: rtp_1.timestamp(rtp.data),
            ntpTimestamp: rtp.ntpTimestamp,
            payloadType: rtp_1.payloadType(rtp.data),
        };
        callback(msg);
        return Buffer.alloc(0);
    }
    else {
        h264Debug(`H264depayComponent can only extract types 1,5 and 28, got ${type}`);
        return Buffer.alloc(0);
    }
}
exports.h264depay = h264depay;
//# sourceMappingURL=parser.js.map