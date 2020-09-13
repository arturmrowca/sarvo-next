import { Endpoint } from '../../pages/apidebug/apidebug'
import { BackendFactory } from "../../lib/factory/BackendFactory";
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

enum RequestType {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT"
}

export function trackclicks(
  target: any, 
  propertyKey: string, 
  descriptor: PropertyDescriptor
  )
{
  // Use this parameter to enable / disable tracking globally
  var USE_TRACKING = true;
  const originalMethod = descriptor.value;
  descriptor.value = function(...args: any[])
  {
    if(USE_TRACKING && BackendFactory.Instance.session_valid)
    {
      var event = args[0];

      var clickData = {};
      // TODO Change
      clickData["user_id"] = "-1";
      // TODO Change
      clickData["device_id"] = "-1"
      clickData["session_id"] = BackendFactory.Instance.session_id;
      clickData["interface_element_id"] =  propertyKey;
      clickData["timestamp"] = BackendFactory.Instance.date_time.toISOString();
      clickData["pixel_location_x"] = event.clientX;
      clickData["pixel_location_y"] = event.clientY;
      clickData["click_type"] = "N/A";
      clickData["next_page"] = this.navCtrl.getActive().name;
      clickData["current_page"] = this.navCtrl.getActive().name;


      this.getDirect("curuser/id/").then((requestResponse) => {
        
        let s = requestResponse["userId"];
        clickData["user_id"] = s;
        this.post("/stream/clicks/", clickData);
    });
    }

    const result = originalMethod.apply(this, args);
    return result;
  };
  return descriptor;
}