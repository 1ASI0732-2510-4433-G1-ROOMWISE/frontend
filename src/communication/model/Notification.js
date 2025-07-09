// src/communication/model/Notification.js

// Define the Notification class
export default class Notification {
    
    // Constructor to initialize a new Notification instance with default or provided values
    constructor(
        typesNotificationsId = 0,  // ID of the notification type (default: 0)
        ownersId = 0,  // ID of the owner (default: 0)
        adminsId = 0,  // ID of the admin (default: 0)
        workersId = 0,  // ID of the worker (default: 0)
        title = "",  // Title of the notification (default: empty string)
        description = ""  // Description of the notification (default: empty string)
    ) {
        // Assign the provided or default values to the instance properties
        this.typesNotificationsId = typesNotificationsId;
        this.ownersId = ownersId;
        this.adminsId = adminsId;
        this.workersId = workersId;
        this.title = title;
        this.description = description;
    }

    // Static method to create a Notification instance from a JSON object
    static fromJson(json) {
        return new Notification(
            json.typesNotificationsId,  // Extract notification type ID from the JSON
            json.ownersId,  // Extract owner ID from the JSON
            json.adminsId,  // Extract admin ID from the JSON
            json.workersId,  // Extract worker ID from the JSON
            json.title,  // Extract title from the JSON
            json.description  // Extract description from the JSON
        );
    }

    // Method to convert the Notification instance to a JSON object
    toJson() {
        return {
            typesNotificationsId: this.typesNotificationsId,  // Map notification type ID to JSON
            ownersId: this.ownersId,  // Map owner ID to JSON
            adminsId: this.adminsId,  // Map admin ID to JSON
            workersId: this.workersId,  // Map worker ID to JSON
            title: this.title,  // Map title to JSON
            description: this.description  // Map description to JSON
        };
    }
}
