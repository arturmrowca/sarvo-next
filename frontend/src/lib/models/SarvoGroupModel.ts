import {SarvoUser} from "../SarvoUser";

export class SarvoGroupModel {
  constructor(public id: number = 0,
              public name: string = '',
              public description: string = 'Deine Beschreibung...',
              public members: Array<number> = [],
              public admins: Array<number> = [],
              public imageBase64: string = '',
              public imagePreviewBase64: string = '',
              public created: Date = new Date(),) {
  }
}
