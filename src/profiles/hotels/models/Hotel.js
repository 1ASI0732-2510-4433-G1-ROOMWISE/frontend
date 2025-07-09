// Define the Hotel class
export class Hotel {
    
    // Constructor to initialize a new Hotel instance with the provided properties
    constructor({ id, name, address, phone, email, description, ownerId }) {
        this.id = id;  // Hotel ID
        this.name = name;  // Hotel name
        this.address = address;  // Hotel address
        this.phone = phone;  // Hotel phone number
        this.email = email;  // Hotel email
        this.description = description;  // Description of the hotel
        this.ownerId = ownerId;  // ID of the owner of the hotel
    }

    // Static method to create a Hotel instance from a JSON object
    static fromJson(json) {
        return new Hotel({
            id: json.id,  // Hotel ID from the JSON response
            name: json.name,  // Hotel name from the JSON response
            address: json.address,  // Hotel address from the JSON response
            phone: json.phone,  // Hotel phone number from the JSON response (note: this matches 'phone' in the API)
            email: json.email,  // Hotel email from the JSON response
            description: json.description,  // Hotel description from the JSON response
            ownerId: json.ownersId  // Hotel owner ID from the JSON response (note: 'ownersId' in the API)
        });
    }
}
