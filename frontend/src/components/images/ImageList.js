import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import mixins from "../../mixins"
import Popup from "../Popup"
import { deleteImage } from "../../redux/images"
import util from "../../util"

const TILE_WIDTH = 200 - 22

const style = {
    imageList: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        alignContent: "center",
    },
    imageTile: {
        ...mixins.relative,
        border: "1px solid #ccc",
        padding: "10px",
        width: `${TILE_WIDTH}px`,
        height: `${TILE_WIDTH}px`,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
    },
    imageLine: {
        width: "100%",
    },
    image: {
        maxWidth: `${TILE_WIDTH}px`,
        maxHeight: `${TILE_WIDTH}px`,
    },
    annotationCount: {
        position: "absolute",
        padding: "2px 5px",
        border: "1px solid #ddd",
        background: "#ddd",
        borderRadius: "5px",
        top: "10px",
        right: "14px",
        fontSize: "13px",
        fontWeight: "600",
    },
    deleteLayer: {
        ...mixins.clickable,
        padding: "10px",
        position: "absolute",
        bottom: "4px",
        right: "4px",
    },
    imageLabel: {
        position: "absolute",
        left: "15px",
        bottom: "18px",
        padding: "4px",
        background: "#ddd",
        width: "125px",
        borderRadius: "5px",
        cursor: "normal",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "13px",
    },
    triangleAnnotation: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "0",
        height: "0",
        borderTop: `50px solid ${mixins.mainColor.color}`,
        borderRight: "50px solid transparent",
    },
    triangleText: {
        ...mixins.smallFont,
        paddingLeft: "5px",
        marginTop: "-45px",
        color: "#fff",
    },
}

@connect(() => ({}))
class ImageList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showDelete: false,
            deleteImageId: null,
        }

        this.toggleDelete = this.toggleDelete.bind(this)
        this.deleteImage = this.deleteImage.bind(this)
    }

    toggleDelete(imageId) {
        return event => {
            if (event != null) {
                event.preventDefault()
            }
            this.setState(oldState => ({
                ...oldState,
                showDelete: !oldState.showDelete,
                deleteImageId: imageId,
            }))
        }
    }

    deleteImage() {
        this.props.dispatch(deleteImage(this.props.project._id, this.state.deleteImageId))
        this.toggleDelete(null)()
    }

    render() {
        const getAnnotationCount = annotations => {
            if (annotations.shapes != null) {
                return annotations.shapes.length
            }
            let total = 0
            Object.values(annotations).forEach(annotation => {
                total += annotation.shapes.length
            })
            return total
        }
        return (
            <div style={style.imageList}>
                {this.props.images.map(imageMeta => (
                    <Link key={imageMeta._id} to={`/projects/${this.props.project._id}/images/${imageMeta._id}`}>
                        <div style={style.imageTile}>
                            <div style={style.imageLine}>
                                <img src={util.getImagePath(imageMeta.projectId, imageMeta._id)} style={style.image} />
                            </div>
                            <div style={style.annotationCount} title="Annotations">
                                {this.props.annotations[imageMeta._id] != null
                                    ? getAnnotationCount(this.props.annotations[imageMeta._id])
                                    : "-"}
                            </div>
                            {imageMeta.label != null && imageMeta.label.trim() !== "" ? (
                                <div style={style.imageLabel} title={imageMeta.label}>
                                    {imageMeta.label}
                                </div>
                            ) : null}
                            <div style={style.deleteLayer} onClick={this.toggleDelete(imageMeta._id)}>
                                <FontAwesomeIcon icon="trash-alt" style={mixins.deleteIcon} />
                            </div>
                            {imageMeta.numFrames != null ? (
                                <div style={style.triangleAnnotation}>
                                    <div style={style.triangleText}>{imageMeta.numFrames}</div>
                                </div>
                            ) : null}
                        </div>
                    </Link>
                ))}
                {this.state.showDelete ? (
                    <Popup
                        yes={this.deleteImage}
                        no={this.toggleDelete(null)}
                        cancel={this.toggleDelete(null)}
                        title="Delete Image"
                    >
                        <p>Are you sure you want to delete this image?</p>
                        <p>
                            <i>
                                This will delete all associated annotations and predictions, but not the models that
                                potentially trained on this image.
                            </i>
                        </p>
                    </Popup>
                ) : null}
            </div>
        )
    }
}

export default ImageList
