import React from "react"
import { connect } from "react-redux"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { mixins } from "quick-n-dirty-react"
import Alert from "react-s-alert"
import { updateAnnotationTypes } from "../../redux/projects"

const colorStyle = code => ({
    display: "inline-block",
    width: "15px",
    height: "15px",
    background: code,
    border: "1px solid #aaa",
    marginLeft: "3px",
})

const brightColors = ["#fff", "#0f0", "#ff0", "#0ff"]
const colors = ["#00f", "#0f0", "#fff", "#000", "#ff0", "#0ff", "#f0f"]

const style = {
    table: {
        display: "grid",
        gridTemplateColumns: "60px 200px 200px",
        gridRowGap: "8px",
        paddingLeft: "15px",
    },
    color: code => colorStyle(code),
    newColor: code => ({
        ...colorStyle(code),
        ...mixins.clickable,
    }),
    deleteIcon: {
        ...mixins.clickable,
        ...mixins.red,
    },
    addIcon: {
        ...mixins.clickable,
        ...mixins.green,
    },
    listHeader: {
        ...mixins.smallFont,
        fontWeight: "600",
        borderBottom: "1px solid #999",
    },
    formLineElement: {
        paddingTop: "15px",
    },
    check: backgroundColor => ({
        fontSize: "18px",
        color: brightColors.indexOf(backgroundColor) !== -1 ? "#000" : "#fff",
        paddingLeft: "2px",
        display: "inline-block",
    }),
}

@connect(() => ({}))
class AnnotationTypeList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            annotationTypes: {},
            currentColor: null,
            hasChanged: false,
        }
        this.saveTypes = this.saveTypes.bind(this)
        this.initState = this.initState.bind(this)
        this.addType = this.addType.bind(this)
        this.removeType = this.removeType.bind(this)
    }

    componentDidMount() {
        this.initState(this.props.project)
    }

    initState(project) {
        if (project != null) {
            this.setState({
                annotationTypes: project.annotationTypes || {},
            })
        }
    }

    addType() {
        if (this.newId.value.trim() === "" || this.state.currentColor == null) {
            Alert.warning("Please provide an identifier and select a colour")
            return
        }
        this.setState(oldState => {
            const annotationTypes = { ...oldState.annotationTypes }
            annotationTypes[this.newId.value] = oldState.currentColor
            this.newId.value = ""
            return {
                ...oldState,
                annotationTypes,
                currentColor: null,
                hasChanged: true,
            }
        })
    }

    changeColor(colorCode) {
        return () => {
            this.setState({
                currentColor: colorCode,
            })
        }
    }

    removeType(typeId) {
        return () => {
            this.setState(oldState => {
                const annotationTypes = { ...oldState.annotationTypes }
                delete annotationTypes[typeId]
                return {
                    ...oldState,
                    annotationTypes,
                    hasChanged: true,
                }
            })
        }
    }

    saveTypes() {
        const { project } = this.props
        this.props.dispatch(updateAnnotationTypes(project._id, this.state.annotationTypes))
        // removes the save button to avoid double clicking
        this.setState({
            hasChanged: false,
        })
    }

    render() {
        return (
            <div>
                <div style={style.table}>
                    <div style={style.listHeader} />
                    <div style={style.listHeader}>Identifier</div>
                    <div style={style.listHeader}>Colour</div>
                    {Object.keys(this.state.annotationTypes).map(aType => [
                        <div key="minus" style={mixins.center}>
                            <FontAwesomeIcon icon="minus" style={style.deleteIcon} onClick={this.removeType(aType)} />
                        </div>,
                        <div key="id">{aType}</div>,
                        <div key="color">
                            <span style={style.color(this.state.annotationTypes[aType])} />
                        </div>,
                    ])}
                    <div style={{ ...mixins.center, ...style.formLineElement }}>
                        <FontAwesomeIcon icon="plus" style={style.addIcon} onClick={this.addType} />
                    </div>
                    <div>
                        <input
                            type="text"
                            style={mixins.textInput}
                            ref={el => {
                                this.newId = el
                            }}
                        />
                    </div>
                    <div style={style.formLineElement}>
                        {colors
                            .filter(color => Object.values(this.state.annotationTypes).indexOf(color) === -1)
                            .map(colorCode => (
                                <div
                                    key={colorCode}
                                    style={style.newColor(colorCode)}
                                    onClick={this.changeColor(colorCode)}
                                >
                                    {this.state.currentColor === colorCode ? (
                                        <span style={style.check(colorCode)}>&times;</span>
                                    ) : null}
                                </div>
                            ))}
                    </div>
                </div>
                <div style={mixins.buttonLine}>
                    {this.state.hasChanged === true ? (
                        <button type="button" style={mixins.button} onClick={this.saveTypes}>
                            Save Types
                        </button>
                    ) : null}
                </div>
            </div>
        )
    }
}

export default AnnotationTypeList
