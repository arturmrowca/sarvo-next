import {Time} from "@angular/common";
import {text} from "@angular/core/src/render3/instructions";

export class ChatMessageModel {
  public sentTime: Date;

  constructor(public eventChatId : number,
              public messageId : number,
              public _sentTime : Date,
              public text : string,
              public sentUserId : number,
              public sentUserName: string,
              public ownUserId : number) {

    this.sentTime = new Date(_sentTime); // ensure that stored property is a date
  }
}
