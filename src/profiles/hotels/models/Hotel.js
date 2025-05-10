export class Hotel {
    constructor({ id, name, address, phone, email, description, ownerId }) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.description = description;
        this.ownerId = ownerId;
    }

    static fromJson(json) {
        return new Hotel({
            id: json.id,
            name: json.name,
            address: json.address,
            phone: json.phone, // Nota: 'phone' en JSON como en tu API
            email: json.email,
            description: json.description,
            ownerId: json.ownersId // Nota: 'ownersId' en JSON como en tu API
        });
    }
}