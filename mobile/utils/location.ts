import * as Location from 'expo-location';

export const getLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Location permission denied');
            return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        return loc;
        // setLocation({
        //   latitude: loc.coords.latitude,
        //   longitude: loc.coords.longitude,
        // });
        console.log('Location acquired:',loc.coords);
    } catch (err) {
        console.error('Location fetch failed:',err);
    }
}