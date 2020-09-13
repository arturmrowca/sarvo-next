import {Loadable} from "./generic/Loadable";
import {ClickDataModel} from "./models/ClickDataModel";

export class ClickData extends Loadable {

  public model : ClickDataModel;

  get userId(): string {
    return this.model.userId;
  }

  set userId(value: string) {
    this.model.userId = value;
  }

  get sessionId(): string {
    return this.model.sessionId;
  }

  set sessionId(value: string) {
    this.model.sessionId = value;
  }

  get deviceId(): string {
    return this.model.deviceId;
  }

  set deviceId(value: string) {
    this.model.deviceId = value;
  }

  get interfaceElementId(): string {
    return this.model.interfaceElementId;
  }

  set interfaceElementId(value: string) {
    this.model.interfaceElementId = value;
  }

  get timestamp(): string {
    return this.model.timestamp;
  }

  set timestamp(value: string) {
    this.model.timestamp = value;
  }

  get pixelLocationX(): string {
    return this.model.pixelLocationX;
  }

  set pixelLocationX(value: string) {
    this.model.pixelLocationX = value;
  }

  get pixelLocationY(): string {
    return this.model.pixelLocationY;
  }

  set pixelLocationY(value: string) {
    this.model.pixelLocationY = value;
  }

  get clickType(): string {
    return this.model.clickType;
  }

  set clickType(value: string) {
    this.model.clickType = value;
  }

  get previousPage(): string {
    return this.model.previousPage;
  }

  set previousPage(value: string) {
    this.model.previousPage = value;
  }

  get currentPage(): string {
    return this.model.currentPage;
  }

  set currentPage(value: string) {
    this.model.currentPage = value;
  }

  constructor() {
    super();

    this.model = new ClickDataModel();
  }
}