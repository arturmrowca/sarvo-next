import { Component } from '@angular/core';

/**
 * Generated class for the CollabListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'collab-list',
  templateUrl: 'collab-list.html'
})
export class CollabListComponent {

  text: string;
  groups: Array<any> = [{"name": "Hans", "items": ["Soda", "Stream"]}, {"name": "Hans", "items": ["Soda", "Stream"]}, {"name": "Hans", "items": ["Soda", "Stream"]}]
  shownGroup:any;

  constructor() {
    console.log('Hello CollabListComponent Component');
    this.text = 'Hello World';
  
    this.shownGroup = null;
    this.groups = [];
    for (var i=0; i<10; i++) {
      this.groups[i] = {
        name: i,
        items: []
      };
      for (var j=0; j<3; j++) {
        var item = {};
        item["value"] = "Hans"
        item["isChecked"] = false 

        this.groups[i].items.push(item);
      }
    }
  }
  

  isGroupShown(group:any)
  { 
    return this.shownGroup === group;
  }

  toggleGroup(group)
  { 
    if (this.isGroupShown(group)) {
      this.shownGroup = null;
    } else {
      this.shownGroup = group;
    }
    
  }

  todoItemClicked(item)
  {
    // show alert 

  }

}
