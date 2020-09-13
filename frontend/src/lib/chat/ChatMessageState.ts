import {ChatMessageTransmitInfo} from "./ChatMessageTransmitInfo";

export class ChatMessageState {

  public sent: Date;
  public receivedBy: Array<ChatMessageTransmitInfo>;
  public readBy: Array<ChatMessageTransmitInfo>;
}
