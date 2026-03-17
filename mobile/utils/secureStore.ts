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
