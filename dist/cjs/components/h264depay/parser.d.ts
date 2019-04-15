/// <reference types="node" />
import { RtpMessage, ElementaryMessage } from '../message';
export declare function h264depay(buffered: Buffer, rtp: RtpMessage, callback: (msg: ElementaryMessage) => void): Buffer;
