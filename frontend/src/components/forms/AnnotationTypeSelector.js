import React from "react"
import { mixins } from "quick-n-dirty-react"

const style = {
    grid: {
        display: "grid",
        gridTemplateColumns: "300px 500px",
    },
    legendItem: {
        paddingTop: "45px",
        display: "inline-block",
        marginLeft: "5px",
        fontSize: "16px",
    },
    color: code => ({
        display: "inline-block",
        width: "13px",
        height: "13px",
        background: code,
        border: "1px solid #aaa",
        marginLeft: "8px",
        marginRight: "3px",
    }),
}

const AnnotationTypeSelector = props => {
    const changeType = ev => {
        const value = ev.target.value === "" ? null : ev.target.value
        props.changeType(value)
    }

    return (
        <div style={style.grid}>
            <div>
                <label style={mixins.label}>Annotation Type</label>
                <div>
                    <select onChange={changeType} style={mixins.textInput} defaultValue={props.currentType}>
                        <option value="">No Specific Type</option>
                        {Object.keys(props.project.annotationTypes || {}).map(key => (
                            <option value={key} key={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                {Object.keys(props.project.annotationTypes || {}).map(type => (
                    <div style={style.legendItem} key={type}>
                        <span style={style.color(props.project.annotationTypes[type])} />
                        <span>{type}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AnnotationTypeSelector
