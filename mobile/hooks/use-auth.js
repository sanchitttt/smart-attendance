"use strict";
exports.__esModule = true;
var react_1 = require("react");
var auth_1 = require("firebase/auth");
var firebase_1 = require("../services/firebase");
function useAuth() {
    var _a = react_1.useState(null), user = _a[0], setUser = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1];
    react_1.useEffect(function () {
        var unsubscribe = auth_1.onAuthStateChanged(firebase_1.auth, function (user) {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    return { user: user, loading: loading };
}
exports["default"] = useAuth;
