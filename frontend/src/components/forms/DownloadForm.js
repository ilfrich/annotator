import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { mixins } from "quick-n-dirty-react"

const style = {
    toolIcon: {
        ...mixins.clickable,
        padding: "5px",
        border: "1px solid #333",
        borderRadius: "2px",
        marginRight: "8px",
        minWidth: "18px",
    },
}

class DownloadForm extends React.Component {
    static downloadBlob(blob, fileName) {
        if (window.navigator.msSaveOrOpenBlob) {
            // edge
            window.navigator.msSaveBlob(blob, fileName)
        } else {
            // chrome, ff, safari
            const elem = window.document.createElement("a")
            elem.href = window.URL.createObjectURL(blob)
            elem.download = fileName
            document.body.appendChild(elem)
            elem.click()
            document.body.removeChild(elem)
        }
    }

    constructor(props) {
        super(props)
        this.downloadImage = this.downloadImage.bind(this)
        this.downloadAnnotations = this.downloadAnnotations.bind(this)
    }

    downloadAnnotations() {
        let blobContent

        const addImageSize = annotationList => annotationList.map(annotation => {
            annotation.imageSize = [this.props.image.width, this.props.image.height]
            return annotation
        })

        if (this.props.image.numFrames != null) {
            // frame set
            const imageMap = {}
            // create lookup map for original file names
            if (this.props.image.originalFileNames != null) {
                Object.keys(this.props.image.originalFileNames).forEach(index => {
                    imageMap[index] = this.props.image.originalFileNames[index]
                })
            }
            // compile annotation result
            const result = {}
            Object.values(this.props.imageAnnotations).forEach(annotation => {
                const key = `${annotation.frameNum}`
                result[imageMap[key] || key] = addImageSize(annotation.shapes)
            })
            blobContent = [JSON.stringify(result)]
        } else {
            blobContent = [JSON.stringify(addImageSize(this.props.annotations))]
        }

        // download just annotations for current image
        const blob = new Blob(blobContent, { type: "application/json" })
        const hasLabel = this.props.image.label != null && this.props.image.label.trim() !== ""
        const fileName = `${hasLabel ? this.props.image.label : this.props.image._id}.json`
        DownloadForm.downloadBlob(blob, fileName)
    }

    downloadImage() {
        const extension = this.props.image.contentType.split("/")[1]
        const hasLabel = this.props.image.label != null && this.props.image.label.trim() !== ""
        const fileName = `${hasLabel ? this.props.image.label : this.props.image._id}.${extension}`
        const url = `/image/${this.props.image.projectId}/${this.props.image._id}`
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                DownloadForm.downloadBlob(blob, fileName)
            })
    }

    render() {
        return (
            <div>
                <FontAwesomeIcon
                    icon="file-image"
                    style={style.toolIcon}
                    title="Download Image"
                    onClick={this.downloadImage}
                />
                <FontAwesomeIcon
                    icon="download"
                    style={style.toolIcon}
                    title="Download Annotations"
                    onClick={this.downloadAnnotations}
                />
            </div>
        )
    }
}

export default DownloadForm
