import Alert from "react-s-alert"
import util from "quick-n-dirty-utils"

const annotationActions = {
    GET_ANNOTATION_FOR_IMAGE: "GET_ANNOTATION_FOR_IMAGE",
    CREATE_ANNOTATION: "CREATE_ANNOTATION",
    UPDATE_ANNOTATION: "UPDATE_ANNOTATION",
}

export const getAnnotationForImage = (projectId, imageId) => ({
    type: annotationActions.GET_ANNOTATION_FOR_IMAGE,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}/annotations`, {
        headers: util.getJsonHeader(),
    })
        .then(util.restHandler)
        .then(annotation => ({
            imageId,
            projectId,
            annotation: Object.keys(annotation).length === 0 ? null : annotation,
        })),
})

export const updateAnnotation = (projectId, imageId, annotation) => ({
    type: annotationActions.UPDATE_ANNOTATION,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}/annotations/${annotation._id}`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify(annotation),
    })
        .then(util.restHandler)
        .then(response => ({ projectId, imageId, annotation: response })),
})

export const updateFrameAnnotation = (projectId, imageId, annotation) => ({
    type: annotationActions.UPDATE_ANNOTATION,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}/annotations/${annotation._id}`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify(annotation),
    })
        .then(util.restHandler)
        .then(response => ({ projectId, imageId, annotation: [response] })),
})

export const createAnnotation = (projectId, imageId, annotation) => ({
    type: annotationActions.CREATE_ANNOTATION,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}/annotations`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify(annotation),
    })
        .then(util.restHandler)
        .then(response => ({ projectId, imageId, annotation: response })),
})

export const createFrameAnnotation = (projectId, imageId, annotation) => ({
    type: annotationActions.CREATE_ANNOTATION,
    payload: fetch(`/api/projects/${projectId}/images/${imageId}/annotations`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify(annotation),
    })
        .then(util.restHandler)
        .then(response => ({ projectId, imageId, annotation: [response] })),
})

const initialState = {
    annotationList: {},
}

const handleAnnotationRetrieval = (state, action) => {
    const annotationList = { ...state.annotationList }
    let currentAnnotation = action.payload.annotation
    if (currentAnnotation != null && (currentAnnotation.forEach != null || currentAnnotation.frameNum != null)) {
        const currentAnnotations = annotationList[action.payload.imageId] || {}
        if (currentAnnotation.frameNum != null) {
            // single annotation during create
            currentAnnotations[currentAnnotation.frameNum] = currentAnnotation
        } else {
            // process list of annotations
            currentAnnotation.forEach(annotation => {
                currentAnnotations[annotation.frameNum] = annotation
            })
        }

        currentAnnotation = currentAnnotations
    }

    annotationList[action.payload.imageId] = currentAnnotation
    return {
        ...state,
        annotationList,
    }
}

export const AnnotationReducer = (state = initialState, action) => {
    switch (action.type) {
        case `${annotationActions.GET_ANNOTATION_FOR_IMAGE}${util.actionTypeSuffixes.fulfilled}`: {
            return handleAnnotationRetrieval(state, action)
        }
        case `${annotationActions.UPDATE_ANNOTATION}${util.actionTypeSuffixes.fulfilled}`: {
            Alert.success("Updated Annotations")
            return handleAnnotationRetrieval(state, action)
        }
        case `${annotationActions.CREATE_ANNOTATION}${util.actionTypeSuffixes.fulfilled}`: {
            Alert.success("Created Annotations")
            return handleAnnotationRetrieval(state, action)
        }
        default:
            return state
    }
}
