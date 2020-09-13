import { HttpClient, HttpHeaders, HttpParams , HttpXhrBackend } from '@angular/common/http';
import {SarvoSession} from "../SarvoSession";
import { SettingsSingleton} from "../SettingsSingleton"; 
import { Utility } from '../../components/utility';

/**
 * handles all communiation between front- and backend.
 */
export class BackendFactory {

  private readonly _baseUrl : string;
  private readonly _baseUrlWs: string;

  /** the port, must be prefixed by ":", e.g. ":117" */
  private readonly  _port : string;

  /** the version of the api, e.g. "1-0" */
  private readonly _version : string;

  /** the session id, if login was successfull */
  private _session_id : string;
  private _token: string;

  private static _instance: BackendFactory;

  /** header for requests */
  private _headers : HttpHeaders;

  /** the http interface*/
  private _http : HttpClient;

  /** ecapsulates the sarvo session holding username, secret and the session if existent */
  private _ss : SarvoSession;

  /** the session id as string */
  public session_id: string;
  
  /** the local date and time on device */
  public date_time: Date;

  get session_valid(): boolean {
    if (this.session_id == null) {
      return false;
    }
    return this.session_id.length > 0;
  }

  /**
   * private constructor to ensure only 1 socket factory is created globally.
   * future: messages queueing and buffering
   */
  private constructor() {

    const globalSettings = SettingsSingleton.getInstance();

    if (SettingsSingleton.getInstance().prod)
    {
      this._baseUrl = "https://" + globalSettings.server_url; //"http://api.sarvo.io"; "http://main-engine-universum.a3c1.starter-us-west-1.openshiftapps.com"; // "http://192.168.2.115";//
      this._baseUrlWs = "ws://" + globalSettings.server_url; // websocket connection
      this._port = ":443"; // in production: for http needs to be 80; for https 443
    }
    else
    {
      this._baseUrl = "http://" + globalSettings.server_url; //"http://api.sarvo.io"; "http://main-engine-universum.a3c1.starter-us-west-1.openshiftapps.com"; // "http://192.168.2.115";//
      this._baseUrlWs = "ws://" + globalSettings.server_url; // websocket connection
      this._port = ":1991"; // in production: for http needs to be 80; for https 443
    }
    
    this._version = "v1-0";
    this._headers = new HttpHeaders();
    this._ss = SarvoSession.Instance;
    this._session_id = "";
	  this.date_time = new Date();

    // instantiate the http to speed up requests
    //this._http = new HttpClient();
    //this._http.setDataSerializer("json");
    this._http = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest()}));

    // add header infos
    this._headers = this._headers.set('Access-Control-Allow-Origin' , '*');
    this._headers = this._headers.set('Access-Control-Allow-Headers' , '*');
    this._headers = this._headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    this._headers = this._headers.set('Access-Control-Allow-Credentials', 'true');

  }

  /**
   * used for getting an instance of the single, usage like
   * `const fac = BackendFactory.Instance;`
   * @constructor
   */
  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  public signin(): Promise<string> {
      


    // Or to get a key/value pair
    // http://127.0.0.1:8000/v1-0//?username=01805123456&password=sarvosarvo
    return new Promise((resolve, reject) => {
      this._ss.nativeStorage.getItem('credentials').then((userinfo) => {
        this.login(userinfo["username"], userinfo["secret"]).then((session_id: string) => {
          console.log("signin successfull, session_id=" + session_id);
          this.session_id = session_id;
          resolve(session_id);


        }).catch((err) => {
          console.log("login failed!");
          reject(err);
        });
      }).catch( (err: object) => {
        console.log("could not sign in, missing secret! TODO: Redicrect to signup screen");

        reject("request_redirect_tosignup");
      });
    });
  }

  private login(user: string, password: string) : Promise<string> {

    if (this._session_id.length > 0) {
      return Promise.resolve(this._session_id);
    } else {
      let data = {
        "username": user,
        "secret": password
      }
      
      return new Promise((resolve, reject) => {
        console.log("attempting to query url: " + this._baseUrl + this._port + "/" + this._version + "/auth/login/");
        this._http.post(this._baseUrl + this._port + "/" + this._version + "/auth/login/", JSON.stringify(data),
          {
            headers: this._headers
            //params: new HttpParams().set('id', '3'),
          })
          .subscribe(res => {
            if ("session_id" in res) {
              this._session_id = res["session_id"];
              this._token = res["token"];
              this._headers = this._headers.set('Authorization', 'Token '+ this._token);
              //console.log("Got token "+ res["token"]);
              resolve(this._session_id);
              resolve(this._token);
            } else {
              reject("no session in object");
            }
          }, (err) => {
            if (err["status"] == 401){
              reject("autorhization failed");
            } else if ("statusText" in err){
              reject(err["statusText"]);
            } else {
              reject("unknown error");
            }
          });
      });
    }
  }

  private sanitizeURL(url : string) : string {
  // let re = /(?<!:)\/\// ; // negative lookahead, search for  // not preceeded by :
  // let newUrl = url.replace(re, "/")
  //    .replace("+", "%2B")
  //    .replace(" ", "%20");

    let newUrl = url.replace("+", "%2B")
      .replace(" ", "%20");

    return newUrl;
  }

  private checkLoginstateAndLoginIfLoggedOut(endpoint: string) : Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (endpoint == "/auth/register/" || endpoint.startsWith("auth/verify/") ) {
        console.log("no login necessary, about to sign up...");
        resolve(true);
      } else if (this.session_valid) {
        console.log("already logged in, continueing with request...");
        resolve(true);
      } else {
        this.signin().then((res) => {
          console.log("login successfull, continueing with request...");
          resolve(true);
        }).catch((err) => {
          console.log("login error, aborting...");
          reject(false);
        })
      }
    });
  }

  /**
   * Inserts (if not existent) or updates (if existent) an object in the database
   * @param endpoint the enpoint to submit to, e.g. "/event/117"
   * @param payload the payload to be upserted
   * @returns HTTP status code of the request
   */
  public post(endpoint: string, body : object) : Promise<object> {
    return new Promise((resolve, reject) => {
    this.checkLoginstateAndLoginIfLoggedOut(endpoint).then((success) => {
      let endpointURL : string = this._baseUrl + this._port + "/" + this._version + endpoint;
      endpointURL = this.sanitizeURL(endpointURL);
      console.log("POST:  " + endpointURL);
        this._http.post(endpointURL, JSON.stringify(body),
          {
            headers: this._headers
            //withCredentials: true
          })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
      }
    );
  }

  // get request if no login required
  public getOpen(endpoint: string)  : Promise<object> {

    return new Promise((resolve, reject) => {
      let endpointURL: string = this._baseUrl + this._port + "/" + this._version + "/" + endpoint;
      endpointURL = this.sanitizeURL(endpointURL);
      console.log("GET:  " + endpointURL);

        this._http.get(endpointURL,
          {
            headers: this._headers//,
            //withCredentials: true
          })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      
    });
  }

  public get(endpoint: string)  : Promise<object> {

    return new Promise((resolve, reject) => {
    this.checkLoginstateAndLoginIfLoggedOut(endpoint).then((success) => {
      let endpointURL: string = this._baseUrl + this._port + "/" + this._version + "/" + endpoint;
      endpointURL = this.sanitizeURL(endpointURL);
      console.log("GET:  " + endpointURL);

        this._http.get(endpointURL,
          {
            headers: this._headers//,
            //withCredentials: true
          })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
    });
  }

  public put(endpoint: string, body : object) : Promise<object> {
    return new Promise((resolve, reject) => {
    this.checkLoginstateAndLoginIfLoggedOut(endpoint).then((success) => {
      let endpointURL: string = this._baseUrl + this._port + "/" + this._version + endpoint;
      endpointURL = this.sanitizeURL(endpointURL);
      console.log("PUT:  " + endpointURL);

        this._http.post(endpointURL, JSON.stringify(body),
          {
            headers: this._headers
            //withCredentials: true
          })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
    });
  }

  public delete(endpoint: string)  : Promise<object> {
    return new Promise((resolve, reject) => {
    this.checkLoginstateAndLoginIfLoggedOut(endpoint).then((success) => {
      let endpointURL: string = this._baseUrl + this._port + "/" + this._version + "/" + endpoint;
      endpointURL = this.sanitizeURL(endpointURL);
      console.log("DELETE:  " + endpointURL);
        this._http.delete(endpointURL,
          {
            headers: this._headers//,
            //withCredentials: true
          })
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
    });
  }
}
