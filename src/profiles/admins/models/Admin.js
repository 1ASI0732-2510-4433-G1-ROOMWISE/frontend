// src/models/Admin.js
export default class Admin {
    constructor({
                    id = 0,
                    username = null,
                    name = null,
                    surname = null,
                    email = null,
                    phone = null,
                    state = null,
                    password = null
                } = {}) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.state = state;
        this.password = password;
    }

    static fromJson(json) {
        return new Admin({
            id: json.id ?? 0,
            username: json.username,
            name: json.name,
            surname: json.surname,
            email: json.email,
            phone: json.phone != null ? parseInt(json.phone.toString()) : null,
            state: json.state,
            password: json.password
        });
    }

    toJson() {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            surname: this.surname,
            email: this.email,
            phone: this.phone,
            state: this.state,
            password: this.password
        };
    }
}