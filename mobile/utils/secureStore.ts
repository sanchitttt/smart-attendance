import * as SecureStore from 'expo-secure-store';


export const saveToken = async (token: string) => {
    await SecureStore.setItemAsync('userToken',token);
};

export const getToken = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return token;
};

export const deleteToken = async () => {
    await SecureStore.deleteItemAsync('userToken');
};

export type UserProfile = {
    token: string;
    role: string;
    name: string;
    email: string;
    rollNo: string;
    batchStartYear: string;
    program: string;
    profilePictureUrl: string;
};

export const saveUserProfile = async (profile: UserProfile) => {
    await SecureStore.setItemAsync('userProfile',JSON.stringify(profile));
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
    const raw = await SecureStore.getItemAsync('userProfile');
    if (!raw)
        return null;
    try {
        return JSON.parse(raw) as UserProfile;
    } catch {
        return null;
    }
};

export const deleteUserProfile = async () => {
    await SecureStore.deleteItemAsync('userProfile');
};

