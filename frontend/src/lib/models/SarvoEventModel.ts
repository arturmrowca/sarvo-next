import {SarvoDateOptions} from "../SarvoDateOptions";

export class SarvoEventModel {
  constructor(public id: number = -1,
              public name: string = "An Event Name",
              public organizer: number = -1,
              public location: string = "Ortschaft",
              public imageBase64: string = "Bildchen",
              public description: string = "Beschreibt mich",
              public organizationStatus: Map<string, string> = new Map<string, string>(),
              public fixed_date_option_id: number = -1,
              public fixedDate: string = "",
              public participants: number[] = [],
              public possible_dates: SarvoDateOptions[] = [],
              public created: Date = new Date(),
              public numMessages: number = -1,
              public inviteUsers: boolean = false,
              public targetGroups: number[] = [],
              public imagePreviewBase64: string = "Bildchen") {
  }
}
