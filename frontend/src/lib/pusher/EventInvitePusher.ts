import {EventDetailsPage} from "../../pages/event-details/event-details";

export class EventInvitePusher implements Pusher{
  /*
  * This pusher sends a notification to a participant once he is invited
  * When the notification is received (that means when the current user is invited)
  * he is forwarded to this event, when he clicks
  * */
  pushId: string;
  eventDetailsPage = EventDetailsPage;

  constructor()
  {
    this.pushId = "lib.pusher.EventInvitePusher"
  }

    onReceivedNotification(notification: any): void {

    console.log(JSON.stringify(notification.additionalData["pushId"]));

  }

  onNotificationClicked(notification: any): void {
    console.log('S.b. clicked da shit');

    // Open the corresponding event
    var eventId = notification.additionalData["event_id"]
    console.log("-----------HHH___________" + eventId)

    //this.navCtrl.setRoot(this.eventDetailsPage, {eventId: eventId});
  }

}