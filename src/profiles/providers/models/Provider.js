// src/profiles/providers/models/Provider.js

export default class Provider {
    constructor(id = null, name = null, address = null, email = null, phone = null, state = null) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phone = phone;
        this.state = state;
    }

    static fromJson(json) {
        return new Provider(
            json.id != null ? parseInt(json.id.toString()) : null,
            json.name || null,
            json.address || null,
            json.email || null,
            json.phone != null ? parseInt(json.phone.toString()) : null,
            json.state || null
        );
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            email: this.email,
            phone: this.phone,
            state: this.state
        };
    }

    validateData() {
        const errors = [];
        if (!this.name) errors.push('Name is required');
        if (!this.address) errors.push('Address is required');
        if (!this.email) errors.push('Email is required');
        if (!this.email?.includes('@')) errors.push('Email format is invalid');
        if (!this.phone) errors.push('Phone is required');
        if (!this.state) errors.push('State is required');
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}