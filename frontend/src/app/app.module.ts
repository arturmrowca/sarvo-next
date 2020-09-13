import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { SignupPage } from '../pages/signup/signup';
import { EventDetailsPage } from '../pages/event-details/event-details';
import { ApidebugPage } from '../pages/apidebug/apidebug';
import { EventCreatePage } from '../pages/event-create/event-create';
import { GroupsMemberEditPage } from '../pages/groups-member-edit/groups-member-edit';
import { GroupsOverviewPage } from '../pages/groups-overview/groups-overview';
import { GroupsDetailPage } from '../pages/groups-detail/groups-detail';
import { ProfilePage } from '../pages/profile/profile';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Contacts } from '@ionic-native/contacts';
import { Geolocation } from '@ionic-native/geolocation';

import { AddContactsComponent } from "../components/add-contacts/add-contacts";
import { AddGroupsComponent} from "../components/add-groups/add-groups";

// custom imports
// internationalization / i18n
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule, Http } from '@angular/http';
import { ManageContacts } from "../lib/ManageContacts";
import { EventListComponent } from "../components/event-list/event-list";
import {IonicStorageModule} from "@ionic/storage";
import {IonicNativePlugin} from "@ionic-native/core";
import {NativeStorage} from "@ionic-native/native-storage";
import { FeedbackPage } from "../pages/feedback/feedback";
import { EventMgmtAttendPage} from "../pages/event-mgmt-attend/event-mgmt-attend";
import { ManageGroups } from "../lib/ManageGroups";
import { IonicRatingModule } from "ionic-rating/dist";
import { ChatComponent } from "../components/chat/chat";
import {ChatMessageComponent} from "../components/chat-message/chat-message";
import {ChatTextfieldComponent} from "../components/chat-textfield/chat-textfield";
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
import { Push} from '@ionic-native/push';
import { Camera } from '@ionic-native/camera';
import { Utility } from '../components/utility';
import { EventVoteOverlayComponent } from '../components/event-vote-overlay/event-vote-overlay';
import { AddVoteOverlayComponent } from '../components/add-vote-overlay/add-vote-overlay';
import { LoaderComponent } from '../components/loader/loader'; 
import { IntroSplashPage } from '../pages/intro-splash/intro-splash';
import { ContactPage } from '../pages/contact/contact';
import { DateInformationComponent } from '../components/date-information/date-information';
import { EventBrowserPage } from '../pages/event-browser/event-browser';
import { IterableEventsComponent } from '../components/iterable-events/iterable-events';
import { Calendar } from '@ionic-native/calendar';
import { GdprConsentPage } from '../pages/gdpr-consent/gdpr-consent';

import { Clipboard } from '@ionic-native/clipboard';
import { CollabListComponent } from '../components/collab-list/collab-list';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    SignupPage,
    EventDetailsPage,
    EventCreatePage,
    EventMgmtAttendPage,
    GroupsMemberEditPage,
    GroupsOverviewPage,
    GroupsDetailPage,
    EventBrowserPage,
    ProfilePage,
    ChatComponent,
    ChatMessageComponent,
    ChatTextfieldComponent,
    FeedbackPage,
    AddContactsComponent,
    AddGroupsComponent,
    EventListComponent,
    ApidebugPage,
    CollabListComponent,
    EventVoteOverlayComponent,
    AddVoteOverlayComponent,
    DateInformationComponent,
    IterableEventsComponent,
    LoaderComponent,
    IntroSplashPage,
    ContactPage,
    GdprConsentPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicRatingModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    SignupPage,
    EventDetailsPage,
    EventCreatePage,
    EventMgmtAttendPage,
    GroupsMemberEditPage,
    GroupsOverviewPage,
    GroupsDetailPage,
    ProfilePage,
    FeedbackPage,
    ApidebugPage,
    IntroSplashPage,
    EventBrowserPage,
    GdprConsentPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Contacts,
    NativeStorage,
    Geolocation,
    ManageContacts,
    ManageGroups,
    Utility,
    Camera,
    Calendar,
    Clipboard,
    Push/*,
    {provide: ErrorHandler, useClass: IonicErrorHandler}*/,
    ]
})



export class AppModule {}
