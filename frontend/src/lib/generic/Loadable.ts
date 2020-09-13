import {BackendFactory} from "../factory/BackendFactory";
import { Utility } from "../../components/utility";

export abstract class Loadable {

  /** every loadable has to have a model */
  public model : any = null;

  get id(): number {
    return this._id;
  }


  // return id from backend TODO future version, return cached
  /*
    get user_id(): number {
    return this._backend.user_id;
  }
   */

  // setting the ID is only possible by the backend
  set id(value: number) {
    // not allowed, only by backend
    // this._id = value;
  }

  private _id : number;

  private readonly _backend = BackendFactory.Instance;

  constructor() {

    this._id = 20;

    /*
    this.http.get('http://ionic.io', {}, {})
      .then(data => {

        console.log(data.status);
        console.log(data.data); // data received by server
        console.log(data.headers);

      })
      .catch(error => {

        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);

      });
      */
  }


  /**
   * Creates a object from the model by using a reflection. The returned object
   * can than be exchanged with the API
   * @param ignorePrefix variables of the class prefixed with the prefix will not be reflected into the payload
   */
  protected createPayloadFromModel(ignorePrefix : string = "_"  ) : object {

    let allKeys : Array<string> = Object.getOwnPropertyNames(this.model); //["allowNotifications", "phonenumber", ...]

    let payload = {};
    for (let key of allKeys) {

      if (! key.startsWith(ignorePrefix)) {
        // only add if the prefix is not ignored
        payload[key] = this.model[key];
      }
    }

    return payload;
  }

  protected getPreview(endpoint: string):  Promise<object> {
    return this._backend.get(endpoint + "/" + String(this.id))
  }

  protected getFull(endpoint : string): Promise<object> {
    return this._backend.get(endpoint);
  }

  public login(user: string, password: string) : Promise<string> {
    return this._backend.signin();
  }

  //public post(endpoint: string, payload: object) : Promise<object> {
  //  return this._backend.post(endpoint, payload);
  //}

  post(url:string, options: object): Promise<object>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    console.log("url: " + url);
    return  new Promise((resolve, reject) => {
      bf.post(url, options)
        .then((obj) => {
          request_response = JSON.parse(JSON.stringify(obj));
          resolve(request_response);
        })
        .catch((err: any) =>{
          request_response = err;
          reject(err);})
        });
  }

  
  
  // true if data is identical and false if it differs from last request
  hasHash(url:string): Promise<boolean>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    return new Promise((resolve, reject) => {

      // Compare received Hash to stored hash
      let urlHashCheck = url + "?checkChange=hash";
      bf.get(urlHashCheck).then((obj) => {
        
        // Received Hash
        request_response = JSON.parse(JSON.stringify(obj));
        console.log(request_response["md5Hash"])
        let receivedHash = request_response["md5Hash"];
        
        // load request from native storage
        let hasKey = false;
        let storedData = null;
        let storedHash = "";
        Utility.nativeStorage.getItem(url).then(
          data => {
            // Has key
            storedHash = data["md5Hash"];
            hasKey = true;
            storedData = data["response"];

            // Compare hashes
            if(hasKey && receivedHash == storedHash as string)
            {
              resolve(true);
            }
            else
              reject(false);

          },
          error => 
          { 
            console.error(error);
            reject(false);
          });
        });
      });
  }

  /*
  The native storage stores all data that was requested using this get method by storing 
  the key value pair: key = url, value= hash, response

  Now when requesting first a hash request is send to the server who responds with a hash 
  of the message he wants to send 
    - the client compares this hash to the hash he stored from his last request
    - if the hash differs a full request is send and the server responds with full data 
    - else the response from the native storage is used
   */
  _get(url:string): Promise<object>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    // Check Hash
    return this.hasHash(url).then(() => {
      
      // Hashes identical
      // load request from native storage
      return new Promise((resolve, reject) => {
       Utility.nativeStorage.getItem(url).then(
        data => {
          console.log("Loading - from native: " + url);
          let storedData = data["response"];
          resolve(storedData);
        },
        error => 
        { 
          reject(false);
        });
      });
    }).catch(() => {


    // Else return Promise with real request
    return new Promise((resolve, reject) => {

      let urlHashCheck = url + "?checkChange=full";
      bf.get(urlHashCheck).then((obj) => {

              // Read response 
              let strRep = JSON.stringify(obj);
              request_response = JSON.parse(strRep);

              // store this response incl. hash
              let kkey = url; 
              let hash = request_response["md5Hash"]; 
              let vvalue =  {md5Hash: hash, response: request_response};
              Utility.nativeStorage.setItem(kkey, vvalue).then(() => console.log('Stored url!'),
                error => console.error('Error storing item', error)
            );
            console.log("Loading - from request: " + url);
              resolve(request_response);
            })
        .catch((err : any) => {
          console.log(err);
          reject(err);
        })
    });

    });

  }

  get(url:string):Promise<object>
  {
    return this.getDirect(url);
  }

  /* get with no Hash check */
  getDirect(url:string): Promise<object>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    return new Promise((resolve, reject) => {

      bf.get(url).then((obj) => {

              // Read response 
              let strRep = JSON.stringify(obj);
              request_response = JSON.parse(strRep);

              // store this response incl. hash
              resolve(request_response);
            })
        .catch((err : any) => {
          console.log(err);
          reject(err);
        })
    });
  }

  getHash(url:string): Promise<object>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    return new Promise((resolve, reject) => {

      bf.get(url).then((obj) => {

              // Read response 
              let strRep = JSON.stringify(obj);
              request_response = JSON.parse(strRep);

              // store this response incl. hash
              let kkey = url; 
              let hash = request_response["md5Hash"]; 
              let vvalue =  {md5Hash: hash, response: request_response};
              Utility.nativeStorage.setItem(kkey, vvalue).then(() => console.log('Stored url!'),
                error => console.error('Error storing item', error)
            );
            console.log("Loading - from request: " + url);
              resolve(request_response);
            })
        .catch((err : any) => {
          console.log(err);
          reject(err);
        })
    });
  }

  delete(url:string): Promise<object>
  {
    const bf = BackendFactory.Instance;
    let request_response;

    return new Promise((resolve, reject) => {
      bf.delete(url).then((obj) => {
        request_response = JSON.parse(JSON.stringify(obj));
        resolve(request_response);
      })
        .catch((err : any) => {
          console.log(err);
          reject(err);
        })
    });

  }
}
