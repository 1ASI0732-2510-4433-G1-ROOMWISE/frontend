// Import the http service to make HTTP requests
import http from "../../shared/services/http-common.js";

export class SupplyControlApiService {

    // Method to get all supplies from the API
    getAll() {
        return http.get('/supplies');  // Send GET request to '/supplies' endpoint
    }

    // Method to create a new supply by sending a POST request with the supply data
    create(supply) {
        return http.post('/supplies', supply);  // Send POST request to '/supplies' with the supply data
    }

    // Method to update an existing supply by sending a PUT request with the supply data
    update(id, supply) {
        return http.put(`/supplies/${id}`, supply);  // Send PUT request to '/supplies/{id}' with the updated supply data
    }

    // Method to delete a supply by sending a DELETE request with the supply ID
    delete(id) {
        return http.delete(`/supplies/${id}`);  // Send DELETE request to '/supplies/{id}' to delete the supply
    }
}
