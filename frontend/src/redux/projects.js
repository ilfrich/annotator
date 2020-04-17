import Alert from "react-s-alert"
import util from "../util"

const projectActions = {
    GET_PROJECTS: "GET_PROJECTS",
    CREATE_PROJECT: "CREATE_PROJECT",
    DELETE_PROJECT: "DELETE_PROJECT",
    UPDATE_ANNOTATION_TYPES: "UPDATE_ANNOTATION_TYPES",
}

export const getProjects = () => ({
    type: projectActions.GET_PROJECTS,
    payload: fetch("/api/projects", {
        headers: util.getJsonHeader(),
    }).then(util.restHandler),
})

export const createProject = projectData => ({
    type: projectActions.CREATE_PROJECT,
    payload: fetch("/api/projects", {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify(projectData),
    }).then(util.restHandler),
})

export const deleteProject = projectId => ({
    type: projectActions.DELETE_PROJECT,
    payload: fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
    })
        .then(util.restHandler)
        .then(() => ({ projectId })),
})

export const updateAnnotationTypes = (projectId, annotationTypes) => ({
    type: projectActions.UPDATE_ANNOTATION_TYPES,
    payload: fetch(`/api/projects/${projectId}/annotation-types`, {
        method: "POST",
        headers: util.getJsonHeader(),
        body: JSON.stringify({ annotationTypes }),
    }).then(util.restHandler),
})

const initialState = {
    projectList: {},
}

// reducer

export const ProjectReducer = (state = initialState, action) => {
    switch (action.type) {
        case `${projectActions.GET_PROJECTS}${util.actionTypeSuffixes.fulfilled}`: {
            return {
                ...state,
                projectList: util.createIdMap(action.payload),
            }
        }
        case `${projectActions.DELETE_PROJECT}${util.actionTypeSuffixes.fulfilled}`: {
            const projectList = { ...state.projectList }
            delete projectList[action.payload.projectId]
            Alert.success("Project deleted")
            return {
                ...state,
                projectList,
            }
        }
        case `${projectActions.CREATE_PROJECT}${util.actionTypeSuffixes.fulfilled}`: {
            const projectList = { ...state.projectList }
            projectList[action.payload._id] = action.payload
            Alert.success("Project created")
            return {
                ...state,
                projectList,
            }
        }
        case `${projectActions.UPDATE_ANNOTATION_TYPES}${util.actionTypeSuffixes.fulfilled}`: {
            const projectList = { ...state.projectList }
            projectList[action.payload._id] = action.payload
            Alert.success("Project updated")
            return {
                ...state,
                projectList,
            }
        }
        default:
            return state
    }
}
