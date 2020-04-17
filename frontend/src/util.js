/**
 * Created by Peter Ilfrich
 *
 *
 */
import moment from "moment"

/**
 * Utilities used across components
 */
export default {
    /**
     * Uses the hard-coded date format to format the provided date. If no valid date is provided, null is returned.
     * @param {(Date|moment.Moment)} date - the date to format
     * @returns {String} the formatted string or null
     */
    formatDate(date) {
        const d = moment(date)
        if (d.isValid()) {
            return moment(date).format("YYYY-MM-DD")
        }
        return null
    },

    /**
     * Returns the action.type suffixes for the promise redux middleware (used in the reducers)
     */
    actionTypeSuffixes: {
        pending: "_PENDING",
        fulfilled: "_FULFILLED",
        rejected: "_REJECTED",
    },

    normalise(val, min, max) {
        if (val < min) {
            return 0.0
        }
        if (val > max) {
            return 1.0
        }
        let minValue = min
        let maxValue = max
        if (max < min) {
            minValue = max
            maxValue = min
        }

        if (max === min) {
            return 1.0
        }
        return (val - minValue) / (maxValue - minValue)
    },

    getJsonHeader() {
        return {
            "Content-Type": "application/json",
        }
    },

    getAuthHeader() {
        return {
            Authorization: localStorage.getItem("auth_token"),
        }
    },

    logout() {
        localStorage.removeItem("auth_token")
    },

    getApiRequestHeader() {
        return {
            ...this.getAuthHeader(),
            ...this.getJsonHeader(),
        }
    },

    restHandler(response) {
        return new Promise((resolve, reject) => {
            if (response.status >= 400) {
                reject(new Error("Internal server error"))
                return
            }
            resolve(response.json())
        })
    },

    setAuthToken(token) {
        localStorage.setItem("auth_token", token)
    },

    createIdMap(objectList) {
        const result = {}
        if (objectList == null || objectList.forEach == null) {
            return result
        }
        objectList.forEach(item => {
            if (item._id != null) {
                result[item._id] = item
            } else if (item.id != null) {
                result[item.id] = item
            }
        })
        return result
    },

    idMapToList(idMap) {
        return Object.values(idMap)
    },

    getImagePath: (projectId, imageId) => `/image/${projectId}/${imageId}`,

    taskTypes: {
        predict: "PREDICT",
        training: "TRAIN",
    },

    getLocalStorageNumber(key, defaultValue) {
        const stored = localStorage.getItem(key)
        if (stored == null || stored.trim() === "") {
            return defaultValue
        }
        return parseInt(stored, 10)
    },

    getLocalStorageFloat(key, defaultValue) {
        const stored = localStorage.getItem(key)
        if (stored == null || stored.trim() === "") {
            return defaultValue
        }
        return parseFloat(stored)
    },

    hexToRgb(hexValue, alpha) {
        const hex = hexValue.replace("#", "")
        const r = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16)
        const g = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16)
        const b = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16)
        if (alpha) {
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        return `rgb(${r}, ${g}, ${b})`
    },
}
