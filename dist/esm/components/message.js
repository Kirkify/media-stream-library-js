export var MessageType;
(function (MessageType) {
    MessageType[MessageType["UNKNOWN"] = 0] = "UNKNOWN";
    MessageType[MessageType["RAW"] = 1] = "RAW";
    MessageType[MessageType["RTP"] = 2] = "RTP";
    MessageType[MessageType["RTCP"] = 3] = "RTCP";
    MessageType[MessageType["RTSP"] = 4] = "RTSP";
    MessageType[MessageType["SDP"] = 5] = "SDP";
    MessageType[MessageType["ELEMENTARY"] = 6] = "ELEMENTARY";
    MessageType[MessageType["ISOM"] = 7] = "ISOM";
    MessageType[MessageType["XML"] = 8] = "XML";
    MessageType[MessageType["JPEG"] = 9] = "JPEG";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=message.js.map