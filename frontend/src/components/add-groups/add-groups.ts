import {Input, Component, Output, EventEmitter} from '@angular/core';
import { ManageGroups} from "../../lib/ManageGroups";
import { SarvoGroup } from "../../lib/SarvoGroup";
import { IonicModule } from 'ionic-angular';

/**
 * Generated class for the AddGroupsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'add-groups',
  templateUrl: 'add-groups.html'
})
export class AddGroupsComponent {

  private _groupArray: Array<SarvoGroup>;
  private _myGroups: Array<SarvoGroup>;

  @Input() targetGroupIn: Array<SarvoGroup>;
  @Input() myGroupsIn: Array<SarvoGroup>;
  @Output() groupsOut = new EventEmitter();

  emit() {
    this.groupsOut.emit(this._groupArray)
  }

  constructor() {
  }

  ngOnInit() {
    this._myGroups = ManageGroups.getMyGroups()//this.myGroupsIn;
    this._groupArray = this.targetGroupIn;
  }

  onGroupClicked(group: SarvoGroup, groupArray: Array<SarvoGroup>): void {
    this._groupArray = ManageGroups.addContactClicked(group, groupArray);
  }

  onMemberClicked(member: SarvoGroup, groupArray: Array<SarvoGroup>): void {
    this._groupArray = ManageGroups.removeContactClicked(member, groupArray);
  }

  isMember(group: SarvoGroup, groupArray: Array<SarvoGroup>): boolean {
    return ManageGroups.isMember(group, groupArray);
  }

  hasMembers(groupArray: Array<SarvoGroup>): boolean {
    return ManageGroups.hasMembers(groupArray);
  }

}
