import { Loadable} from "./generic/Loadable";
import { Contacts, ContactFieldType, ContactFindOptions, Contact } from "@ionic-native/contacts";
import { SarvoUser } from "./SarvoUser";
import { Injectable } from "@angular/core";
import {Platform} from "ionic-angular";
import { Utility } from "../components/utility";

@Injectable()
export class ManageContacts extends Loadable {

  public receivedData:boolean;
  private _contactsBookContacts: Map<string, SarvoUser>;

  constructor(public contacts: Contacts, public platform: Platform) {
    super(); 
  }

  /*
   * Returns a Promise to an Array of shape: [synchronizedSarvoUsers: SarvoUser, allContactsOfBook:list]
   */
  get contactsSarvoAll() {


    return new Promise<Map <string, SarvoUser>>((resolve, reject) => {
      let findOptions = new ContactFindOptions();
      let searchFields: Array<ContactFieldType> = ["*"];

      findOptions.multiple = true;
      let nameField: string = "name";

      if (this.platform.is("android")) {
          findOptions.hasPhoneNumber = true; // not working on iOS.
          nameField = "displayName";
      }
      findOptions.desiredFields = [nameField, "phoneNumbers", "photos"];

      //this._allContacts = this.contacts.find(searchFields, findOptions)
      this.contacts.find(searchFields, findOptions).then((contacts) => {
          let result = this.syncMySarvoContacts(contacts); // result is contacts list all as sarvo users -> registered users have isRegistered as true

          resolve(result);
      });
      // reject() not applicable in this context
    });
  }

  syncMySarvoContacts(allContacts) {
    // Check whether contacts in phone are Sarvo Users.
    let phoneNumbers = [];
     
    var contactsBookContacts: Map<string, SarvoUser> = new Map<string, SarvoUser>(); // key: phonenumber value: corresponding user
    let noSarvoUsers: Array<SarvoUser> = Array<SarvoUser>();
    let uniqueNoSarvoUsers: Array<SarvoUser> = Array<SarvoUser>();
    var noSarvoUsersNameMapping = new Map<string, string>() // Map hash of phonenumber to name

    //allContacts.sort((a, b) => (a.displayName > b.displayName) ? 1 : -1);

    for (let contact of allContacts) {
      try {        
        for (let num of contact.phoneNumbers) {
          let user = new SarvoUser();
          if (this.platform.is("ios")) {
              
            user.username = contact.name.formatted;

            }
          else {
            user.username = contact.displayName;
          }
          user.phonenumber = num.value.replace(/\s/g, "").replace(/-/g, "");
          phoneNumbers.push(user.phonenumber);
          user.isRegistered = false;
          user.profilePicturePreviewBase64 = "";
          user.profilePictureBase64 = "";

          // store only
          contactsBookContacts[user.phonenumber] = user;

          noSarvoUsersNameMapping[Utility.converter.hash(user.phonenumber)] = user.username;

          noSarvoUsers.push(user);
        }
      }
      catch(e) {
        console.log(e);
      }
    }

    uniqueNoSarvoUsers = noSarvoUsers.filter((object,index) => index === noSarvoUsers.findIndex(obj => JSON.stringify(obj.phonenumber.replace(/\s/g, "").replace(/-/g, "")) === JSON.stringify(object.phonenumber.replace(/\s/g, "").replace(/-/g, ""))));
   
    let uniquePhoneNumbersRaw = phoneNumbers.filter((v, i, a) => a.indexOf(v) === i); 

    // HASH PHONE NUMBERS FIRST
    let uniquePhoneNumbers = []
    let hashToPhonenumber = new Map<string, string>(); 
    for (let phonenumber of uniquePhoneNumbersRaw)
    {
      let h = Utility.converter.hash(phonenumber)
      uniquePhoneNumbers.push(h);
      hashToPhonenumber[h] = phonenumber;
    }

    let payload = {"phoneNumbers": uniquePhoneNumbers}
    var l = [];
    this.post("/curuser/contacts/sync/", payload).then((requestResponse) => {

        for (let user1 of requestResponse as any[]) {

          // Set registered users 
          var user = ManageContacts.deserializeSarvoUser(user1);
          contactsBookContacts[user.phonenumber] = user // replace contact book user with real user
          
          //mySarvoContacts.push(user)
          // set registered users also in Native storage
          var d = {};
          d["name"] = user1["name"];
          if(user1["name"] == "Invited User")
          {
            d["name"] = contactsBookContacts[hashToPhonenumber[user1["phonenumber"]]].username
          }

          d["phonenumber"] = hashToPhonenumber[user1["phonenumber"]];
          d["id"] = user1["id"];
          d["profilePicturePreviewBase64"] = ""; //user1["profilePicturePreviewBase64"]; to big for native storage?
          d["isRegistered"] = user1["isRegistered"];
          l.push(d);

          var x = new SarvoUser()
          x.phonenumber = hashToPhonenumber[user1["phonenumber"]];
          ManageContacts.removeContactClicked(x, uniqueNoSarvoUsers);
        }
        
        // Store registered users to native storage
        Utility.nativeStorage.setItem("contactList", JSON.stringify(l)).then(() => {
          console.log('Stored Contact List!'); //this.receivedData = true;
        },
          error => console.error('Error storing item', error)
        );

        // Store registered users to native storage
        Utility.nativeStorage.setItem("noSarvoUsers", JSON.stringify(uniqueNoSarvoUsers)).then(() => {
          console.log('--------------Stored List of non-Sarvo Users!'); this.receivedData = true;
          console.log(uniqueNoSarvoUsers)
        },
          error => console.error('Error storing item', error)
        );

        // Store registered users to native storage
        Utility.nativeStorage.setItem("noSarvoUsersNameMapping", JSON.stringify(noSarvoUsersNameMapping)).then(() => {
          console.log('Stored List of non-SarvoNameMapping Users!'); 
        },
          error => console.error('Error storing item', error)
        );

    }).catch((err: object) => {
      console.log(JSON.stringify(err));
    });


    //let result = new Array<any>();
    //result.push(mySarvoContacts); // not needed?
    //result.push(contactsBookContacts); // Map of phonenumber to users
    return contactsBookContacts;// Map of phonenumber to sarvouser
  }

  public static deserializeSarvoUser(item: object): SarvoUser {
    let user = new SarvoUser();

    user.id = item["id"];
    user.username = item["name"];
    user.phonenumber = item["phonenumber"];
    user.profilePicturePreviewBase64 = item["profilePicturePreviewBase64"];
    user.isRegistered = item["isRegistered"]

    return user
  }
  

  public static addContactClicked(contact, membersArray: Array<SarvoUser>): Array<SarvoUser> {

    if (membersArray == null) {
      membersArray = new Array<SarvoUser>();
    }

    if (!ManageContacts.isMember(contact, membersArray)) {
      var user = new SarvoUser()
      user.username = contact.username

      if(contact.phonenumber.length<25)
      {
        user.phonenumber = Utility.converter.hash(contact.phonenumber)
      }
      else
      {
        user.phonenumber = contact.phonenumber
      }
      user.id = contact.id
      user.isRegistered = contact.isRegistered
      membersArray.push(user)

    } else {
      membersArray = ManageContacts.removeContactClicked(contact, membersArray);
    }

    return membersArray;
  }

  public static findMember(user: SarvoUser, membersArray: Array<SarvoUser>): number {
    
    // CHECK MEMBER ARRAY FORMAT
    if(membersArray.length == 0)
    {
      return -1;
    }

    if(membersArray[0].phonenumber.length > 25)
    {
      // Need hashed phonenumber
      var target = user.phonenumber
    if(target.length < 25) // need to make it a phonenumber
      {target = Utility.converter.hash(user.phonenumber);}
    }
    else
    {
      // Need unhashed phonenumber
      var target = user.phonenumber
    if(target.length > 25) // need to make it a phonenumber
      {target = Utility.converter.unhash(user.phonenumber);}
    }

    

    const index: number = membersArray.findIndex(item => item.phonenumber == target);
    return index;
  }

  public static removeContactClicked(member: SarvoUser, membersArray: Array<SarvoUser>): Array<SarvoUser> {

    const index: number = ManageContacts.findMember(member, membersArray);

    membersArray.splice(index, 1);
    return membersArray;
  }

  public static isMember(contact: any, membersArray: Array<SarvoUser>): boolean {

    if (membersArray == null) {
      return false
    }

    const index: number = ManageContacts.findMember(contact, membersArray);

    if (index==-1) {
      return false;
    }

    return true;
  }

  public static hasMembers(membersArray: Array<SarvoUser>): boolean {

    if (membersArray == null) {
      return false;
    }

    if (membersArray.length > 0) {
      return true;
    }

    return false;
  }

  getAllUsers(members: Array<Number>): Array<SarvoUser> {
    let userArray: Array<SarvoUser> = [];
    let payload = {"user_ids": members};

    this.post("/user/preview/list/", payload).then((requestResponse) => {

        for (let user of requestResponse as any[]) {
          user = ManageContacts.deserializeSarvoUser(user);
          userArray.push(user)
        }

    }).catch((err: object) => {
      console.log(JSON.stringify(err));
    });

    return userArray;
  }
}
