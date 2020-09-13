export class UserFeedbackModel {
  constructor(public text: string = '',
              public rating: number = 0,
              public category: string = '',) {
  }
}
