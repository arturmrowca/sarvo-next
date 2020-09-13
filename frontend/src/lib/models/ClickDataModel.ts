export class ClickDataModel
{
    constructor (
        public userId: string = "",
        public sessionId: string = "",
        public deviceId: string = "",
        public interfaceElementId: string = "",
        public timestamp: string = "",
        public pixelLocationX: string = "",
        public pixelLocationY: string = "",
        public clickType: string = "",
        public previousPage: string = "",
        public currentPage: string = "",
        ) 
    {
    }
}