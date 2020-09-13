import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {SarvoSession} from "../../lib/SarvoSession";
import {BackendFactory} from "../../lib/factory/BackendFactory";
import {HttpResponse} from "@angular/common/http";
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the ApidebugPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apidebug',
  templateUrl: 'apidebug.html',
})
export class ApidebugPage {

  /** holds the reponse from the api in textual form */
  private request_response: string;

  /** holds the reponse after login from the api in textual form */
  private login_result : string;

  private login_state : number;

  /** reflects the request state after it's submission: 1: ok, 2: error */
  private request_state : number;

  private endpoints: Array<Endpoint>;

  private selectedEndpoint: Endpoint;

  /** this will hold the key when a new option is added to the payload of the request  */
  public newKey : string;

  /** this will hold the value when a new option is added to the payload of the request  */
  public newValue : string;

  /** holds the session id after an successfull login */
  private session_id: string;

  /** if auto test is initiated, this will hold the results*/
  private testResults: Array<Endpoint>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.login_result = "not queried yet";
    this.login_state = 0;
    this.request_state = 0;
    this.request_response = "";
    this.endpoints = new Array<Endpoint>();
    this.testResults = new Array<Endpoint>();
    this.session_id = "";

    let ep = new Endpoint();
    ep.url = "curuser/id/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "curuser/full/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "user/5/full/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);
    this.selectedEndpoint = ep; // select this one by default

    ep = new Endpoint();
    ep.url = "/event/";
    ep.type = RequestType.POST;
    ep.options.set("name", "My mamas event");
    ep.options.set("organizer_id", "1");
    ep.options.set("location", "Leierkjjjasten");
    ep.options.set("imageBase64", "1111113333333333");
    ep.options.set("description", "Dies macht Spass. Garantiert!");
    ep.options.set("organization_status", "pending");
    ep.options.set("fixed_date_option_id", "-1");
    ep.options.set("participants", [2,5,8,9,10]);
    ep.options.set("possible_dates", `
      [{
      "date": "12.03.2019",
      "acc_participants": [2],
      "inter_participants": [8,9],
      "dec_participants": [5]
    },
      {
        "date": "13.03.2019",
        "acc_participants": [10,8],
        "inter_participants": [9],
        "dec_participants": [9]
      }]
    `);
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "event/4/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    //ep = new Endpoint();
    //ep.url = "curuser/event/";
    //ep.type = RequestType.GET;
    //this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "/event/1/chat/messages/";
    ep.type = RequestType.POST;
    ep.supported = false;
    ep.options.set("sender", "2");
    ep.options.set("text", "Hallo Ihr Kanacken");
    ep.options.set("sentTime", "2019-03-21T12:03");
    ep.options.set("receivedBy", [5, 3]);
    ep.options.set("readBy", [5]);
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "event/1/chat/messages/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "event/1/dateoptions/";
    ep.type = RequestType.GET;
    ep.supported = false;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "/event/1/dateoptions/";
    ep.type = RequestType.POST;
    ep.supported = false;
    ep.options.set("date", "13.03.2019  12:50");
    ep.options.set("acc_participants", [6]);
    ep.options.set("inter_participants", [6]);
    ep.options.set("dec_participants", [6]);
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "curuser/event/id/";
    ep.type = RequestType.GET;
    ep.supported = false;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "/chat/1/messages/";
    ep.type = RequestType.POST;
    ep.options.set("sender", "2");
    ep.options.set("text", "Hallo Ihr Kanacken");
    ep.options.set("sentTime", "2019-03-21T12:03");
    ep.options.set("receivedBy", [5, 3]);
    ep.options.set("readBy", [5]);
    ep.supported = false;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "chat/1/messages/id/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "/group/";
    ep.type = RequestType.POST;
    ep.options.set("name", "Sportfreunde");
    ep.options.set("imageBase64",  "1223322");
    ep.options.set("imagePreviewBase64",  "98080222");
    ep.options.set("description",  "Cool Boyz");
    ep.options.set("members", "[2,4,6]");
    ep.options.set("created", "2019-03-21T12:03");
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "group/3/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "/group/3/members/";
    ep.type = RequestType.PUT;
    ep.options.set("user_id", "4");
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "group/3/members/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "group/3/members/4/";
    ep.type = RequestType.DELETE;
    //ep.options.set("user_id", "4");
    this.endpoints.push(ep);

    ep = new Endpoint();
    ep.url = "auth/logout/";
    ep.type = RequestType.GET;
    this.endpoints.push(ep);
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad ApidebugPage');
  }

  public removeOptionFromMap(key)  {
    console.log("deleting " + key);
    this.selectedEndpoint.options.delete(key);
  }

  public addOptionToMap(key, value) {
    this.selectedEndpoint.options.set(key, value);
    console.log("option added");
  }

  public getOptionMapValues(): Array<[string, string]> { //
    let tempArray : Array<[string, string]> = Array.from(this.selectedEndpoint.options.entries());
    return tempArray;
  }

  public SendLogin(event) {
    // CLICKSTREAM EXAMPLE
    var ep = new Endpoint();
    ep.url = "/stream/clicks/";
    ep.type = RequestType.POST;
    ep.options.set("user_id", "88");
    ep.options.set("session_id", "abcdegasöfkjds");
    ep.options.set("device_id", "IOS-hans-dieter-fotz");
    ep.options.set("interface_element_id", "left-ok-button");
    ep.options.set("timestamp", "2018-03-31T15:05:34.121314Z");
    ep.options.set("pixel_location_x", 33);
    ep.options.set("pixel_location_y", 43);
    ep.options.set("click_type", "long-and-hard");
    ep.options.set("previous_page", "EventCreate");
    ep.options.set("current_page", "EventDetails");
    ep.supported = false;
    this.SendRequest(ep)
    // END CLICKSTREAM EXAMPLE

    BackendFactory.Instance.signin().then((id : string) => {
      this.login_state = 1;
      this.login_result = "obtained session_id: " + id;
      this.session_id = id;
    }).catch((error_msg : string) => {
      this.login_state = 2;
    })
  }

  public selectEndpoint() {
    console.log("debug " + this.selectedEndpoint);
  }




  public testAll() {
    async function delay(ms: number) {
       return new Promise( resolve => setTimeout(resolve, ms) );
     }



      (async () => {
        for (let ep of this.endpoints) {
          // Do something before delay
          console.log('before delay')

          await delay(2000);

          //your task after delay.
           this.testResults.push(ep);
           this.SendRequest(ep).then((obj) => {
             ep.result = StatusType.Success;
             ep.resultMessage = JSON.stringify(obj);
           }).catch( (err) => {
             ep.result = StatusType.Failed;
             ep.resultMessage = JSON.stringify(err);
           })
           }

          // Do something after
          console.log('after delay')
      })();

  }

  public SendRequest(ep: Endpoint) : Promise<object> {
    const bf = BackendFactory.Instance;
    console.log("attempting new request :" + String(ep.type) + " " + ep.url);
    let options = ep.getOptionsAsJson();

    switch (ep.type) {
      case RequestType.POST: {
        return new Promise((resolve, reject) => {
          bf.post(ep.url, options)
            .then((obj) => {
              this.request_state = 1;
              this.request_response = JSON.stringify(obj);
              resolve(obj);
            })
            .catch((err: any) => {
              this.request_state = 2;
              this.request_response = err;
              reject(err);
            });
        });
      }
      case RequestType.GET: {
        return new Promise((resolve, reject) => {
          bf.get(ep.url).then((obj) => {
            this.request_state = 1;
            this.request_response = JSON.stringify(obj);
            resolve(obj);
          })
            .catch((err : any) => {
              this.request_state = 2;
              this.request_response = err;
              reject(err);
            })
        });
      }
      case RequestType.DELETE: {
        return new Promise((resolve, reject) => {
          bf.delete(ep.url).then((obj) => {
            this.request_state = 1;
            this.request_response = JSON.stringify(obj);
            resolve(obj);
          })
            .catch((err : any) => {
              this.request_state = 2;
              this.request_response = err;
              reject(err);
            })
        });

      }
      case RequestType.PUT: {
        return new Promise((resolve, reject) => {
          bf.put(ep.url, options).then((obj) => {
            this.request_state = 1;
            this.request_response = JSON.stringify(obj);
            resolve(obj);
          })
            .catch((err : any) => {
              this.request_state = 2;
              this.request_response = err;
              reject(err);
            })
        });
      }
      default: {
        break;
      }
    }
  }
}

enum RequestType {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT"
}

enum StatusType {
  Pending = "pending",
  Success = "success",
  Failed = "failed"
}

export class Endpoint {

  public url: string;
  public options: Map<string, any>;
  public type: RequestType;
  public supported : boolean;
  public result : StatusType;
  public resultMessage : string;

  constructor() {
    this.options = new Map<string, string>();
    this.type = RequestType.GET;
    this.supported = true;
    this.result = StatusType.Pending;
    this.resultMessage = "";
  }

  public getOptionsAsJson() {
    return Array.from(
      this.options.entries()
    )
      .reduce((o, [key, value]) => {
        o[key] = value;

        return o;
      }, {});
  }
}
