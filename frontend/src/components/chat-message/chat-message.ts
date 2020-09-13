import {Component, Input} from '@angular/core';
import {ChatMessageModel} from "../../lib/models/ChatMessageModel";
import { DatePipe } from "@angular/common";
import { IonicModule } from 'ionic-angular';

/**
 * Generated class for the ChatMessageComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'chat-message',
  templateUrl: 'chat-message.html'
})
export class ChatMessageComponent {

  @Input() message: ChatMessageModel;

  text: string;

  public get message_is_from_own_user(): boolean {
    return this.message.sentUserId == this.message.ownUserId;
  }

  public get display_name() : string {
    if (this.message_is_from_own_user) {
      return "";
    } else {
      return this.message.sentUserName;
    }
  }

  

  public get display_time() : string {
    let now = new Date();

    /* may be usefull
    let dif = now.getTime() - this.message.sentTime.getTime(); // in ms*/

    if (this.sameDay(now, this.message.sentTime)) {
      // just print time
      return this.message.sentTime.toLocaleTimeString();
    } else {
      // print time and date
      return this.message.sentTime.toLocaleDateString();
    }
  }

  constructor() {
    console.log('Hello ChatMessageComponent Component');
    this.text = 'Hello World';
  }

  private sameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }
}
