import React from "react"
import Alert from "react-s-alert"
import { connect } from "react-redux"
import { Popup, mixins } from "quick-n-dirty-react"
import { uploadImage } from "../../redux/images"

const style = {
    fileUpload: {
        display: "block",
        width: "300px",
    },
}

@connect(() => ({}))
class ImageUploadForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPopup: false,
            currentFileName: "",
        }
        this.uploadFile = null
        this.changeCurrentFileName = this.changeCurrentFileName.bind(this)
        this.togglePopup = this.togglePopup.bind(this)
        this.triggerUpload = this.triggerUpload.bind(this)
    }

    changeCurrentFileName(ev) {
        this.setState({
            currentFileName: ev.target.value,
        })
    }

    togglePopup() {
        let currentFileName = ""
        if (this.uploadFile.files != null && this.uploadFile.files.length > 0) {
            currentFileName = this.uploadFile.files[0].name
        }
        this.setState(oldState => ({
            ...oldState,
            showPopup: !oldState.showPopup,
            currentFileName,
        }))
    }

    triggerUpload() {
        const file = this.uploadFile.files[0]
        if (
            file.type.startsWith("image/") ||
            file.type === "application/zip" ||
            file.type === "application/x-zip-compressed"
        ) {
            // valid image, upload file
            const formData = new FormData()
            formData.append("file", file)
            formData.append("label", this.state.currentFileName)
            this.props.dispatch(uploadImage(this.props.projectId, formData))
        } else {
            console.error(`'${file.type}' is not a valid file type`)
            Alert.warning("Can only upload images or zip archives.")
        }
        // reset form
        this.uploadFile.value = ""
        // reset state
        this.setState({
            showPopup: false,
            currentFileName: "",
        })
    }

    render() {
        return (
            <div>
                <label style={mixins.label} id="upload-image">
                    Upload File
                </label>
                <input
                    type="file"
                    id="upload-image"
                    onChange={this.togglePopup}
                    ref={el => {
                        this.uploadFile = el
                    }}
                    style={style.fileUpload}
                />
                {this.state.showPopup ? (
                    <Popup title="Upload File" ok={this.triggerUpload} cancel={this.togglePopup}>
                        <label htmlFor="filename" style={mixins.label}>
                            Label
                        </label>
                        <input
                            id="filename"
                            type="text"
                            style={mixins.textInput}
                            defaultValue={this.state.currentFileName}
                            onChange={this.changeCurrentFileName}
                        />
                    </Popup>
                ) : null}
            </div>
        )
    }
}

export default ImageUploadForm
