// src/models/TypeRoom.js
export default class TypeRoom {
    constructor(
        description = "",
        price = 0
    ) {
        this.description = description;
        this.price = price;
    }

    static fromJson(json) {
        return new TypeRoom(
            json.description,
            json.price
        );
    }

    toJson() {
        return {
            description: this.description,
            price: this.price
        };
    }
}