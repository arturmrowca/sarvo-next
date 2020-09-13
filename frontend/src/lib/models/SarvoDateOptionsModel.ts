
export class SarvoDateOptionsModel
{
  constructor(public id: number = -1,
              public eventId: number = -1,
              public date: string = "2018-03-31T15:05:34.121314Z",
              public acc_participants: number[] = [],
              public inter_participants: number[] = [],
              public dec_participants: number[] = [],)
  {
  }
}
