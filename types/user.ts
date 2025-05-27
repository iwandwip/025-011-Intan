export interface UserData {
    id: string;
    email: string;
    username: string;
    password: string;
    rfid: string; // Optional property
    role: string; // Optional property
    namaAnak?: string; // Optional property
    birthdate?: string; // Optional property
    gender?: string; // Optional property
}

export interface CreateUserDTO {
    email: string;
    displayName: string;
    password: string; // Assuming password is needed for user creation
    rfid: string; // Optional property
    user: string; // Optional property
    namaAnak?: string; // Optional property
    birthdate?: string; // Optional property
    gender?: string; // Optional property
}

export interface UpdateUserDTO {
    displayName?: string;
    rfid?: string; // Optional property
    role?: string; // Optional property
    namaAnak?: string; // Optional property
    birthdate?: string; // Optional property
    gender?: string; // Optional property
}