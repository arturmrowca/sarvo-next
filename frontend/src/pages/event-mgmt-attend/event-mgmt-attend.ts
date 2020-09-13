import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SarvoGroup } from "../../lib/SarvoGroup";
import { SarvoUser } from "../../lib/SarvoUser";
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the EventMgmtAttendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-mgmt-attend',
  templateUrl: 'event-mgmt-attend.html',
})
export class EventMgmtAttendPage {

  private _attType: string;
  private _myGroups: Array<SarvoGroup>;
  private _targetContacts;
  private _targetGroups;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // TODO: JSONize this part...
    this._attType = "contacts";

    this._targetContacts = this.navParams.get('targetContacts');
    this._myGroups = this.navParams.get('myGroups');
    this._targetGroups = this.navParams.get('targetGroup');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventMgmtAttendPage');
  }

  onMembersEmitted(onMembersEmitted: Array<SarvoUser>) {
    this._targetContacts = onMembersEmitted;
  }

  onGroupsEmitted(onGroupsEmitted: Array<SarvoGroup>) {
    this._targetGroups = onGroupsEmitted;
  }
}
