// Room model class
export class RoomModel {
    constructor(typeRoomId = 0, hotelId = 0) {
        this.typeRoomId = typeRoomId;
        this.hotelId = hotelId;
    }
}

// Type room interface (for dropdown options)
export class TypeRoom {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

// Hotel interface (for dropdown options)
export class Hotel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}