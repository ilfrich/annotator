import React from "react"
import common from "./common"
import mixins from "../mixins"

const style = {
    errorMessage: {
        ...mixins.smallFont,
        color: "#a33",
    },
}

class EditToolOptionPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: false,
            isControlPointEdit: false,
            newPolygon: null,
        }

        this.reset = this.reset.bind(this)
        this.save = this.save.bind(this)
    }

    reset() {
        this.setState({
            selected: false,
            isControlPointEdit: false,
            newPolygon: null,
        })
    }

    save() {
        this.props.onSave(this.state.newPolygon)
    }

    render() {
        return (
            <div>
                {this.state.selected === false ? (
                    <em style={mixins.smallFont}>Please select an annotation to edit</em>
                ) : null}
                {this.state.selected === true &&
                this.state.isControlPointEdit === true &&
                this.state.newPolygon == null ? (
                    <em style={mixins.smallFont}>Please select a control point and drag it to a new position</em>
                ) : null}

                {this.state.selected === true && this.state.isControlPointEdit === false ? (
                    <em style={style.errorMessage}>
                        Sorry, annotations drawn with the freehand tool currently cannot be modified.
                    </em>
                ) : null}

                <div style={mixins.buttonLine}>
                    {this.state.selected === true ? (
                        <button type="button" style={mixins.button} onClick={this.props.onCancel}>
                            Cancel
                        </button>
                    ) : null}
                    {this.state.newPolygon != null ? (
                        <button type="button" style={mixins.button} onClick={this.save}>
                            Save
                        </button>
                    ) : null}
                </div>
            </div>
        )
    }
}

class EditTool extends common.CommonTool {
    constructor(toolId, canvas, zoom, redraw, add, remove) {
        super(toolId, canvas, zoom, redraw, add, remove)
        this.originalPolygon = null
        this.selectedPolygon = null
        this.selectedPolygonTool = null
        this.allPolygons = []
        this.controlPoint = null
        this.movedControlPoint = null
    }

    getCursor() {
        return "crosshair"
    }

    getOptionPanel() {
        const handleCancel = () => {
            this.cancel(true)
        }
        const handleSaveEvent = newPolygon => {
            this.add(newPolygon)
            this.cancel(false)
        }

        return (
            <EditToolOptionPanel
                onSave={handleSaveEvent}
                onCancel={handleCancel}
                ref={el => {
                    this.optionPanel = el
                }}
            />
        )
    }

    getClosestPoint(mousePos) {
        const diff = this.selectedPolygon.shape
            .map(item => ({
                shape: item,
                diff: Math.abs(item[0] - mousePos.x) + Math.abs(item[1] - mousePos.y),
            }))
            .sort((a, b) => a.diff - b.diff)
        return diff[0].shape
    }

    setPolygons(polygons) {
        this.allPolygons = polygons
    }

    cancel(reAdd = true) {
        if (reAdd === true && this.originalPolygon != null) {
            this.add(this.originalPolygon)
        }
        this.originalPolygon = null
        this.selectedPolygon = null
        this.selectedPolygonTool = null
        this.controlPoint = null
        this.movedControlPoint = null
        this.optionPanel.reset()
        this.redraw()
    }

    handleClick(ev) {
        const mousePos = this.getMousePos(ev)
        if (this.selectedPolygon == null) {
            this.allPolygons.forEach((polygon, index) => {
                if (common.isWithinPolygon([mousePos.x, mousePos.y], polygon.shape)) {
                    this.selectedPolygon = { ...polygon } // this will be updated
                    this.originalPolygon = { ...polygon } // save in case we cancel
                    this.selectedPolygonTool = polygon.tool
                    this.optionPanel.setState({
                        selected: true,
                        isControlPointEdit: this.isPointEdit(),
                    })
                    this.remove(polygon.shape)
                }
            })
        }

        this.redraw()
    }

    handleMouseDown(ev) {
        const mousePos = this.getMousePos(ev)
        if (this.selectedPolygon != null) {
            if (this.isPointEdit()) {
                // for adjusting control points
                this.controlPoint = this.getClosestPoint(mousePos)
            }
        }
    }

    handleMouseMove(ev) {
        if (this.controlPoint == null) {
            this.movedControlPoint = null
            return
        }
        const mousePos = this.getMousePos(ev)
        this.movedControlPoint = [mousePos.x, mousePos.y]
        this.redraw()
    }

    handleMouseUp(ev) {
        if (this.controlPoint == null) {
            return
        }
        const mousePos = this.getMousePos(ev)
        this.movedControlPoint = [mousePos.x, mousePos.y]
        // update polygon
        const result = []
        this.selectedPolygon.shape.forEach(polygon => {
            if (this.isControlPoint(polygon)) {
                result.push([...this.movedControlPoint])
            } else {
                result.push(polygon)
            }
        })

        this.selectedPolygon.shape = result
        this.optionPanel.setState({
            newPolygon: { ...this.selectedPolygon },
        })

        this.movedControlPoint = null
        this.controlPoint = null
        this.redraw()
    }

    isPointEdit() {
        if (this.selectedPolygonTool == null) {
            return false
        }
        const pointEditTools = ["spline", "polygon"]
        return pointEditTools.indexOf(this.selectedPolygonTool) !== -1
    }

    isControlPoint(coordinate) {
        return (
            this.controlPoint != null &&
            this.controlPoint[0] === coordinate[0] &&
            this.controlPoint[1] === coordinate[1]
        )
    }

    redraw() {
        super.redraw()

        if (this.selectedPolygon != null) {
            const { shape } = this.selectedPolygon
            // draw outline for the polygon in question
            this.ctx.strokeStyle = "#f00"
            this.ctx.lineWidth = 3
            this.ctx.setLineDash([2, 4])
            this.ctx.beginPath()
            shape.forEach((coords, index) => {
                let finalPoint = coords
                if (this.isControlPoint(coords) && this.movedControlPoint != null) {
                    finalPoint = this.movedControlPoint
                }
                if (index === 0) {
                    this.ctx.moveTo(finalPoint[0] * this.zoom, finalPoint[1] * this.zoom)
                } else {
                    this.ctx.lineTo(finalPoint[0] * this.zoom, finalPoint[1] * this.zoom)
                }
            })
            this.ctx.closePath()
            this.ctx.stroke()

            // decide whether to display corner hooks
            if (this.isPointEdit()) {
                // this.ctx.restore()
                shape.forEach(coordinate => {
                    this.ctx.beginPath()
                    this.ctx.fillStyle = "#fff"
                    let finalPoint = coordinate
                    if (this.isControlPoint(coordinate)) {
                        this.ctx.fillStyle = "#000"
                        if (this.movedControlPoint != null) {
                            finalPoint = this.movedControlPoint
                        }
                    }
                    this.ctx.arc(finalPoint[0] * this.zoom, finalPoint[1] * this.zoom, 5, 0, 2 * Math.PI, false)
                    this.ctx.fill()
                    this.ctx.lineWidth = 2
                    this.ctx.strokeStyle = "#f00"
                    this.ctx.stroke()
                })
            }
        }
    }
}

export default EditTool
