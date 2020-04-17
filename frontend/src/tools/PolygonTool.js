import React from "react"
import common from "./common"
import mixins from "../mixins"

class PolygonToolOptionPanel extends React.Component {
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
                    <em style={mixins.smallFont}>Start clicking points in the canvas to compose a polygon.</em>
                )}
            </div>
        )
    }
}

class PolygonTool extends common.CommonTool {
    constructor(toolId, canvas, zoom, redraw, add) {
        super(toolId, canvas, zoom, redraw, add)
        this.currentPolygon = null
        this.optionPanel = null
    }

    getCursor() {
        return "crosshair"
    }

    getOptionPanel() {
        const handleSaveEvent = () => {
            this.add([...this.currentPolygon])
            this.currentPolygon = null
        }

        return (
            <PolygonToolOptionPanel
                ref={el => {
                    this.optionPanel = el
                }}
                onSave={handleSaveEvent}
            />
        )
    }

    handleClick(ev) {
        const mousePos = this.getMousePos(ev)
        if (this.currentPolygon == null) {
            // create initial polygon
            this.currentPolygon = [[mousePos.x, mousePos.y]]
            this.redraw()
            return
        }

        this.currentPolygon.push([mousePos.x, mousePos.y])
        this.redraw()
    }

    redraw() {
        this.redrawParent()

        this.optionPanel.setState({
            currentPolygon: this.currentPolygon,
        })

        if (this.currentPolygon != null) {
            if (this.currentPolygon.length === 1) {
                // only one entry, just draw a single dot
                this.ctx.fillStyle = "#0f0"
                this.ctx.fillRect(this.currentPolygon[0][0] * this.zoom, this.currentPolygon[0][1] * this.zoom, 1, 1)
                return
            }

            // draw polygon lines of current polygon
            this.drawPolygon(this.currentPolygon)
        }
    }
}

export default PolygonTool
