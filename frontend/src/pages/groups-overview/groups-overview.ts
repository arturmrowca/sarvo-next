import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController} from "ionic-angular";
import { IonicModule } from 'ionic-angular';
import { GroupsDetailPage } from '../groups-detail/groups-detail';
import { SarvoGroup } from '../../lib/SarvoGroup';
import { ManageGroups } from "../../lib/ManageGroups";
import { Loadable } from "../../lib/generic/Loadable";
import {SarvoUser} from "../../lib/SarvoUser";
import { TranslateService } from '@ngx-translate/core';


/**
 * Generated class for the GroupsOverviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-groups-overview',
  templateUrl: 'groups-overview.html',
})
export class GroupsOverviewPage extends Loadable{

  private _groups: Array<SarvoGroup>;
  private basicImage:string;
  private loading: boolean;

  groupsDetailPage = GroupsDetailPage;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private translate:TranslateService) {
    super();
    this.loading = true;
    this._groups = [];
    this.basicImage = "data:image/jpeg;base64,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"; 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsOverviewPage');
    this._groups = [];
    this._groups =  ManageGroups.getMyGroups();

    // pause 2 seconds
    this.loading = false;
  }

  detailGroupClicked(group: SarvoGroup): void {
    this.navCtrl.push(this.groupsDetailPage, {group : group});
  }

  findGroup(group): number {
    const index: number = this._groups.findIndex(item => item.name == group.name);
    return index;
  }

  removeGroupClicked(group): void {
    const index = this.findGroup(group);

    group.removeFromBackend();
    this._groups.splice(index,1)
  }

  async addGroupAlert(): Promise<void> {
    var title = "";
    var descriptionText = "";
    var placeText = "";
    var cancelText = "";
    var continueText = "";
    this.translate.get('GROUP_MGMT.LABELS.ADD_GROUP_TITLE').subscribe(
      value => {title = value;});
    this.translate.get('GROUP_MGMT.LABELS.ADD_GROUP_TEXT').subscribe(
      value => {descriptionText = value;});
      this.translate.get('GROUP_MGMT.LABELS.ADD_GROUP_PLACE').subscribe(
        value => {placeText = value;});
        this.translate.get('GROUP_MGMT.BUTTONS.CANCEL').subscribe(
          value => {cancelText = value;});
          this.translate.get('GROUP_MGMT.BUTTONS.CONTINUE').subscribe(
            value => {continueText = value;});

    
    const prompt = this.alertCtrl.create({
      title: title,
      message: descriptionText,
      inputs: [
        {
          name: "groupName",
          placeholder: placeText
        },
      ],
      buttons: [
        {
          text: cancelText,
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: continueText,
          handler: data => {
            let group = new SarvoGroup();

            group.name = data.groupName;

            this.getDirect("curuser/id/").then((requestResponse) => {
              group.addMember(requestResponse["userId"]);
              group.addAdmin(requestResponse["userId"]);
              group.sendToBackend();

              this._groups.push(group);
              this.navCtrl.push(this.groupsDetailPage, {group : group});
            }).catch((err) => {
              console.log(JSON.stringify(err));
            });
          }
        }
      ]
    });
    prompt.present();
  }

  async addGroupClicked() {
    await this.addGroupAlert();
  }

  hasGroups(): Boolean {
    return this._groups.length > 0;
  }
}


