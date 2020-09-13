import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs/Rx";
import { WebSocketService } from "./webSocket";
import { SettingsSingleton} from "../SettingsSingleton";

export interface Message {
  sender_id: number;
  message: string;
}

@Injectable()
export class ChatService {
  public messages: Subject<Message>;
  public eventId: number;

  constructor(private wsService: WebSocketService) {
  }

  public initConnection()
  {

    const globalSettings = SettingsSingleton.getInstance();

      const CHAT_URL = 'ws://' + globalSettings.server_url + ':1991/ws/chat/' + this.eventId.toString() + '/';
    

    this.messages = <Subject<Message>>this.wsService.connect(CHAT_URL).map(
        (response: MessageEvent): Message => {
          let data = JSON.parse(response.data);
          return {
            sender_id: data.sender_id,
            message: data.message
          };
        }
      );
  }
}