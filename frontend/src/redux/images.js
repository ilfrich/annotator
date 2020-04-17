import Alert from "react-s-alert"
import util from "../util"

const imageActions = {
    UPLOAD_IMAGE: "UPLOAD_IMAGE",
    GET_IMAGES: "GET_IMAGES",
    GET_IMAGE: "GET_IMAGE",
    SELECT_IMAGE: "SELECT_IMAGE",
    DELETE_IMAGE: "DELETE_IMAGE",
    UPDATE_IMAGE_LABEL: "UPDATE_IMAGE_LABEL",
}

export const uploadImage = (projectId, formData) => {
    const headers = util.getJsonHeader()
    delete headers["Content-Type"]
    return {
        type: imageActions.UPLOAD_IMAGE,
        payload: fetch(`/api/projects/${projectId}/images`, {
            headers,
            method: "POST",
            body: formData,
        })
            .then(util.restHandler)
            .then(imageMeta => ({
                projectId,
                image: imageMeta,
            })),
    }
}

export const getImages = projectId => ({
    type: imageActions.GET_IMAGES,
    payload: fetch(`/api/projects/${projectId}/images`, {
        headers: util.getJsonHeader(),
    })
        .then(util.restHandler)
        .then(images => ({
            projectId,
            images,
        })),
})

export const deleteImage = (projectId, imageId) => ({
    type: imageActions.DELETE_IMAGE,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}`, {
        method: "DELETE",
        headers: util.getJsonHeader(),
    })
        .then(util.restHandler)
        .then(() => ({ projectId, imageId })),
})

export const getImage = (projectId, imageId) => ({
    type: imageActions.GET_IMAGE,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}`, {
        headers: util.getJsonHeader(),
    }).then(util.restHandler),
})

export const selectImage = image => ({
    type: imageActions.SELECT_IMAGE,
    payload: image,
})

export const updateImageLabel = (projectId, imageId, newLabel) => ({
    type: imageActions.UPDATE_IMAGE_LABEL,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify({
            label: newLabel,
        }),
    }).then(util.restHandler),
})

const initialState = {
    imageList: {}, // project ID -> image ID -> image
    currentImage: null,
}

export const ImageReducer = (state = initialState, action) => {
    switch (action.type) {
        case `${imageActions.UPLOAD_IMAGE}${util.actionTypeSuffixes.fulfilled}`: {
            const imageList = { ...state.imageList }
            if (imageList[action.payload.projectId] == null) {
                imageList[action.payload.projectId] = {}
            }
            imageList[action.payload.projectId][action.payload.image._id] = action.payload.image
            Alert.success("Image uploaded")
            return {
                ...state,
                imageList,
            }
        }
        case `${imageActions.GET_IMAGES}${util.actionTypeSuffixes.fulfilled}`: {
            const imageList = { ...state.imageList }
            const imageMap = {}
            action.payload.images.forEach(image => {
                imageMap[image._id] = image
            })
            imageList[action.payload.projectId] = imageMap
            return {
                ...state,
                imageList,
            }
        }
        case `${imageActions.DELETE_IMAGE}${util.actionTypeSuffixes.fulfilled}`: {
            const imageList = { ...state.imageList }
            if (imageList[action.payload.projectId] == null) {
                return state
            }
            delete imageList[action.payload.projectId][action.payload.imageId]
            Alert.success("Image deleted")
            return {
                ...state,
                imageList,
            }
        }
        case `${imageActions.GET_IMAGE}${util.actionTypeSuffixes.fulfilled}`:
            return {
                ...state,
                currentImage: action.payload,
            }
        case imageActions.SELECT_IMAGE:
            return {
                ...state,
                currentImage: action.payload,
            }
        case `${imageActions.UPDATE_IMAGE_LABEL}${util.actionTypeSuffixes.fulfilled}`: {
            const result = { ...state }
            const imageList = { ...state.imageList }
            if (imageList[action.payload.projectId] != null) {
                imageList[action.payload.projectId][action.payload._id] = action.payload
                result.imageList = imageList
            }
            if (state.currentImage != null && state.currentImage._id === action.payload._id) {
                result.currentImage = action.payload
            }
            Alert.success("Label updated")
            return result
        }
        default:
            return state
    }
}
