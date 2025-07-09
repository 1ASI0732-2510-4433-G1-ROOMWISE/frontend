// Define the Supply class
export class Supply {

    // Constructor to initialize a new Supply instance with default or provided values
    constructor(id = 0, product = '', quantity = 0, address = '', expire = '') {
        this.id = id;  // ID of the supply (default: 0)
        this.product = product;  // Name of the product (default: empty string)
        this.quantity = quantity;  // Quantity of the product (default: 0)
        this.address = address;  // Address related to the supply (default: empty string)
        this.expire = expire;  // Expiry date of the product (default: empty string)
    }

    // Static method to create a Supply instance from a displayable supply object
    static fromDisplayableSupply(displayableSupply) {
        return new Supply(
            displayableSupply.id,  // Map ID from the displayable supply object
            displayableSupply.product,  // Map product name from the displayable supply object
            displayableSupply.quantity,  // Map quantity from the displayable supply object
            displayableSupply.address,  // Map address from the displayable supply object
            displayableSupply.expire  // Map expiry date from the displayable supply object
        );
    }
}
