/** @format */

declare interface ipcReply {
  type: "version" | "data" | "update";
  payload: any
}
