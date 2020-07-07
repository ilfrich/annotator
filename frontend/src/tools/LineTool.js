import React from "react"
import mixins from "../mixins"
import PolygonTool from "./PolygonTool"

class LineToolOptionPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPolygon: null,
        }
    }

    render() {
        return (
            <div>
                {this.state.currentPolygon != null && this.state.currentPolygon.length > 2 ? (
                    <button style={mixins.button} type="button" onClick={this.props.onSave}>
                        Finish
                    </button>
                ) : (
                    <em style={mixins.smallFont}>Start clicking points in the canvas to compose a line.</em>
                )}
            </div>
        )
    }
}

class LineTool extends PolygonTool {
    getOptionPanel() {
        const handleSaveEvent = () => {
            this.add([...this.currentPolygon])
            this.currentPolygon = null
        }

        return (
            <LineToolOptionPanel
                ref={el => {
                    this.optionPanel = el
                }}
                onSave={handleSaveEvent}
            />
        )
    }

    drawPolygon(polygon, close = true) {
        super.drawPolygon(polygon, false)
    }
}

export default LineTool
