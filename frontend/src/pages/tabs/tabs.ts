import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { EventDetailsPage } from '../event-details/event-details';
import { EventCreatePage } from '../event-create/event-create';
import { GroupsOverviewPage } from '../groups-overview/groups-overview';
import { ProfilePage } from '../profile/profile';
import { ApidebugPage } from '../apidebug/apidebug';
import { EventBrowserPage } from '../event-browser/event-browser';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tabHomeRoot = HomePage;
  tabAboutRoot = AboutPage;
  tabSignupRoot = SignupPage;
  tabEventDetailPageRoot = EventDetailsPage;
  tabEventCreatePageRoot = EventCreatePage;
  tabGroupsPageRoot = GroupsOverviewPage;
  tabProfilePageRoot = ProfilePage;
  tabApiDebug = ApidebugPage;
  tabEventBrowse  = EventBrowserPage;

  constructor() {

  }

  tabChanged($ev) {
    $ev.setRoot($ev.root);
  }
}
