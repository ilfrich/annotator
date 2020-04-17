import { mixins } from "quick-n-dirty-react"
/**
 * Created by Peter Ilfrich
 *
 *
 */
const mainColor = "#004"

const styles = {
    ...mixins,
    mainColor: {
        color: mainColor,
    },
    right: {
        textAlign: "right",
    },
    center: {
        textAlign: "center",
    },
    clickable: {
        cursor: "pointer",
    },
    white: {
        color: "#fff",
    },
    red: {
        color: "#900",
    },
    bold: {
        fontWeight: "bold",
    },
    backdrop: {
        position: "fixed",
        top: "0",
        left: "0",
        background: "rgba(60, 60, 60, 0.3)",
        width: "100%",
        height: "100%",
    },
    clearFix: {
        clear: "both",
    },
    popup: {
        container: {
            margin: "auto",
            marginTop: "150px",
            background: "#eee",
            border: "1px solid #eee",
            borderRadius: "10px",
            position: "relative",
        },
        header: {
            borderBottom: "1px solid #ccc",
            fontSize: "18px",
            color: "#aaa",
            fontWeight: "bold",
            padding: "30px",
        },
        body: {
            padding: "10px 30px",
        },
        footer: {
            borderTop: "1px solid #ccc",
            textAlign: "right",
            padding: "30px",
        },
        close: {
            position: "absolute",
            right: "30px",
            top: "10px",
            cursor: "pointer",
        },
    },
    label: {
        display: "inline-block",
        maxWidth: "!00%",
        fontWeight: "700",
        marginTop: "10px",
        marginBottom: "5px",
        marginLeft: "10px",
        fontSize: "14px",
    },
    textInput: {
        fontSize: "14px",
        lineHeight: "1.2",
        color: "#555",
        backgroundColor: "#fff",
        borderLeft: "0px",
        borderRight: "0px",
        borderTop: "0px",
        borderBottom: "1px solid #666666",
        borderRadius: "0px",
        outline: "none",
        display: "block",
        width: "calc(100% - 12px)",
        height: "31px",
        padding: "0px 6px",
    },
    button: {
        borderRadius: "5px",
        padding: "6px 10px",
        minWidth: "100px",
        borderColor: mainColor,
        backgroundColor: mainColor,
        fontSize: "14px",
        color: "#fff",
        cursor: "pointer",
        outline: "none",
        marginRight: "5px",
    },
    inverseButton: {
        borderRadius: "5px",
        padding: "6px 20px",
        minWidth: "120px",
        borderColor: "#fff",
        color: mainColor,
        fontSize: "14px",
        backgroundColor: "#eee",
        cursor: "pointer",
        outline: "none",
        marginRight: "5px",
    },
    formLine: {
        textAlign: "left",
        padding: "0px 15px",
    },
    card: {
        backgroundColor: "#fff",
        padding: "10px",
        marginTop: "20px",
    },
    percentage(base, percent) {
        if (Math.isNaN(percent)) {
            return {
                ...base,
                color: "#666",
            }
        }
        if (percent < 20) {
            return {
                ...base,
                color: "#660000",
            }
        }
        if (percent < 40) {
            return {
                ...base,
                color: "#88450a",
            }
        }
        if (percent < 60) {
            return {
                ...base,
                color: "#a18d4b",
            }
        }
        if (percent < 80) {
            return {
                ...base,
                color: "#496613",
            }
        }
        return {
            ...base,
            color: "#090",
        }
    },
    panel: {
        padding: "30px",
        background: "#fff",
        color: "#333",
    },
    relative: {
        position: "relative",
    },
    smallFont: {
        fontSize: "13px",
    },
    noList: {
        margin: "0px",
        padding: "0px",
        listStyle: "none",
    },
    noLink: {
        color: "#333",
        textDecoration: "none",
    },
    buttonLine: {
        padding: "10px 0px",
    },
    vSpacer(px) {
        return {
            display: "block",
            paddingTop: `${px}px`,
        }
    },
    heading: {
        color: "#eee",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "10px 15px",
        background: mainColor,
    },
    deleteIcon: {
        color: "#900",
        padding: "5px",
        border: "1px solid #ddd",
        borderRadius: "15px",
        background: "#ddd",
        cursor: "pointer",
    },
    icon: {
        cursor: "pointer",
        textAlign: "center",
        display: "inline-block",
        position: "relative",
        padding: "5px",
        border: "1px solid #333",
        borderRadius: "2px",
        marginRight: "8px",
        minWidth: "18px",
    },
}

mixins.buttonDisabled = {
    ...mixins.button,
    background: "#79818f",
    cursor: "not-allowed",
}
mixins.buttonPending = {
    ...mixins.button,
    background: "#79818f",
    cursor: "wait",
}

export default styles
