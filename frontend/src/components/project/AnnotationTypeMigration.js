import React from "react"
import { mixins } from "quick-n-dirty-react"

const style = {
    table: {
        display: "grid",
        gridColumnGap: "3px",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
    },
    colorStyle: code => ({
        display: "inline-block",
        width: "15px",
        height: "15px",
        background: code,
        border: "1px solid #aaa",
        marginLeft: "3px",
    }),
    header: {
        ...mixins.smallFont,
        color: "#666",
        fontWeight: 600,
        borderBottom: "1px solid #999",
        marginBottom: "5px",
    },
    dropDown: {
        ...mixins.textInput,
        padding: "2px 6px",
    },
}

class AnnotationTypeMigration extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentMapping: {},
        }

        this.changeReplace = this.changeReplace.bind(this)
        this.changeKeepDelete = this.changeKeepDelete.bind(this)
        this.updateMapping = this.updateMapping.bind(this)

        this.dropDowns = {}
        this.radioDelete = {}
        this.radioKeep = {}
    }

    componentDidMount() {
        const currentMapping = {}
        Object.keys(this.props.old).forEach(existingType => {
            currentMapping[existingType] = -1 // default is to delete (-1)
        })
        this.setState({
            currentMapping,
        })
        this.props.setMapping(currentMapping)
    }

    changeReplace(oldType) {
        return ev => {
            const selected = ev.target.value
            this.updateMapping(oldType, selected)
            this.radioKeep[oldType].checked = false
            this.radioDelete[oldType].checked = false
        }
    }

    changeKeepDelete(oldType) {
        return ev => {
            const selected = parseInt(ev.target.value, 10)
            this.updateMapping(oldType, selected)
            this.dropDowns[oldType].value = ""
        }
    }

    updateMapping(oldType, newValue) {
        this.setState(oldState => {
            const { currentMapping } = oldState
            currentMapping[oldType] = newValue
            this.props.setMapping(currentMapping)
            return {
                ...oldState,
                currentMapping,
            }
        })
    }

    render() {
        return (
            <div style={style.table}>
                <div style={style.header}>Old Type</div>
                <div style={style.header}>Replace With</div>
                <div style={style.header}>Remove</div>
                <div style={style.header}>Keep</div>
                {Object.keys(this.state.currentMapping).map(oldType => [
                    <div key="type">
                        {oldType}
                        <span style={style.colorStyle(this.props.old[oldType])} />
                    </div>,
                    <div key="replace">
                        <select
                            onChange={this.changeReplace(oldType)}
                            ref={el => {
                                this.dropDowns[oldType] = el
                            }}
                            style={style.dropDown}
                        >
                            <option value="0"></option>
                            {Object.keys(this.props.new).map(newType => (
                                <option value={newType} key={newType}>
                                    {newType}
                                </option>
                            ))}
                        </select>
                    </div>,
                    <div key="remove">
                        <input
                            type="radio"
                            name={oldType}
                            value={-1}
                            onChange={this.changeKeepDelete(oldType)}
                            defaultChecked
                            ref={el => {
                                this.radioDelete[oldType] = el
                            }}
                        />
                    </div>,
                    <div key="keep">
                        <input
                            type="radio"
                            name={oldType}
                            value={1}
                            onChange={this.changeKeepDelete(oldType)}
                            ref={el => {
                                this.radioKeep[oldType] = el
                            }}
                        />
                    </div>,
                ])}
            </div>
        )
    }
}

export default AnnotationTypeMigration
