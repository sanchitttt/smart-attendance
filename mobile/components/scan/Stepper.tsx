import { StyleSheet,Text,View } from "react-native";


const Stepper = ({ step }: { step: number }) => {
    const getCircleStyle = (index: number) => {
        if (step > index) return styles.completedCircle;
        if (step === index) return styles.activeCircle;
        return styles.inactiveCircle;
    };

    const getTextStyle = (index: number) => {
        if (step > index) return styles.completedText;
        if (step === index) return styles.activeText;
        return styles.inactiveText;
    };
    return (
        <View style={styles.stepper}>
            {["Scan QR","Take Selfie","Complete"].map((label,i) => {
                const index = i + 1;

                return (
                    <View key={i} style={styles.stepItem}>
                        <View style={[styles.circle,getCircleStyle(index)]}>
                            <Text style={styles.circleText}>
                                {step > index ? "✓" : index}
                            </Text>
                        </View>

                        <Text style={[styles.stepText,getTextStyle(index)]}>
                            {label}
                        </Text>

                        {index !== 3 && <View style={styles.line} />}
                    </View>
                );
            })}
        </View>
    );
};

export default Stepper;

const styles = StyleSheet.create({
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },

    stepItem: {
        alignItems: "center",
    },

    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#d6d6ff",
        justifyContent: "center",
        alignItems: "center",
    },

    activeCircle: {
        backgroundColor: "#ffffff",
    },

    circleText: {
        color: "#5B4BFF",
        fontWeight: "600",
    },

    activeCircleText: {
        color: "#5B4BFF",
        fontWeight: "700",
    },

    stepText: {
        fontSize: 12,
        marginTop: 4,
        color: "#cfcfff",
    },
    line: {
        width: 50,
        height: 2,
        backgroundColor: "#d6d6ff",
        marginHorizontal: 8,
    },
    completedCircle: {
        backgroundColor: "#16a34a",
    },
    inactiveCircle: {
        backgroundColor: "#ddd",
    },

    completedText: {
        color: "#16a34a",
        fontWeight: "600",
    },

    activeText: {
        color: "#5B4BFF",
        fontWeight: "600",
    },

    inactiveText: {
        color: "#999",
    },
});