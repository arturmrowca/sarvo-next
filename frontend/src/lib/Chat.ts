import {Loadable} from "./generic/Loadable";
import {ChatMessage} from "./chat/ChatMessage";

export class Chat extends Loadable {

  public messages: Array<ChatMessage> = new Array<ChatMessage>();

  constructor() {
    super();
  }
}
