import React from "react"
import Alert from "react-s-alert"
import common from "./common"
import mixins from "../mixins"

const style = {
    errorMessage: {
        ...mixins.smallFont,
        color: "#a33",
    },
    controlOptionContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        border: "1px solid #ccc",
        marginBottom: "5px",
    },
    controlOption: selected => ({
        padding: "8px",
        textAlign: "center",
        background: selected ? mixins.mainColor.color : "#fff",
        color: selected ? "#fff" : "#333",
        cursor: selected ? "normal" : "pointer",
    }),
    label: {
        textDecoration: "underline",
        fontWeight: "600",
        fontSize: "12px",
        paddingBottom: "5px",
    },
}

class EditToolOptionPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: false,
            isControlPointEdit: false,
            newPolygon: null,
            settingMoveControlPoint: true, // true or false, false will create new control points
        }

        this.reset = this.reset.bind(this)
        this.save = this.save.bind(this)
        this.changeMoveControlPoint = this.changeMoveControlPoint.bind(this)
        this.emitWarning = this.emitWarning.bind(this)
    }

    changeMoveControlPoint(newValue) {
        return () => {
            if (this.state.settingMoveControlPoint === newValue) {
                return
            }

            this.setState({
                settingMoveControlPoint: newValue,
            })
        }
    }

    emitWarning(message) {
        Alert.warning(message)
    }

    reset() {
        this.setState({
            selected: false,
            isControlPointEdit: false,
            newPolygon: null,
            settingMoveControlPoint: true,
        })
    }

    save() {
        this.props.onSave(this.state.newPolygon)
    }

    render() {
        const initControlPointEditMessage = this.state.settingMoveControlPoint
            ? "Please select a control point and drag it to a new position"
            : "Please click in between 2 control points to insert a new one"

        return (
            <div>
                {this.state.selected === false ? (
                    <em style={mixins.smallFont}>Please select an annotation to edit</em>
                ) : null}

                {this.state.selected === true && this.state.isControlPointEdit === true ? (
                    <div>
                        <div style={style.label}>Control Points</div>
                        <div style={style.controlOptionContainer}>
                            <div
                                style={{
                                    ...style.controlOption(this.state.settingMoveControlPoint),
                                    borderRight: "1px solid #ccc",
                                }}
                                onClick={this.changeMoveControlPoint(true)}
                            >
                                Move
                            </div>
                            <div
                                style={style.controlOption(this.state.settingMoveControlPoint === false)}
                                onClick={this.changeMoveControlPoint(false)}
                            >
                                Insert
                            </div>
                        </div>
                    </div>
                ) : null}

                {this.state.selected === true &&
                this.state.isControlPointEdit === true &&
                this.state.newPolygon == null ? (
                    <div>
                        <em style={mixins.smallFont}>{initControlPointEditMessage}</em>
                    </div>
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
        } else if (this.isPointEdit() && !this.isControlPointMove()) {
            // insert mode for control points, find closest 2 points
            const distances = []
            this.selectedPolygon.shape.forEach((coordinates, index) => {
                distances.push({
                    index,
                    distance: Math.sqrt((mousePos.x - coordinates[0]) ** 2 + (mousePos.y - coordinates[1]) ** 2),
                })
            })
            const sortedDistances = distances.sort((a, b) => a.distance - b.distance)
            const selected = [sortedDistances[0], sortedDistances[1]]
            if (
                Math.abs(selected[0].index - selected[1].index) !== 1 &&
                selected[0].index !== 0 &&
                selected[1].index !== 0
            ) {
                // oh, oh, clicked between 2 not sequential points
                this.optionPanel.emitWarning("Please select in between 2 neighbouring control points")
                return
            }

            let minIndex = Math.min(selected[0].index, selected[1].index)
            const maxIndex = Math.max(selected[0].index, selected[1].index)
            if (minIndex === 0 && maxIndex === sortedDistances.length - 1) {
                // in between first and last
                minIndex = maxIndex
            }

            // new list of coordinates
            const result = [...this.selectedPolygon.shape]
            // insert new control point
            result.splice(minIndex + 1, 0, [mousePos.x, mousePos.y])

            // inform the option panel about new data
            this.selectedPolygon.shape = result
            this.optionPanel.setState({
                newPolygon: { ...this.selectedPolygon },
            })
        }

        this.redraw()
    }

    handleMouseDown(ev) {
        const mousePos = this.getMousePos(ev)
        if (this.selectedPolygon != null) {
            if (this.isPointEdit() && this.isControlPointMove()) {
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
        const pointEditTools = ["spline", "polygon", "line"]
        return pointEditTools.indexOf(this.selectedPolygonTool) !== -1
    }

    isControlPointMove() {
        if (this.isPointEdit() === false) {
            return false
        }
        return this.optionPanel.state.settingMoveControlPoint
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
            if (this.selectedPolygon.tool !== "line") {
                this.ctx.closePath()
            }
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
