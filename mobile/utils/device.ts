import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";

export const getDeviceInfo = () => {
  const uuid =
    Application.getAndroidId() ||
    Application.getIosIdForVendorAsync?.() ||
    "unknown";

  const deviceMetadata = {
    uuid: uuid,
    platform: Device.osName?.toLowerCase(),
    brand: Device.brand,
    modelName: Device.modelId || Device.modelName,
    osVersion: Device.osVersion,
    isEmulator: !Device.isDevice,
    deviceName: Device.deviceName,
    productName: Constants.deviceName || Device.productName,
  };

  const deviceFingerprint = [
    "v1",
    deviceMetadata.uuid,
    deviceMetadata.platform,
    deviceMetadata.brand,
    deviceMetadata.modelName,
    deviceMetadata.osVersion,
    deviceMetadata.deviceName,
    deviceMetadata.productName,
  ].join("|");

  return {
    deviceFingerprint,
    deviceMetadata,
  };
};