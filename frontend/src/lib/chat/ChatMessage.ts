import {Loadable} from "../generic/Loadable";
import {ChatMessageState} from "./ChatMessageState";

export class ChatMessage extends Loadable {

  public state : ChatMessageState = new ChatMessageState();
  public text: string;

  constructor() {
    super();
  }
}
