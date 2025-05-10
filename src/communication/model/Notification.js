// src/communication/model/Notification.js
export default class Notification {
    constructor(
        typesNotificationsId = 0,
        ownersId = 0,
        adminsId = 0,
        workersId = 0,
        title = "",
        description = ""
    ) {
        this.typesNotificationsId = typesNotificationsId;
        this.ownersId = ownersId;
        this.adminsId = adminsId;
        this.workersId = workersId;
        this.title = title;
        this.description = description;
    }

    static fromJson(json) {
        return new Notification(
            json.typesNotificationsId,
            json.ownersId,
            json.adminsId,
            json.workersId,
            json.title,
            json.description
        );
    }

    toJson() {
        return {
            typesNotificationsId: this.typesNotificationsId,
            ownersId: this.ownersId,
            adminsId: this.adminsId,
            workersId: this.workersId,
            title: this.title,
            description: this.description
        };
    }
}