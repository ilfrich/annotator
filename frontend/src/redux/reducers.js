import { combineReducers } from "redux"
import { ProjectReducer } from "./projects"
import { ImageReducer } from "./images"
import { AnnotationReducer } from "./annotations"

// register all reducers for the various store spaces
export const rootReducer = combineReducers({
    projects: ProjectReducer,
    images: ImageReducer,
    annotations: AnnotationReducer,
})

export default rootReducer
