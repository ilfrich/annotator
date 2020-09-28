import React from "react"
import { connect } from "react-redux"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { mixins, Popup, NotificationBar } from "quick-n-dirty-react"
import { getImage, selectImage, updateImageLabel } from "../redux/images"
import {
    createAnnotation,
    createFrameAnnotation,
    getAnnotationForImage,
    updateAnnotation,
    updateFrameAnnotation,
} from "../redux/annotations"
import ImageAnnotation from "../components/images/ImageAnnotation"
import { getProjects } from "../redux/projects"
import Breadcrumb from "../components/Breadcrumb"
import AnnotationTypeSelector from "../components/forms/AnnotationTypeSelector"

const style = {
    editIcon: {
        ...mixins.clickable,
    },
    missingLabel: {
        ...mixins.clickable,
        fontSize: "14px",
        fontFamily: '"Courier New", Courier, monospace',
    },
    imageFileName: {
        ...mixins.trimOverflow,
        ...mixins.indent(10),
        maxWidth: "calc(100vw - 400px)",
        fontSize: "14px",
        fontFamily: "Courier",
        color: "#666",
    },
    copyIcon: {},
}

@connect(store => ({
    projects: store.projects.projectList,
    currentImage: store.images.currentImage,
    images: store.images.imageList,
    annotations: store.annotations.annotationList,
}))
class ImageView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentAnnotationType: null,
            editLabel: false,
            currentFrame: null,
        }

        this.getImageId = this.getImageId.bind(this)
        this.getProjectId = this.getProjectId.bind(this)
        this.saveAnnotation = this.saveAnnotation.bind(this)
        this.changeCurrentAnnotationType = this.changeCurrentAnnotationType.bind(this)
        this.updateEditLabel = this.updateEditLabel.bind(this)
        this.toggleEditLabel = this.toggleEditLabel.bind(this)
        this.setFrame = this.setFrame.bind(this)
        this.copyLabel = this.copyLabel.bind(this)
    }

    componentDidMount() {
        // project
        if (this.props.projects[this.getProjectId()] == null) {
            this.props.dispatch(getProjects())
        }
        // image related
        if (
            this.props.images[this.getProjectId()] != null &&
            this.props.images[this.getProjectId()][this.getImageId()] != null
        ) {
            this.props.dispatch(selectImage(this.props.images[this.getProjectId()][this.getImageId()]))
        } else {
            this.props.dispatch(getImage(this.getProjectId(), this.getImageId()))
        }
        // annotations
        this.props.dispatch(getAnnotationForImage(this.getProjectId(), this.getImageId()))
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.state.currentFrame == null &&
            this.props.currentImage != null &&
            this.props.currentImage.numFrames != null
        ) {
            this.setFrame(0)
        }
    }

    getImageId() {
        return this.props.match.params.imageId
    }

    getProjectId() {
        return this.props.match.params.projectId
    }

    setFrame(newFrame) {
        this.setState({
            currentFrame: newFrame,
        })
    }

    changeCurrentAnnotationType(selectedType) {
        this.setState({
            currentAnnotationType: selectedType,
        })
    }

    saveAnnotation(data, frameNum = null) {
        if (frameNum == null) {
            // default single image handling
            if (this.props.annotations[this.getImageId()] == null) {
                // create new annotation
                this.props.dispatch(
                    createAnnotation(this.getProjectId(), this.getImageId(), {
                        shapes: data,
                        imageId: this.getImageId(),
                        projectId: this.getProjectId(),
                    })
                )
            } else {
                // update existing annotation
                const existing = this.props.annotations[this.getImageId()]
                existing.shapes = data
                this.props.dispatch(updateAnnotation(existing.projectId, existing.imageId, existing))
            }
            return
        }

        // handling for frame
        if (
            this.props.annotations[this.getImageId()] == null ||
            this.props.annotations[this.getImageId()][frameNum] == null
        ) {
            // create new annotation
            this.props.dispatch(
                createFrameAnnotation(this.getProjectId(), this.getImageId(), {
                    shapes: data,
                    imageId: this.getImageId(),
                    projectId: this.getProjectId(),
                    frameNum,
                })
            )
        } else {
            // update existing annotation
            const existing = this.props.annotations[this.getImageId()][frameNum]
            existing.shapes = data
            this.props.dispatch(updateFrameAnnotation(existing.projectId, existing.imageId, existing))
        }
    }

    toggleEditLabel() {
        this.setState(oldState => ({
            ...oldState,
            editLabel: !oldState.editLabel,
        }))
    }

    updateEditLabel() {
        const newLabel = this.newLabel.value
        this.props.dispatch(updateImageLabel(this.getProjectId(), this.props.currentImage._id, newLabel))
        this.setState({
            editLabel: false,
        })
    }

    copyLabel(label) {
        return () => {
            // copy string
            const el = document.createElement("textarea")
            el.value = label
            document.body.appendChild(el)
            el.select()
            document.execCommand("copy")
            document.body.removeChild(el)
            this.alert.info("Copied to clipboard")
        }
    }

    render() {
        if (this.props.currentImage == null || this.props.projects[this.getProjectId()] == null) {
            return null
        }

        const title =
            this.props.currentImage.numFrames == null
                ? this.props.currentImage.originalFileNames
                : this.props.currentImage.originalFileNames[this.state.currentFrame]

        return (
            <div>
                <NotificationBar
                    ref={el => {
                        this.alert = el
                    }}
                    position="left"
                />
                <Breadcrumb project={this.props.projects[this.getProjectId()]}>
                    <span>
                        {this.props.currentImage.label}
                        {this.props.currentImage.label == null ? (
                            <span style={style.missingLabel} onClick={this.toggleEditLabel}>
                                [Provide Label]
                            </span>
                        ) : null}{" "}
                        <FontAwesomeIcon
                            icon="edit"
                            style={style.editIcon}
                            onClick={this.toggleEditLabel}
                            title="Update Label"
                        />
                    </span>

                    {this.state.editLabel ? (
                        <Popup cancel={this.toggleEditLabel} ok={this.updateEditLabel} title="Update Label">
                            <label style={mixins.label} htmlFor="new-label">
                                Label
                            </label>
                            <input
                                type="text"
                                style={mixins.textInput}
                                ref={el => {
                                    this.newLabel = el
                                }}
                                defaultValue={this.props.currentImage.label}
                            />
                        </Popup>
                    ) : null}
                </Breadcrumb>

                {this.state.currentFrame != null || this.props.currentImage.numFrames == null ? (
                    <div style={style.imageFileName}>
                        <FontAwesomeIcon
                            title="Copy File Name"
                            icon="copy"
                            style={{ ...mixins.clickable, ...mixins.indent(10) }}
                            onClick={this.copyLabel(title)}
                        />
                        <span style={mixins.indent(10)} title={title}>
                            {title}
                        </span>
                    </div>
                ) : null}
                <AnnotationTypeSelector
                    project={this.props.projects[this.getProjectId()]}
                    changeType={this.changeCurrentAnnotationType}
                    currentType={this.state.currentAnnotationType}
                />
                <ImageAnnotation
                    project={this.props.projects[this.getProjectId()]}
                    image={this.props.currentImage}
                    annotation={this.props.annotations[this.props.currentImage._id]}
                    update={this.saveAnnotation}
                    annotationType={this.state.currentAnnotationType}
                    setFrame={this.setFrame}
                />
            </div>
        )
    }
}

export default ImageView
