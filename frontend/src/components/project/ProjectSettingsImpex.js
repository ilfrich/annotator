import React from "react"
import { connect } from "react-redux"
import { mixins, Popup } from "quick-n-dirty-react"
import Alert from "react-s-alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DownloadForm from "../forms/DownloadForm"
import AnnotationTypeMigration from "./AnnotationTypeMigration"
import { importProjectSettings } from "../../redux/projects"

const style = {
    exportLink: {
        ...mixins.textLink,
        display: "inline-block",
    },
    iconLabel: {
        paddingLeft: "10px",
    },
}

// not 100% ideal, but does the job
const urlFriendly = string =>
    string
        .replace(/\./, "")
        .replace(/\//, "")
        .replace("/\\/", "")
        .replace(/ /, "")
        .replace(/#/, "")

@connect(store => ({}))
class ProjectSettingsImpex extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showImportDialog: false,
            currentImport: null,
            annotationTypeMapping: null,
        }

        this.exportSettings = this.exportSettings.bind(this)
        this.prepareImportSettings = this.prepareImportSettings.bind(this)
        this.importSettings = this.importSettings.bind(this)
        this.cancelImport = this.cancelImport.bind(this)
        this.changeAnnotationTypeMapping = this.changeAnnotationTypeMapping.bind(this)
    }

    changeAnnotationTypeMapping(newMapping) {
        this.setState({
            annotationTypeMapping: newMapping,
        })
    }

    exportSettings() {
        const { annotationTypes } = this.props.project
        const exportJson = {
            annotationTypes,
        }
        const blobContent = [JSON.stringify(exportJson)]
        const blob = new Blob(blobContent, { type: "application/json" })
        const fileName = `annotator-settings-${urlFriendly(this.props.project.name)}.json`
        DownloadForm.downloadBlob(blob, fileName)
    }

    importSettings() {
        this.props.dispatch(
            importProjectSettings(this.props.project._id, this.state.currentImport, {
                annotationTypes: this.state.annotationTypeMapping,
            })
        )
        this.cancelImport()
    }

    cancelImport() {
        this.setState({
            showImportDialog: false,
            currentImport: false,
            annotationTypeMapping: null,
        })
        this.fileInput.value = ""
    }

    prepareImportSettings(ev) {
        // read the file content
        const file = ev.target.files[0]
        const reader = new FileReader()
        reader.onload = (() => loadEvent => {
            try {
                // parse the JSON of the file
                const jsonContent = JSON.parse(loadEvent.target.result)

                // update component (TODO: validate json)
                this.setState({
                    currentImport: jsonContent,
                    showImportDialog: true,
                })
            } catch (e) {
                Alert.error("Provided JSON file doesn't contain valid JSON")
            }
        })(file)
        reader.readAsText(file)
    }

    render() {
        return (
            <div>
                <div style={style.exportLink} onClick={this.exportSettings}>
                    <FontAwesomeIcon icon="file-export" />
                    <span style={style.iconLabel}>Export Project Settings</span>
                </div>
                <div>
                    <h5>Import Settings</h5>
                    <input
                        type="file"
                        onChange={this.prepareImportSettings}
                        accept="application/json"
                        ref={el => {
                            this.fileInput = el
                        }}
                    />
                    <br />
                    <i style={mixins.smallFont}>Please provide a JSON file with valid project settings.</i>
                </div>
                {this.state.showImportDialog ? (
                    <Popup cancel={this.cancelImport} ok={this.importSettings} title="Import Settings">
                        {Object.keys(this.props.project.annotationTypes).length === 0 ? (
                            <p>Please press &quot;Ok&quot; to import the settings</p>
                        ) : (
                            <div>
                                <p>
                                    You have pre-existing annotation types. Please choose what to do with these
                                    annotation types. Note that removing an old type will retain existing annotations,
                                    but un-assign their type. If you decide to keep an annotation type, you may have the
                                    same colour assigned twice, if one of the new types also uses that colour.
                                </p>
                                <AnnotationTypeMigration
                                    old={this.props.project.annotationTypes}
                                    new={this.state.currentImport.annotationTypes}
                                    setMapping={this.changeAnnotationTypeMapping}
                                />
                            </div>
                        )}
                    </Popup>
                ) : null}
            </div>
        )
    }
}

export default ProjectSettingsImpex
