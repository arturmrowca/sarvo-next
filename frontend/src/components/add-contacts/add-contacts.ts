import { Component, EventEmitter, Input, Output, IterableDiffers, IterableDiffer } from '@angular/core';
import { ManageContacts } from "../../lib/ManageContacts";
import { SarvoUser } from "../../lib/SarvoUser";
import { Utility } from '../utility';
import { NavController } from 'ionic-angular';
import { IonicModule } from 'ionic-angular';

/**
 * Generated class for the AddContactsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'add-contacts',
  templateUrl: 'add-contacts.html'
})
export class AddContactsComponent {

  private _membersArray: Array<SarvoUser>; // members that are in
  private _sarvoContacts: Array<SarvoUser>; // all contacts -> sarvo contacts have boolean isRegistered=true (the once displayed as belonging to sarvo)
  private _noSarvoContacts: Array<SarvoUser>; // all contacts -> sarvo contacts have boolean isRegistered=true (the once displayed as belonging to sarvo)
  private _sarvoContactsMap: Map<string, SarvoUser>; // all contacts
  private _sarvoContactIds: Array<number>; // stores all ids that are already loaded
  //private _sarvoContactsServer: Array<SarvoUser>; // Sarvo Users that were loaded from the server
  private _allNumbersUsers: Array<SarvoUser>; // stores all contacts in array independent of membership
  private iterableDiffer: any; // differ used to check if variable changed
  private _loading:boolean; // used for loading bar
  private _enteredOnce:boolean;
  private _sarvoContactsSearch: Array<SarvoUser>;

  @Input() membersIn: Array<SarvoUser>;
  @Output() membersOut = new EventEmitter();

  emit() {
    this.membersOut.emit(this._membersArray)
  }

  private mappingData: Map<string, SarvoUser>;
  /*
   * Constructor
   */
  constructor(public navCtrl: NavController, public manageContacts: ManageContacts,
              private _iterableDiffers: IterableDiffers) {
    this.iterableDiffer = this._iterableDiffers.find([]).create(null); // Differ checks if any value changed  calls ngDoCheck
    //this._sarvoContactsServer = new Array<SarvoUser>(); // contacts that are loaded from server
    this._sarvoContactIds = new Array<number>();
    this._sarvoContacts = new Array<SarvoUser>();
    this._sarvoContactsMap = new Map<string, SarvoUser>();
    this._membersArray = new Array<SarvoUser>();
    this._loading = false;

    this.manageContacts.receivedData = false;    
    this.mappingData = new Map<string, SarvoUser>();
    this._enteredOnce=false;
  }

  /*
   * Called on change of certain values
   */
  
  ngDoCheck() {

    if(this.manageContacts.receivedData)
    {
      //this.navCtrl.pop();
      //this.navCtrl.push(this.navCtrl.getActive().component);
    this._loading = false;
    this._loadInitialContactsFromStorage();
    this.manageContacts.receivedData = false;
    }

    // Checks if new data was loaded from the server and adds it if
    let changes = this.iterableDiffer.diff(Array.from(this._sarvoContactsMap.values()));
    if (changes) {
        // add data loaded from server to data from native storage!
        this._loading = false;
    //    this._addDiffContactsFromServer();
    }

    try {
      if(!this._enteredOnce) {

      Utility.nativeStorage.getItem("noSarvoUsersNameMapping").then(mappingData => {
        var newArray = []
        var mapp = JSON.parse(mappingData)
        

        this._membersArray.forEach( (m) => {
          var v = ""
          try {
            v = mapp[m.phonenumber]
            if (v != undefined)
            {
              m.username = v;
            }
          } catch (error) {
            
          } 
          newArray.push(m);
          this._enteredOnce = true;
      });
      this._membersArray == newArray;
        
      },
      error => 
      { 
        
      });
    }
    } catch (error) {
      
    }


  }

  /*
   * Reads initial contacts from storage
  */
  ngOnInit() {
  // Read from Native Storage
  this._loadInitialContactsFromStorage();

  this._membersArray = this.membersIn;
  }

  /*
   * Initially contacts are loaded from native storage, while at the same time synchronization is 
   * requested. If new contacts arrive from the server, their difference is added here. 
   * Further, detailed information that was loaded is added here (e.g. image)
  */
  _addDiffContactsFromServer()
  {
    /*if (this._sarvoContactsServer.length != 0)
        {
          for (let loadedUser of this._sarvoContactsServer)
          {

            var idx = this._sarvoContactIds.indexOf(loadedUser.id)
            if(idx > -1)
            {
              // add missing information
              this._sarvoContacts[idx].profilePicturePreviewBase64 = loadedUser.profilePicturePreviewBase64;
            }
            else
            {
              // add missing user
              this._sarvoContacts.push(loadedUser);
            }
          }
        }*/
  }

  /*
   * Initially contacts are loaded from storage in a reduced version i.e. without image
   * here those are read from storage
  */
  _loadInitialContactsFromStorage(){
    try {
        console.log(Utility.nativeStorage)
      Utility.nativeStorage.getItem("contactList").then(data => {
          this._sarvoContacts = new Array<SarvoUser>();
          this._sarvoContactIds = new Array<number>();
          var requestResponse = JSON.parse(data);

          for (let userData of requestResponse as any[]) {
            var user = new SarvoUser();
            user.username = userData["name"];
            user.phonenumber = userData["phonenumber"];
            user.id = userData["id"]; // unknown users GET ID FROM BACKEND!!!
            user.isRegistered = userData["isRegistered"]
            user.profilePicturePreviewBase64 = "data:image/jpeg;base64,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";//userData ["profilePicturePreviewBase64"]
            this._sarvoContacts.push(user)
            this._sarvoContactsMap[user.phonenumber] = user;
            this._sarvoContactIds.push(user.id)
          }

          this._sarvoContacts.sort((a, b) => (a.username > b.username) ? 1 : -1);
          //this._initializeUsersForSearch()

          },
          
        error => 
        { 
          console.error(error);
        });

      } catch (error) {

      }
      try {
        console.log(Utility.nativeStorage)

        
        Utility.nativeStorage.getItem("noSarvoUsersNameMapping").then(mappingData => {
          this.mappingData = mappingData;
        },
        error => 
        { 
          console.error(error);
        });


      Utility.nativeStorage.getItem("noSarvoUsers").then(data => {
          this._noSarvoContacts = new Array<SarvoUser>();
          var requestResponse = JSON.parse(data);

          for (let userData of requestResponse as any[]) {
            var user = new SarvoUser();
            user.username = userData.model["username"];
            user.phonenumber = userData.model["phonenumber"];
            user.id = -1; // unknown users GET ID FROM BACKEND!!!
            user.isRegistered = false
            user.profilePicturePreviewBase64 = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC6CAYAAAAHx2dCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAA6mSURBVHhe7d1pdBXlGQfwZ+69SQhJIAkQQAiGHTcqSkHBAhWwBKrHLoJYNVqx2sXa4/FLPT2tx9rVD22Pp1XrUUGsSBFxAUVZXRC3iuKCCsSqCFYIZLmAkHtvOm/yDCThLjNz35l5Z+b/67knz5v2g6b/PHnmnU1r0xFAQET4K0AgoEMHxOR7HqdEKkWHE0n+TnalhTHS9P9suu5i/k4wINA+NPbOZVzJN/+0ofTL88fzyn8QaB9wMsC53D3nHJo0rJpX6tOSqVRbRNN4CSrxMsjpbL3hEq7UpbW2trbFYjFegpcuefhZ+rChmVdqUzXcWkrv0Bo6tKeuW7GRNu/ayyt/US3YmKE9pNpIkQ9Vgo1AeyRIYe7M62Aj0C4LapC78yrYCLSLwhJmw4JxI+nn553JK3cg0C4IW5A7c7tTI9AOC3OYO3Mr2Lg4yUEI83Fu/SywD+0QhDm9e+acQ+dKPpXeecjQWlsTbbFYlJcgA8KcXb+ePWjdNRfyKn+JTlcYYoaWDGE2p0hvoq//+Lu8kgcztEQIs3lH9K46e9EqXsmDQEuCMFu3q/kQzVooL9QpfdhAoCVAmO3b3XKIVr63g1f2iTCnkknM0PlCmOV4ev50Gty3klfWGGGORqPo0PlAmOWZvWQdV9YZYRbbz+jQNiHMzrBzRlFE2DiXgg5tA8LsHDs/284nBhFoixBm59265lWuzEmlUlwh0JYgzO547INPuTJHBNoINQJt0ll3reAK3GCleYgDQiPUCLQJ4oebSCR4BaoRM7QIdRKBzq1u8ydcgdusdGkR6hj2obObtHYHbXnjNV6BF25etYmr3ESoEegMFrzyCR386B1egVeeq9/NlTkIdBqiM78fb6W2JOZmFbxc/xlXuSHQ3XzvxY/bv8a3bWn/Ct67ftUrXOWGQLP6hqb2zrznSBJhVtBrH+/iKjsEml2+xZ/PlguLBSs3c5Vd6AO9fV9HZzZgbva30Ae67q2unRk7G/4W2kAbM3NnR/fu4QpUZOZES2gDnW5mPrrvC67Ar0IX6B1pOrOAnQ1/mP/IGq7SC12gr8Ruhq+9t7eRq/RCE+gPu+1mQDCFJtBXd9vNgGAKfKAzzcydYX72l3lLnuPqRIEPNGbm4Nmmj4+ZRIL6FIPtJjozBE8kmTx+x2yQ1JnszImm/VxBEARy5Ji5YSdXuX21G7dYBUkkGg1WpsWYcTCp/hgVLS6h0lPGHfuUjBrL/w2Ycfu617nqKlCPApush9nqv4zbOxxF/QdRQWUVr9LDros56R4bFpj2LDqzyr+ZPQbVtHfiXGEWjK4N1gUi0LM21nOlpp7DT6VYrwpemYdQW+f7QIvO3JxQd6emuGY0RQqLeGUdQm2NrwPth33maHFPrsANvg20H8Isq7uiS5vny0DPeV7tmRm847tAi858oDWYZzezQZc2x1eB9sOYAd7yTaARZu9ECgrb/0KUjDqj/aumr1UV6fw4f1Vd9ELH47nAZZrWHuCeI07rWEZj7V9L9LX4vipjkPGw8/YHnqt+5lt05n1Hj7+cHJxXMnpsR2DHnMnfyUyFYIsMG5+IePK5qjBmuE+EU4tYz4Tboa4sPn6ySmTY+Cg7QyPM7hNXAObDzVBvXHARV10pGWjsM3ujuGYUV/aJqwm9pFygRWcO4z6z12R1V3E1YWHVSbxyn1KBxpgRDIV9+nPljGyvT1Ym0AgzyKBEoDEzgyyeB3ra+p2YmUEaTwM9VQ/z0VRgbmkEBXgWaBHmVoQZJPMk0N/aWI8wgyNcD7TozC0K3wMoi9fXN4SVq4EWB4DozOAk1wI9dZ2aB4BOdFItVsAVuM2VQLd35uA8oCmnkpGncwVuczzQftiaw7wbHI4GOowzM345vOVIoMXrhkWY/XTSRAQx3zAizN5zJNALtu7z7RlAO6E0Ho0L3pMa6D+/u6f9qjm/jxlGt9ZiHTeFpqMVFBz738m4MB7kkBroJ744yFUwlIzsuG3f+HR+SHnJCOxkqEhKoMVLLc/TO3PQD//QidUXSUkYD8RLLXEBKHhFZNj4RNra7EexbvN/cacJeE5k2Pjk9VyO7QcTXAF4J+/ncjTF4+jMoCRbgb5jR+ZX0wJ4yVag1+87zBUEgZln2PmF5UCLLToIGE3jwv8sB1ps0YE3Csr7cCVPYd8BXAWDpUA3tcS5Ai8UDRzClTyF/QZyFQyWAt27rJQr8Io47Q6Z2ToohGAI4i8HAu1DMoIY1E5vKdAtcczQqhCBtBvKoIZZsBToslLM0KqxEs58fgn8wvLIcXqZuq/0CisjqMVDRvB3ugpDkA1am43XYOE6Dsglvm0LV/L54oHnADLYCvTLM9L/aQPwWiSZtHeB/w1De3EF0FV1sbvvvhQZNj62R475w6vopzUINXQl/novnTyUV/KNrMyeuUg0an+M/sGIKvrFMIQaOowscf4hlcUFJ3Z/kWHjk/dB4dxhVfS7MRW8grBaNWEALTr3ZF4556G5M7hKT8ouxzcH96FbRyPUYXVSjyhV9Op60i3b1pqTpARauKC6D92mh7o4GpyLxSE3MTM/el76mfn8GrnXWpv5JZEWaGGGHupfj0SnDouBRdl3M/564Te4co/UQAtTB1fSP8b2pZ55HGyC+lZPHEDLv5F7N2NydRVX+TE7wtg69W3Gms8a6E87GulQMugPCAuf6uIYLZ1cw6vcPt+3n2qXrOOVdVbmcccCbZj9fD014k2xgZHPWeKxdy7jypxNV9VSmcW7pBwPdHNLnC5980uEOgBimkYvTB/OK/vMBNvuLonjgTbM3FBPB22eZgfvrZzQnyp7lfFKXa4dud0ysrd+oIgtPT8aos/Mfgiz4FqHNtTqM3UTxg/f8NuVla7vrS0e14/KC7Cl5wd9C929ak4G1zu0YfqGnXQYW3rKWjWxP1WU+WPM6MyzVvn7MZWYqRU1vGeBL8MseNahDbUb9Zk6gZlaFX6/GymSTCa59MaDmKmVUZXj2gxViQwbHy2ZTLVFIt7/6Z+hz9Q4Te6dZWdX0aAKf96s0fnFVxEVwizcPqaCihT5ZwmbXrGIb8MsiAwf+/D3PDf4wLv0w8UjqDARrJd3qk7MzKunDeOV/ykT6A13TG3/Wrf861TU2tJeg7P6+3RmzsbzXY7Ghv/RUzefeGfDvfO2UiJWzCuQbak+M1f7eMzIxPMOnS7MwoxXb6ZY8givQKaopgUyzIJnHfrLT7fRs785lVeZLfz+G3S4qDevIF9+32fOxbMObSbMwhUrJuJAUZJ+hcHf73e9Qzcd2EdP3tSPV+bdO+8dfabuwSuwavn4KhpYHvyHArn+K2snzMKsTT+hWAIv/LRDnIkNQ5gF1zr0x288QS/9/WJe2bfwkv/Q4cJw/J8jQ9Bn5u5c69AywixctWy8PlMf4hVk48frmfPleIeOtzQR3V9OK97ib0hy76X6TB3FTJ3JkxP6U1+f3DYlk/MdWg+zUHt6+xdpal/8EWbqDMSz5sIYZsGxDh3fupBow9W8Ok52p75v3tt0NNaTV/DsOQNC/bYyRzp0fPfWtGEWvnMmF5Jcs/Rr1KO1mVfhVhaLhP7Ve9I7dLx+PdFT03mVGWZquZ6eOIDK8S52uR06/s5iU2EWZp7ChSS1L16vz9Rf8SpcBhRFEWYmrUPH3/0X0brLeWWe7E59/9w36UhBeA6IwrbPnIuUDh3fsdpWmAXZM3XdY2dR8dFwzNSVIbg2wyo5P5FVtVzYIzPU0YQ+T1c38Sq4rq4upZVTgnOniSx5jRzx95YQrb2MV/nRNKLHJLxN94oHOv51Xvh8P/32owN0MIA33mLMyCy/Di0pzIL4tZqd58mXSdc/yhXRlEGVdNuYSl4FhzgAhMy0RCLRFo1a+yHFtz5ItKGOV/LZOVA0OnN3jc1xmr/ly0A8IDLsJ00y6fxsmYgm/tZb5WCYBasz9cRrH+bqROW9SumZqf6fNa89uQxhzkBk+NjHygwdb9xLtEjOS2ByEf9Uj7/Niywydebu1n7WQH/06TtfMDObZ22GdinMgvjDkevky/gr/8lVbuKVc78a1XGhlJ9gZrbGVIeOv/9vojXzeOW+dDO12c7cXWNLC1325l5fvPMFndk6cx3awzAL3WfqCdcs5sq68rIyemice39p7LpOn5nBuqwdOt68n+iBPrzylhh9n9RnarudubuNuxro9u1qztTozPZl79CKhFkQz0afMe8mXuVv2mB9plbwNc5+faStKtJ26PhHq4ie+Tav1FB6ozOd9EBzC83fspeaFZip0Znzl75DKxZmmnI3F/JV9Cqj1QrsU984FHeyy3BCh47/Ta1nNDvVmbvbvEdc+9Hoye4HOrM8XTp0/J6+XCliyl1cOO/cgZX0yNlV1DtmbWs+X+JF8CCPlkql2ozT3yp1Z7c6czqzNtZTs8MvMhIvK3hpOjqzbBE90FwqpHw0F964dXQ5lTj8yrmTsJvhCK21tbUtFosdeyCM17zszN1NWruDK7lw1ZxzIrqOSoEw04wlXKjBiYM1sc+MMDvn2C6H1/OzSp25O1md+pmJA6g37s52lLuH9JmUDuFCTT+TsEc8qEcMYXaB5x1a5c7c3dT1O6m100sezRA/1U3YZ3bN8Q7NW3euumA5F/7w/PnDLc3VfzmtkpaP788rcMPxDt3UQLTQvRMrfurM2dQ3NNFDn8ep4WiKJlcW0aSKHjQ4oG+Y8oMup75dGztGXEqlc9Ta0YBgcD3QQenMoKauuxw1cl4bkdG0+7gAcEaXDi3EF51C1PgBr+RBZwY3nLAPXVq3jSuJai7iAsBZJ3Rog6x5Gp0Z3JTxTKGUIM56nAsAd2Ts0Ib4zrVEK2fyyqS5W6l04Bm8AHBPzkAb4pv/QPTaLbzKoHy0PoPLP6AEMMt0oAH8QI2r7QAkQaAhMMSwgUBDYIgHnyPQEAiJRJI0LYJAg/91hJkoGkWgIQA6wtzxWAhs20GgoEOD73XuyQg0+J7Y3UhxqBFo8D0xP6c41JihIRBEjJPJJP0fHloItO+0PIcAAAAASUVORK5CYII=";//userData ["profilePicturePreviewBase64"]
            //this._noSarvoContacts.push(user)
            if (!this.isMember(user, this._sarvoContacts)) {
              this._sarvoContacts.push(user)
            }
          }

          this._sarvoContacts.sort((a, b) => (a.username > b.username) ? 1 : -1);
          this._initializeUsersForSearch()
        },
          
        error => 
        { 
          console.error(error);
        });

      } catch (error) {

      }
  }
  

  mapMemberName(member:SarvoUser)
  {
    // this.mappingData # phone number to memberName
    return member.username;    
  }

  /*
   * on contact clicked
   */
  onContactClicked(contact, membersArray: Array<SarvoUser>): void {
    this._membersArray = ManageContacts.addContactClicked(contact, membersArray);
  }

  /*
   * on contact remove clicked
   */
  onMemberClicked(member: SarvoUser, membersArray: Array<SarvoUser>): void {
    this._membersArray = ManageContacts.removeContactClicked(member, membersArray);
  }

  hasMembers(membersArray: Array<SarvoUser>): boolean {
    return ManageContacts.hasMembers(membersArray);
  }

  isMember(item, membersArray: Array<SarvoUser>): boolean {
    return ManageContacts.isMember(item, membersArray);
  }

  /*
   * request synchronization of contacts clicked
   */
  syncContactsClicked()
  {
    // Update from server
    this._loading = true;
    this.manageContacts.contactsSarvoAll.then((data: Map <string, SarvoUser>) => {
      //this._sarvoContactsServer = data[0]; // contacts registered at Sarvo as List of SarvoUsers
      this._sarvoContactsMap = data; // all sarvo Users contacts incl. the ones that are registered
    });
  }

  onlyRegistered(contacts: Array<SarvoUser>, registered)
  {
    try
    {

    if(registered)
    {
    return contacts.filter((item) => {
      if (item.isRegistered) {
        return true
      }
      return false
    })
  }
  else
  {

    return contacts.filter((item) => {
      if (!item.isRegistered) {
        return true
      }
      return false
    }) 

    }
  }catch(error)
  {
    return [];
  }
  

  }

  _initializeUsersForSearch(): void {
    this._sarvoContactsSearch = this._sarvoContacts;
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this._initializeUsersForSearch();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this._sarvoContactsSearch = this._sarvoContactsSearch.filter((item) => {
        if (item.username) {
          return (item.username.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    }
  }

}
