import React from "react"
import common from "./common"
import mixins from "../mixins"

class FreeHandToolOptionPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            init: false,
        }
    }

    render() {
        return (
            <div>
                {this.state.init ? (
                    <button type="button" style={mixins.button} onClick={this.props.onSave}>
                        Finish
                    </button>
                ) : (
                    <em style={mixins.smallFont}>Start drawing by dragging over the canvas</em>
                )}
            </div>
        )
    }
}

class FreeHandTool extends common.CommonTool {
    constructor(toolId, canvas, zoom, redraw, add) {
        super(toolId, canvas, zoom, redraw, add)
        this.currentShape = null
        this.optionPanel = null
        this.isDrawing = false
    }

    getCursor() {
        return "crosshair"
    }

    getOptionPanel() {
        const handleSaveEvent = () => {
            this.add([...this.currentShape])
            this.currentShape = null
            this.isDrawing = false
            this.optionPanel.setState({
                init: false,
            })
        }
        return (
            <FreeHandToolOptionPanel
                onSave={handleSaveEvent}
                ref={el => {
                    this.optionPanel = el
                }}
            />
        )
    }

    handleMouseDown(ev) {
        const mousePos = this.getMousePos(ev)
        this.isDrawing = true
        this.currentShape = [[mousePos.x, mousePos.y]]
        if (this.optionPanel.state.init === true) {
            this.optionPanel.setState({
                init: false,
            })
        }
        this.redraw()
    }

    handleMouseUp(ev) {
        if (!this.isDrawing) {
            return
        }
        this.isDrawing = false
        this.optionPanel.setState({
            init: true,
        })
        this.redraw()
    }

    handleMouseMove(ev) {
        if (!this.isDrawing) {
            return
        }
        const mousePos = this.getMousePos(ev)
        this.currentShape.push([mousePos.x, mousePos.y])
        this.redraw()
    }

    redraw() {
        super.redraw()
        if (this.currentShape != null) {
            if (this.isDrawing) {
                this.drawPolygon(this.currentShape, false)
            } else {
                this.drawPolygon(this.currentShape)
            }
        }
    }
}

export default FreeHandTool
