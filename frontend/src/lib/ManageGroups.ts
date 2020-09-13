import { Injectable } from "@angular/core";
import { Loadable } from "./generic/Loadable";
import { SarvoGroup } from "./SarvoGroup";
import { SarvoGroupModel } from "./models/SarvoGroupModel";

@Injectable()
export class ManageGroups extends Loadable {

  constructor() {
    super();
  }

  public static addContactClicked(group: SarvoGroup, groupArray: Array<SarvoGroup>): Array<SarvoGroup> {

    if (!ManageGroups.isMember(group, groupArray)) {
      groupArray.push(group);

    } else {
      groupArray = ManageGroups.removeContactClicked(group, groupArray);
    }

    // push changes to backend here!!

    return groupArray
  }

  public static findMember(group: SarvoGroup, groupArray: Array<SarvoGroup>): number {
    if (group != undefined)
    {
      return groupArray.findIndex(item => item.name == group.name);
    }
    return 0;
  }

  public static removeContactClicked(group: SarvoGroup, groupArray: Array<SarvoGroup>): Array<SarvoGroup> {

    const index: number = ManageGroups.findMember(group, groupArray);

    groupArray.splice(index, 1);
    // push changes to backend here!!

    return groupArray;
  }

  public static isMember(group: SarvoGroup, groupArray: Array<SarvoGroup>): boolean {
    
    if (group != undefined)
    {

      let isMem: boolean = true;
      const index: number = ManageGroups.findMember(group, groupArray);

      if (index==-1) {
        isMem = false;
      }

      return isMem;
    }
    return false;
  }

  public static hasMembers(group: Array<SarvoGroup>): boolean {

    let check: boolean = false;

    if (group != undefined)
    {
      if (group.length > 0) {
        check = true;
      }
    }
    return check;
  }

  public static getMyGroups(): Array<SarvoGroup> {
    let myGroups: Array<SarvoGroup> = [];
    let groupMgmt = new ManageGroups();

    groupMgmt.getDirect('curuser/group/ids/').then((requestResponseGroups) => {
      let ids = requestResponseGroups['group_ids']

      for (let id of ids) {
        let group = new SarvoGroup();
        group.getFromBackend(id);
        myGroups.push(group);
      }
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
    console.log(JSON.stringify(myGroups));
    return myGroups;
  }

  public static setMyGroups(myGroupsApp: Array<SarvoGroup>): void {

    for (let group of myGroupsApp) {
      group.sendToBackend()
    }
  }

}
