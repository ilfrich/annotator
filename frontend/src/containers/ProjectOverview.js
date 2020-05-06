import React from "react"
import { connect } from "react-redux"
import ImageUploadForm from "../components/forms/ImageUploadForm"
import ImageList from "../components/images/ImageList"
import { getProjects } from "../redux/projects"
import { getImages } from "../redux/images"
import mixins from "../mixins"
import util from "../util"
import Breadcrumb from "../components/Breadcrumb"
import { getAnnotationForImage } from "../redux/annotations"
import AnnotationTypeList from "../components/project/AnnotationTypeList"
import ProjectSettingsImpex from "../components/project/ProjectSettingsImpex"

const style = {
    projectSettings: {
        display: "grid",
        gridTemplateColumns: "500px 500px",
    },
}

@connect(stores => ({
    projectList: stores.projects.projectList,
    imageList: stores.images.imageList,
    annotationList: stores.annotations.annotationList,
}))
class ProjectOverview extends React.Component {
    constructor(props) {
        super(props)
        this.getProjectId = this.getProjectId.bind(this)
        this.getProjectImages = this.getProjectImages.bind(this)
    }

    componentDidMount() {
        if (Object.keys(this.props.projectList).length === 0) {
            this.props.dispatch(getProjects())
        }
        if (this.getProjectId() != null) {
            this.props.dispatch(getImages(this.getProjectId()))
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.imageList[this.getProjectId()] != null && prevProps.imageList[this.getProjectId()] == null) {
            // incoming images
            this.getProjectImages().forEach(image => {
                this.props.dispatch(getAnnotationForImage(this.getProjectId(), image._id))
            })
        }
    }

    getProjectId() {
        return this.props.match.params.projectId
    }

    getProjectImages() {
        const projectId = this.getProjectId()
        if (this.props.imageList[projectId] == null) {
            return []
        }
        return util.idMapToList(this.props.imageList[projectId])
    }

    render() {
        if (this.getProjectId() == null || this.props.projectList[this.getProjectId()] == null) {
            return null
        }

        return (
            <div>
                <Breadcrumb project={this.props.projectList[this.getProjectId()]} />
                <h5 style={mixins.heading}>Upload Image</h5>
                <ImageUploadForm projectId={this.getProjectId()} />
                <h5 style={mixins.heading}>Images</h5>
                <ImageList
                    project={this.props.projectList[this.getProjectId()]}
                    images={this.getProjectImages()}
                    annotations={this.props.annotationList}
                />
                <h5 style={mixins.heading}>Annotation Types</h5>
                <div style={style.projectSettings}>
                    <div>
                        <AnnotationTypeList
                            projectId={this.getProjectId()}
                            annotationTypes={
                                this.props.projectList[this.getProjectId()]
                                    ? this.props.projectList[this.getProjectId()].annotationTypes
                                    : {}
                            }
                        />
                    </div>
                    <div>
                        <ProjectSettingsImpex project={this.props.projectList[this.getProjectId()]} />
                    </div>
                </div>
            </div>
        )
    }
}

export default ProjectOverview
