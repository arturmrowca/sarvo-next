
interface Pusher { //implements pusher
    /*
    Content of received notification
    console.log('Received a notification', notification);
    console.log(notification.message);
    console.log(notification.title);
    console.log(notification.count);
    console.log(notification.sound);
    console.log(notification.image);
    console.log(JSON.stringify(notification.additionalData["pushId"]));
     */
    pushId: string;
    onReceivedNotification(notification: any): void;
    onNotificationClicked(notification: any): void;
}