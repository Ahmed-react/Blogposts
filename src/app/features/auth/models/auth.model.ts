export interface LoginResponse {
    email: string;
    roles: string[];  // these were defined according to the LoginResponseDTO in the API
}

export interface User {
    email: string;
    roles: string[];
}