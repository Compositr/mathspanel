/** @format */

/**
 * Types
 */
declare type ipcReplyTypes = "version" | "data" | "update";
declare type ipcTypes = "main" | "background";
declare interface ipcReply {
  type: ipcReplyTypes;
  payload?: any;
}

declare interface ipc {
  event: string;
  channel: ipcTypes;
}

declare interface ipcPayload {
  event: string;
  payload?: any;
}
