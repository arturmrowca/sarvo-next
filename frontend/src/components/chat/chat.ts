import {Component, Input, ElementRef, Renderer, ViewChild} from '@angular/core';
import {Loadable} from "../../lib/generic/Loadable";
import {ChatMessageModel} from "../../lib/models/ChatMessageModel"
import { WebSocketService } from '../../lib/sockets/webSocket';
import { ChatService, Message } from '../../lib/sockets/chatSocketService';
import { IonicModule } from 'ionic-angular';
import { Observable } from 'rxjs';
import { timer } from 'rxjs/observable/timer';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { interval } from 'rxjs/observable/interval';

/**
 * Generated class for the ChatComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'chat',
  templateUrl: 'chat.html',
  providers:[WebSocketService, ChatService]
})
export class ChatComponent extends Loadable {

  @ViewChild('contentContainer1') private content1: any;
  @ViewChild('contentContainer2') private content2: any;
  @ViewChild('contentContainer3') private content3: any;
  @ViewChild('contentContainer4') private content4: any;

  @Input() event_id: number;
  @Input() own_user_id: number;
  @Input() _view: any;

  private pageOpen:any; // refresher of the chat
  public textFieldValue: string;
  private showMoreButtonActive: boolean
  private isInitialized: boolean;
  private message = {
    sender_id: this.own_user_id,
    message: "this is a test message"
  };

  private messages: ChatMessageModel[];

  private displayedMessageIds : number[];
  private userIdToNameMap: Map<string, string>;

  constructor(private chatService: ChatService, private _elRef: ElementRef,  private _renderer: Renderer) {
    super();   

    this.userIdToNameMap = new Map<string, string>();
    this.displayedMessageIds = new Array<number>();
    this.textFieldValue = "";
    this.showMoreButtonActive = true;

    console.log('Hello ChatComponent Component');
    this.messages = new Array<ChatMessageModel>();

    this.isInitialized = false;


    // Pull al
    this.pageOpen = setInterval(data => {
        this.loadNewest();
      
      }, 15000)
  }

  refreshAll()
  {
  }

  ionViewDidLeave()
   {
      clearInterval(this.pageOpen); // stop refresh
   }
   ngOnDestroy()
   {
     clearInterval(this.pageOpen); // stop refresh
   }

  ngAfterViewInit() {

    let input = null;

    if( this._elRef.nativeElement.tagName === 'ION-TEXTAREA') {
        input = this._elRef.nativeElement.querySelector("textarea");
    } else {
        input = this._elRef.nativeElement.querySelector("input");
    } 

    if( input ) {
        this._renderer.setElementAttribute(input, 'autoComplete', 'true');
        this._renderer.setElementAttribute(input, 'spellcheck', 'true');
        this._renderer.setElementAttribute(input, 'autocorrect', 'true');
    }

    // refresh
    this.refreshAll();

  }



  ngOnInit() {  
      this.displayMessages();
  }


  private loadNewest()
  {
    // load messages newer than highest id
    var maxId = Math.max.apply(Math, this.displayedMessageIds);
    var n = 0 // if sending 0 -> get newest entries

    this.userIdToNameMap = new Map<string, string>();

    let self = this; // otherwise scope is lost in inner self.get(...) for username lookup
    this.getDirect("event/" + this.event_id.toString() + "/chat/messages/" + maxId.toString() + "/" + n.toString() + "/").then((res: object) => {
        let resArray: Array<any> = Array(res as any);


        // i dont know what kind of typescript fuck this is, res is an array, but typescript wont take it.
        // and converting it to an array causes it to nest the actual array in another array, thus the [0]
        
        for (let val of resArray[0]) {
          

          // get the message id, we need this to determine whether it's already displayed
          let message_id = parseInt(val["id"]);

          if (this.displayedMessageIds.indexOf(message_id) == -1) {
            // not already displayed, display !

            
              // get user name for the given ID
                self.userIdToNameMap.set(val["sender"], val["senderName"]);
                let msg = new ChatMessageModel(val["eventChat"],
                  message_id, val["sentTime"], val["text"], val["sender"], self.userIdToNameMap.get(val["sender"]), self.own_user_id);
                self.messages.push(msg);
                self.messages = self.messages.sort(
                  (a : ChatMessageModel, b: ChatMessageModel) => (a.sentTime.getTime() - b.sentTime.getTime()));

            this.displayedMessageIds.push(message_id);
            
          }

        }
      }
    ).catch((err: object) => {
        console.log("failed getting chat:" + JSON.stringify(err));
      }
    )
  }



  private loadOlder()
  {
    // load older messages than lowest id
    var minId = Math.min.apply(Math, this.displayedMessageIds);
    var n = 5 // number of messages to load

    this.userIdToNameMap = new Map<string, string>();

    let self = this; // otherwise scope is lost in inner self.get(...) for username lookup
    this.getDirect("event/" + this.event_id.toString() + "/chat/messages/" + minId.toString() + "/" + n.toString() + "/").then((res: object) => {
        let resArray: Array<any> = Array(res as any);

        // i dont know what kind of typescript fuck this is, res is an array, but typescript wont take it.
        // and converting it to an array causes it to nest the actual array in another array, thus the [0]
        this.showMoreButtonActive = false;
        for (let val of resArray[0]) {
          this.showMoreButtonActive = true; // true if at least one entry received

          // get the message id, we need this to determine whether it's already displayed
          let message_id = parseInt(val["id"]);

          if (this.displayedMessageIds.indexOf(message_id) == -1) {
            // not already displayed, display !

            
              // get user name for the given ID
                self.userIdToNameMap.set(val["sender"], val["senderName"]);
                let msg = new ChatMessageModel(val["eventChat"],
                  message_id, val["sentTime"], val["text"], val["sender"], self.userIdToNameMap.get(val["sender"]), self.own_user_id);
                self.messages.push(msg);
                self.messages = self.messages.sort(
                  (a : ChatMessageModel, b: ChatMessageModel) => (a.sentTime.getTime() - b.sentTime.getTime()));

            this.displayedMessageIds.push(message_id);
            
          }

        }
      }
    ).catch((err: object) => {
        console.log("failed getting chat:" + JSON.stringify(err));
      }
    )


  }

  private displayMessages() {
    // its a ID but its encoded as string, converting the id to int would just cause
    // type safety issues, and would not speed up the lookup.
    this.userIdToNameMap = new Map<string, string>();

    let self = this; // otherwise scope is lost in inner self.get(...) for username lookup
    this.getDirect("event/" + this.event_id.toString() + "/chat/messages/").then((res: object) => {
        let resArray: Array<any> = Array(res as any);


        // i dont know what kind of typescript fuck this is, res is an array, but typescript wont take it.
        // and converting it to an array causes it to nest the actual array in another array, thus the [0]
        for (let val of resArray[0]) {

          // get the message id, we need this to determine whether it's already displayed
          let message_id = parseInt(val["id"]);




          if (this.displayedMessageIds.indexOf(message_id) == -1) {
            // not already displayed, display !



                self.userIdToNameMap.set(val["sender"], val["senderName"]);
                let msg = new ChatMessageModel(val["eventChat"],
                  message_id, val["sentTime"], val["text"], val["sender"], self.userIdToNameMap.get(val["sender"]), self.own_user_id);
                self.messages.push(msg);


                self.messages = self.messages.sort(
                  (a : ChatMessageModel, b: ChatMessageModel) => (a.sentTime.getTime() - b.sentTime.getTime()));

 


            this.displayedMessageIds.push(message_id);
            
            
          }

        }
      }
    ).catch((err: object) => {
        console.log("failed getting chat:" + JSON.stringify(err));
      }
    )


  return 0;
  }



  sendMsg() {
    console.log("new message from client to websocket: ", this.message);
    this.chatService.messages.next(this.message);
  }

  linkify(inputText) {
    //URLs starting with http://, https://, or ftp://
    var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = inputText.replace(replacePattern1, '<a href="$1">$1</a>');

    //URLs starting with www. (without // before it, or it'd re-link the ones done above)
    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');

    //Change email addresses to mailto:: links
    var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText
}

  public postNewMessage() {
    console.log("posting new msg");
    if (this.textFieldValue.length == 0) {
      return;
    }
    this.textFieldValue = this.linkify(this.textFieldValue);


    // send message via websocket
    let date = new Date();
    this.message.message = this.textFieldValue;

    

    this.messages.push(new ChatMessageModel(
      this.event_id,
      -1,
      date,
      this.textFieldValue,
      this.own_user_id,
      "Me",
      this.own_user_id
    ));
    this.textFieldValue = "";

    this.message.sender_id = this.own_user_id;

    
    
    // post message to DB    
    this.post("/event/" + this.event_id + "/chat/message/",
      {
        "sender": this.own_user_id,
        "text": this.message.message,
        "sentTime": date.toISOString(),
        "receivedBy": [], //this list may not be empty
        "readBy": [] //this list may not be empty
      }).then( (res) => {

      // scroll to bottom
      this.content1.scrollTop = this.content1.scrollHeight;
      this.content2.scrollTop = this.content2.scrollHeight;
      this.content3.scrollTop = this.content3.scrollHeight;
      this.content4.scrollTop = this.content4.scrollHeight;
      
        
    }).catch((err) => {
      console.log("failed posting message" + JSON.stringify(err));
    });
  }
}
