
export class RootResponse {

  constructor(public error : boolean = false,
              public errorMesssage : string = "",
              public errorObject: object = {}) {
  }
}
