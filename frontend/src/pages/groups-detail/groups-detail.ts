import { Component, IterableDiffers } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import { IonicModule } from 'ionic-angular';
import { GroupsMemberEditPage } from '../groups-member-edit/groups-member-edit';
import { SarvoGroup } from '../../lib/SarvoGroup'
import { Utility } from "../../components/utility";
import { SarvoUser } from '../../lib/SarvoUser';
import { ManageContacts } from '../../lib/ManageContacts';
import { Loadable } from '../../lib/generic/Loadable';
/**
 * Generated class for the GroupsDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-groups-detail',
  templateUrl: 'groups-detail.html',
})
export class GroupsDetailPage extends Loadable {

  private _group: SarvoGroup;
  private _memberArray: Array<SarvoUser>;
  private _amAdmin: Boolean;
  private _editDescr: Boolean;
  private _changePic: boolean;
  groupsMemberEditPage = GroupsMemberEditPage;
  private basicImage:string;

  private differ: any;

  constructor(public navCtrl: NavController, private differs: IterableDiffers, public navParams: NavParams, public manageContacts: ManageContacts, public alertCtrl: AlertController) {
    super();
    this._group = this.navParams.get('group');
    this._editDescr = false;
    this._memberArray = [];
    this._changePic = false;
    this.getMembers();
    this.basicImage = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC6CAYAAAAHx2dCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAA6mSURBVHhe7d1pdBXlGQfwZ+69SQhJIAkQQAiGHTcqSkHBAhWwBKrHLoJYNVqx2sXa4/FLPT2tx9rVD22Pp1XrUUGsSBFxAUVZXRC3iuKCCsSqCFYIZLmAkHtvOm/yDCThLjNz35l5Z+b/67knz5v2g6b/PHnmnU1r0xFAQET4K0AgoEMHxOR7HqdEKkWHE0n+TnalhTHS9P9suu5i/k4wINA+NPbOZVzJN/+0ofTL88fzyn8QaB9wMsC53D3nHJo0rJpX6tOSqVRbRNN4CSrxMsjpbL3hEq7UpbW2trbFYjFegpcuefhZ+rChmVdqUzXcWkrv0Bo6tKeuW7GRNu/ayyt/US3YmKE9pNpIkQ9Vgo1AeyRIYe7M62Aj0C4LapC78yrYCLSLwhJmw4JxI+nn553JK3cg0C4IW5A7c7tTI9AOC3OYO3Mr2Lg4yUEI83Fu/SywD+0QhDm9e+acQ+dKPpXeecjQWlsTbbFYlJcgA8KcXb+ePWjdNRfyKn+JTlcYYoaWDGE2p0hvoq//+Lu8kgcztEQIs3lH9K46e9EqXsmDQEuCMFu3q/kQzVooL9QpfdhAoCVAmO3b3XKIVr63g1f2iTCnkknM0PlCmOV4ev50Gty3klfWGGGORqPo0PlAmOWZvWQdV9YZYRbbz+jQNiHMzrBzRlFE2DiXgg5tA8LsHDs/284nBhFoixBm59265lWuzEmlUlwh0JYgzO547INPuTJHBNoINQJt0ll3reAK3GCleYgDQiPUCLQJ4oebSCR4BaoRM7QIdRKBzq1u8ydcgdusdGkR6hj2obObtHYHbXnjNV6BF25etYmr3ESoEegMFrzyCR386B1egVeeq9/NlTkIdBqiM78fb6W2JOZmFbxc/xlXuSHQ3XzvxY/bv8a3bWn/Ct67ftUrXOWGQLP6hqb2zrznSBJhVtBrH+/iKjsEml2+xZ/PlguLBSs3c5Vd6AO9fV9HZzZgbva30Ae67q2unRk7G/4W2kAbM3NnR/fu4QpUZOZES2gDnW5mPrrvC67Ar0IX6B1pOrOAnQ1/mP/IGq7SC12gr8Ruhq+9t7eRq/RCE+gPu+1mQDCFJtBXd9vNgGAKfKAzzcydYX72l3lLnuPqRIEPNGbm4Nmmj4+ZRIL6FIPtJjozBE8kmTx+x2yQ1JnszImm/VxBEARy5Ji5YSdXuX21G7dYBUkkGg1WpsWYcTCp/hgVLS6h0lPGHfuUjBrL/w2Ycfu617nqKlCPApush9nqv4zbOxxF/QdRQWUVr9LDros56R4bFpj2LDqzyr+ZPQbVtHfiXGEWjK4N1gUi0LM21nOlpp7DT6VYrwpemYdQW+f7QIvO3JxQd6emuGY0RQqLeGUdQm2NrwPth33maHFPrsANvg20H8Isq7uiS5vny0DPeV7tmRm847tAi858oDWYZzezQZc2x1eB9sOYAd7yTaARZu9ECgrb/0KUjDqj/aumr1UV6fw4f1Vd9ELH47nAZZrWHuCeI07rWEZj7V9L9LX4vipjkPGw8/YHnqt+5lt05n1Hj7+cHJxXMnpsR2DHnMnfyUyFYIsMG5+IePK5qjBmuE+EU4tYz4Tboa4sPn6ySmTY+Cg7QyPM7hNXAObDzVBvXHARV10pGWjsM3ujuGYUV/aJqwm9pFygRWcO4z6z12R1V3E1YWHVSbxyn1KBxpgRDIV9+nPljGyvT1Ym0AgzyKBEoDEzgyyeB3ra+p2YmUEaTwM9VQ/z0VRgbmkEBXgWaBHmVoQZJPMk0N/aWI8wgyNcD7TozC0K3wMoi9fXN4SVq4EWB4DozOAk1wI9dZ2aB4BOdFItVsAVuM2VQLd35uA8oCmnkpGncwVuczzQftiaw7wbHI4GOowzM345vOVIoMXrhkWY/XTSRAQx3zAizN5zJNALtu7z7RlAO6E0Ho0L3pMa6D+/u6f9qjm/jxlGt9ZiHTeFpqMVFBz738m4MB7kkBroJ744yFUwlIzsuG3f+HR+SHnJCOxkqEhKoMVLLc/TO3PQD//QidUXSUkYD8RLLXEBKHhFZNj4RNra7EexbvN/cacJeE5k2Pjk9VyO7QcTXAF4J+/ncjTF4+jMoCRbgb5jR+ZX0wJ4yVag1+87zBUEgZln2PmF5UCLLToIGE3jwv8sB1ps0YE3Csr7cCVPYd8BXAWDpUA3tcS5Ai8UDRzClTyF/QZyFQyWAt27rJQr8Io47Q6Z2ToohGAI4i8HAu1DMoIY1E5vKdAtcczQqhCBtBvKoIZZsBToslLM0KqxEs58fgn8wvLIcXqZuq/0CisjqMVDRvB3ugpDkA1am43XYOE6Dsglvm0LV/L54oHnADLYCvTLM9L/aQPwWiSZtHeB/w1De3EF0FV1sbvvvhQZNj62R475w6vopzUINXQl/novnTyUV/KNrMyeuUg0an+M/sGIKvrFMIQaOowscf4hlcUFJ3Z/kWHjk/dB4dxhVfS7MRW8grBaNWEALTr3ZF4556G5M7hKT8ouxzcH96FbRyPUYXVSjyhV9Op60i3b1pqTpARauKC6D92mh7o4GpyLxSE3MTM/el76mfn8GrnXWpv5JZEWaGGGHupfj0SnDouBRdl3M/564Te4co/UQAtTB1fSP8b2pZ55HGyC+lZPHEDLv5F7N2NydRVX+TE7wtg69W3Gms8a6E87GulQMugPCAuf6uIYLZ1cw6vcPt+3n2qXrOOVdVbmcccCbZj9fD014k2xgZHPWeKxdy7jypxNV9VSmcW7pBwPdHNLnC5980uEOgBimkYvTB/OK/vMBNvuLonjgTbM3FBPB22eZgfvrZzQnyp7lfFKXa4dud0ysrd+oIgtPT8aos/Mfgiz4FqHNtTqM3UTxg/f8NuVla7vrS0e14/KC7Cl5wd9C929ak4G1zu0YfqGnXQYW3rKWjWxP1WU+WPM6MyzVvn7MZWYqRU1vGeBL8MseNahDbUb9Zk6gZlaFX6/GymSTCa59MaDmKmVUZXj2gxViQwbHy2ZTLVFIt7/6Z+hz9Q4Te6dZWdX0aAKf96s0fnFVxEVwizcPqaCihT5ZwmbXrGIb8MsiAwf+/D3PDf4wLv0w8UjqDARrJd3qk7MzKunDeOV/ykT6A13TG3/Wrf861TU2tJeg7P6+3RmzsbzXY7Ghv/RUzefeGfDvfO2UiJWzCuQbak+M1f7eMzIxPMOnS7MwoxXb6ZY8givQKaopgUyzIJnHfrLT7fRs785lVeZLfz+G3S4qDevIF9+32fOxbMObSbMwhUrJuJAUZJ+hcHf73e9Qzcd2EdP3tSPV+bdO+8dfabuwSuwavn4KhpYHvyHArn+K2snzMKsTT+hWAIv/LRDnIkNQ5gF1zr0x288QS/9/WJe2bfwkv/Q4cJw/J8jQ9Bn5u5c69AywixctWy8PlMf4hVk48frmfPleIeOtzQR3V9OK97ib0hy76X6TB3FTJ3JkxP6U1+f3DYlk/MdWg+zUHt6+xdpal/8EWbqDMSz5sIYZsGxDh3fupBow9W8Ok52p75v3tt0NNaTV/DsOQNC/bYyRzp0fPfWtGEWvnMmF5Jcs/Rr1KO1mVfhVhaLhP7Ve9I7dLx+PdFT03mVGWZquZ6eOIDK8S52uR06/s5iU2EWZp7ChSS1L16vz9Rf8SpcBhRFEWYmrUPH3/0X0brLeWWe7E59/9w36UhBeA6IwrbPnIuUDh3fsdpWmAXZM3XdY2dR8dFwzNSVIbg2wyo5P5FVtVzYIzPU0YQ+T1c38Sq4rq4upZVTgnOniSx5jRzx95YQrb2MV/nRNKLHJLxN94oHOv51Xvh8P/32owN0MIA33mLMyCy/Di0pzIL4tZqd58mXSdc/yhXRlEGVdNuYSl4FhzgAhMy0RCLRFo1a+yHFtz5ItKGOV/LZOVA0OnN3jc1xmr/ly0A8IDLsJ00y6fxsmYgm/tZb5WCYBasz9cRrH+bqROW9SumZqf6fNa89uQxhzkBk+NjHygwdb9xLtEjOS2ByEf9Uj7/Niywydebu1n7WQH/06TtfMDObZ22GdinMgvjDkevky/gr/8lVbuKVc78a1XGhlJ9gZrbGVIeOv/9vojXzeOW+dDO12c7cXWNLC1325l5fvPMFndk6cx3awzAL3WfqCdcs5sq68rIyemice39p7LpOn5nBuqwdOt68n+iBPrzylhh9n9RnarudubuNuxro9u1qztTozPZl79CKhFkQz0afMe8mXuVv2mB9plbwNc5+faStKtJ26PhHq4ie+Tav1FB6ozOd9EBzC83fspeaFZip0Znzl75DKxZmmnI3F/JV9Cqj1QrsU984FHeyy3BCh47/Ta1nNDvVmbvbvEdc+9Hoye4HOrM8XTp0/J6+XCliyl1cOO/cgZX0yNlV1DtmbWs+X+JF8CCPlkql2ozT3yp1Z7c6czqzNtZTs8MvMhIvK3hpOjqzbBE90FwqpHw0F964dXQ5lTj8yrmTsJvhCK21tbUtFosdeyCM17zszN1NWruDK7lw1ZxzIrqOSoEw04wlXKjBiYM1sc+MMDvn2C6H1/OzSp25O1md+pmJA6g37s52lLuH9JmUDuFCTT+TsEc8qEcMYXaB5x1a5c7c3dT1O6m100sezRA/1U3YZ3bN8Q7NW3euumA5F/7w/PnDLc3VfzmtkpaP788rcMPxDt3UQLTQvRMrfurM2dQ3NNFDn8ep4WiKJlcW0aSKHjQ4oG+Y8oMup75dGztGXEqlc9Ta0YBgcD3QQenMoKauuxw1cl4bkdG0+7gAcEaXDi3EF51C1PgBr+RBZwY3nLAPXVq3jSuJai7iAsBZJ3Rog6x5Gp0Z3JTxTKGUIM56nAsAd2Ts0Ib4zrVEK2fyyqS5W6l04Bm8AHBPzkAb4pv/QPTaLbzKoHy0PoPLP6AEMMt0oAH8QI2r7QAkQaAhMMSwgUBDYIgHnyPQEAiJRJI0LYJAg/91hJkoGkWgIQA6wtzxWAhs20GgoEOD73XuyQg0+J7Y3UhxqBFo8D0xP6c41JihIRBEjJPJJP0fHloItO+0PIcAAAAASUVORK5CYII=";
 
    // Differ
    this.differ = differs.find([]).create(null);

  }

  ionViewDidLoad() {
    this.isAdmin();
    console.log('ionViewDidLoad GroupsDetailPage');
  }
  /*
      Changes the image if it was clicked
       */
  _onImageClicked() : void
  {
    this._changePic = ! this._changePic;
  }

  changeProfilePicture(type: number) {
    // Set Image Gallery

    Utility.imagePicker.getPhoto(type).then((imageDataRaw) => { 
            
      Utility.imagePicker.compress('data:image/jpeg;base64,' + imageDataRaw).then((imageData: string) => 
      {

      // Set new model
      this._group.imageBase64 =  imageData;
      this._group.imagePreviewBase64 =  imageData;

      // Upsert the setting
      this._group.postProperties(["imageBase64"])

      }, (err) => {});
    });
  }

  editGroupClicked(): void
  {
    this.navCtrl.push(this.groupsMemberEditPage, {members : this._memberArray, group: this._group});
  }

  getMembers(): void {
    this._memberArray = this.manageContacts.getAllUsers(this._group.members)
    /** Please leave this content for tsting purposes...
    this._memberArray = [];
    let user = new SarvoUser();
    user.username = "tester1";
    this._memberArray.push(user);

    let user1 = new SarvoUser();
    user1.username = "tester2";
    this._memberArray.push(user1);

    let user2 = new SarvoUser();
    user2.username = "tester3";
    this._memberArray.push(user2);

    let user3 = new SarvoUser();
    user3.username = "tester4";
    this._memberArray.push(user3);

    let user4 = new SarvoUser();
    user4.username = "tester5";
    this._memberArray.push(user4);

    let user5 = new SarvoUser();
    user5.username = "tester5";
    this._memberArray.push(user5);

    let user6 = new SarvoUser();
    user6.username = "tester5";
    this._memberArray.push(user6);

    let user7 = new SarvoUser();
    user7.username = "tester5";
    this._memberArray.push(user7);

    let user8 = new SarvoUser();
    user8.username = "tester5";
    this._memberArray.push(user8);

    let user9 = new SarvoUser();
    user9.username = "tester5";
    this._memberArray.push(user9);

    this._amAdmin=true;// **/
  }
 
  isAdmin() {
    this.getDirect("curuser/id/").then((request_response) => {
      const index: number = this._group.admins.findIndex(item => item == request_response["userId"]);
      if (index != -1) {
        this._amAdmin = true;
      } else {
        this._amAdmin = false;
      }
    });
  }

  hasMembers(membersArray: Array<SarvoUser>): boolean {
      return ManageContacts.hasMembers(membersArray);
  }

  async changeDescrAlert(): Promise<void> {
      const prompt = this.alertCtrl.create({
          title: "Gruppen Beschreibung",
          message: "Setze die Gruppenbeschreibung hier.",
          inputs: [
              {
                  name: "groupDescr",
                  value: this._group.description,
                  placeholder: "Group Description"
              },
          ],
          buttons: [
              {
                  text: "Abbruch",
                  handler: data => {
                      console.log('Cancel clicked');
                  }
              },
              {
                  text: "OK",
                  handler: data => {
                      this._group.description = data.groupDescr;
                      
                      this._group.postProperties(["description"]);
                  }
              }
          ]
      });
      prompt.present();
  }

  async changeDescrClicked() {
      await this.changeDescrAlert();
  }

  changeTitleClicked()
  {
    const prompt = this.alertCtrl.create({
      title: "Gruppennamen",
      message: "Setze den Namen hier.",
      inputs: [
          {
              name: "groupDescr",
              value: this._group.name,
              placeholder: "Group Description"
          },
      ],
      buttons: [
          {
              text: "Abbruch",
              handler: data => {
                  console.log('Cancel clicked');
              }
          },
          {
              text: "OK",
              handler: data => {
                  this._group.name = data.groupDescr;
                  this._group.postProperties(["name"]);
              }
          }
      ]
  });
  prompt.present();

  }


  ngDoCheck(): void
  {
    let changes = this.differ.diff(this._memberArray);
    if (changes) {
        console.log("\n\n Post members")
        var memberIds = []
        if (this._memberArray.length == 0)
        {
          return;
        }

        this._memberArray.forEach( (member) => {
          memberIds.push(member.id)
        });

        this._group.members = memberIds
        this._group.postProperties(["members"])
    }
  }
}
