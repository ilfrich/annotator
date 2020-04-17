import React from "react"
import common from "./common"
import mixins from "../mixins"

const DEFAULT_NUMBER_CONTROL = 8
const SESSION_STORAGE_KEY_CONTROL_POINTS = "SplineTool-NumberOfControlPoints"

const getNumberOfControls = () => {
    let numberControl = DEFAULT_NUMBER_CONTROL
    const preferredDefault = sessionStorage.getItem(SESSION_STORAGE_KEY_CONTROL_POINTS)
    if (preferredDefault != null) {
        numberControl = parseInt(preferredDefault, 10)
    }
    return numberControl
}

class SplineToolOptionPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            init: false,
            numberControl: getNumberOfControls(),
        }

        this.changeControlPoints = this.changeControlPoints.bind(this)
    }

    changeControlPoints(ev) {
        const number = parseInt(ev.target.value, 10)
        if (isNaN(number)) {
            return
        }
        sessionStorage.setItem(SESSION_STORAGE_KEY_CONTROL_POINTS, number)
        this.setState({
            numberControl: number,
        })
        this.props.changeControlPoints(number)
    }

    render() {
        if (this.state.init) {
            return (
                <div>
                    <label style={mixins.label}>Number of Control Points</label>
                    <input
                        type="number"
                        style={mixins.textInput}
                        min={3}
                        defaultValue={this.state.numberControl}
                        onChange={this.changeControlPoints}
                    />

                    <div style={mixins.buttonLine}>
                        <button type="button" style={mixins.button} onClick={this.props.onSave}>
                            Finish
                        </button>
                    </div>
                </div>
            )
        }
        return (
            <div>
                <em style={mixins.smallFont}>Please draw a rectangle around the area of interest.</em>
            </div>
        )
    }
}

class SplineTool extends common.CommonTool {
    constructor(toolId, canvas, zoom, redraw, add) {
        super(toolId, canvas, zoom, redraw, add)
        this.rectangle = null
        this.currentShape = null
        this.isDrawing = false
        this.optionPanel = null
        this.changeNumberOfControls = this.changeNumberOfControls.bind(this)
    }

    getCursor() {
        return "crosshair"
    }

    changeNumberOfControls(newNumber) {
        this.currentShape = this.getControlPoints(newNumber)
        this.redraw()
    }

    getOptionPanel() {
        const handleSaveEvent = () => {
            this.add([...this.currentShape])
            this.currentShape = null
            this.rectangle = null
            this.isDrawing = false
            this.optionPanel.setState({
                init: false,
            })
        }
        return (
            <SplineToolOptionPanel
                ref={el => {
                    this.optionPanel = el
                }}
                changeControlPoints={this.changeNumberOfControls}
                onSave={handleSaveEvent}
            />
        )
    }

    handleClick(ev) {}

    handleMouseDown(ev) {
        const mousePos = this.getMousePos(ev)
        this.isDrawing = true
        this.currentShape = null
        this.rectangle = [[mousePos.x, mousePos.y]]
    }

    handleMouseUp(ev) {
        this.currentShape = this.getControlPoints(getNumberOfControls())
        this.optionPanel.setState({
            init: true,
        })
        this.redraw()
    }

    handleMouseMove(ev) {
        if (!this.isDrawing || this.currentShape != null) {
            return
        }
        const mousePos = this.getMousePos(ev)
        const current = [mousePos.x, mousePos.y]
        if (this.rectangle.length === 1) {
            this.rectangle.push(current)
        } else {
            this.rectangle[1] = current
        }
        this.redraw()
    }

    redraw() {
        super.redraw()
        if (this.currentShape != null) {
            this.drawPolygon(this.currentShape)
        } else if (this.rectangle != null && this.rectangle.length === 2) {
            const start = this.rectangle[0]
            const end = this.rectangle[1]

            this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
            this.ctx.fillRect(
                start[0] * this.zoom,
                start[1] * this.zoom,
                (end[0] - start[0]) * this.zoom,
                (end[1] - start[1]) * this.zoom
            )
            this.ctx.fill()
            this.ctx.closePath()
        }
    }

    getControlPoints(numPoints) {
        // reset control points
        const controlPoints = []

        const startX = this.rectangle[0][0]
        const startY = this.rectangle[0][1]

        const endX = this.rectangle[1][0]
        const endY = this.rectangle[1][1]

        // find middle
        const width = endX - startX
        const height = endY - startY

        // create control points and cater for rounding issues with 355 degree (to prevent 0 AND 360)
        for (let angle = 0; angle < 355; angle += 360 / numPoints) {
            // 0 is midX and midY, add the radius (half width / half height) multiplied with the sin(angle) / cos(angle)
            controlPoints.push([
                startX + Math.round(width / 2) + Math.round((width / 2) * Math.cos((Math.PI * angle) / 180.0)),
                startY + Math.round(height / 2) + Math.round((height / 2) * Math.sin((Math.PI * angle) / 180.0)),
            ])
        }
        return controlPoints
    }
}

export default SplineTool
