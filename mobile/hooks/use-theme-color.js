"use strict";
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
exports.__esModule = true;
exports.useThemeColor = void 0;
var theme_1 = require("@/constants/theme");
var use_color_scheme_1 = require("@/hooks/use-color-scheme");
function useThemeColor(props, colorName) {
    var _a;
    var theme = (_a = use_color_scheme_1.useColorScheme()) !== null && _a !== void 0 ? _a : 'light';
    var colorFromProps = props[theme];
    if (colorFromProps) {
        return colorFromProps;
    }
    else {
        return theme_1.Colors[theme][colorName];
    }
}
exports.useThemeColor = useThemeColor;
