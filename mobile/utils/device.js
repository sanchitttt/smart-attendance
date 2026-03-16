"use strict";
exports.__esModule = true;
exports.getDeviceInfo = void 0;
var Device = require("expo-device");
var Application = require("expo-application");
var expo_constants_1 = require("expo-constants");
var getDeviceInfo = function () {
    var _a, _b;
    var uuid = Application.getAndroidId() ||
        ((_a = Application.getIosIdForVendorAsync) === null || _a === void 0 ? void 0 : _a.call(Application)) ||
        "unknown";
    var deviceMetadata = {
        uuid: uuid,
        platform: (_b = Device.osName) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
        brand: Device.brand,
        modelName: Device.modelId || Device.modelName,
        osVersion: Device.osVersion,
        isEmulator: !Device.isDevice,
        deviceName: Device.deviceName,
        productName: expo_constants_1["default"].deviceName || Device.productName
    };
    var deviceFingerprint = [
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
        deviceFingerprint: deviceFingerprint,
        deviceMetadata: deviceMetadata
    };
};
exports.getDeviceInfo = getDeviceInfo;
