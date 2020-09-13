import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SarvoGroup } from '../../lib/SarvoGroup'
import { SarvoUser } from "../../lib/SarvoUser";
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the GroupsMemberEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-groups-member-edit',
  templateUrl: 'groups-member-edit.html',
})
export class GroupsMemberEditPage {

  private _group: SarvoGroup;
  private _members: Array<SarvoUser>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this._group = this.navParams.get('group');
    this._members = this.navParams.get('members');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsMemberEditPage');
  }

  saveGroup(_group: SarvoGroup): void {
    // Artur'scher Workaround. Kann viel!
    this._group.members = [];
    for (let member of this._members) {
      this._group.members.push(member.id);
    }
    this._group.pushMembers();
    this.navCtrl.pop();
  }

  onMembersEmitted(onMembersEmitted: Array<SarvoUser>) {
    this._members = onMembersEmitted;
    //for (let member of onMembersEmitted) {
      //this._members.push(member);
    //}
  }

}
