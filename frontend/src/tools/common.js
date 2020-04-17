import classifyPoint from "robust-point-in-polygon"

const getMousePos = (canvas, evt, zoom) => {
    const rect = canvas.getBoundingClientRect()
    const x = Math.round((evt.clientX - rect.left) / zoom)
    const y = Math.round((evt.clientY - rect.top) / zoom)
    return { x, y }
}

class CommonTool {
    constructor(toolId, canvas, zoom, redraw, add, remove) {
        this.id = toolId
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.redrawParent = redraw
        this.addElement = add
        this.removeElement = remove
        this.zoom = zoom
    }

    add(shape) {
        this.addElement(shape)
    }

    drawPolygon(polygon, close = true) {
        // draw polygon lines of current polygon
        this.ctx.strokeStyle = "#0f0"
        this.ctx.beginPath()
        polygon.forEach((coords, index) => {
            if (index === 0) {
                this.ctx.moveTo(coords[0] * this.zoom, coords[1] * this.zoom)
            } else {
                this.ctx.lineTo(coords[0] * this.zoom, coords[1] * this.zoom)
            }
        })
        if (close) {
            this.ctx.closePath()
        }
        this.ctx.stroke()
    }

    getCursor() {
        return null
    }

    getMousePos(ev) {
        return getMousePos(this.canvas, ev, this.zoom)
    }

    updateZoom(newZoom) {
        this.zoom = newZoom
        this.redraw()
    }

    redraw() {
        this.redrawParent()
    }

    remove(shape) {
        this.removeElement(shape)
    }
}

export default {
    getMousePos,

    CommonTool,

    eraserTool: "eraser",

    isWithinPolygon(point, polygon) {
        // first check if it is one of the corners
        let found = false
        polygon.forEach(coordinate => {
            if (coordinate[0] === point[0] && coordinate[1] === point[1]) {
                found = true
            }
        })

        if (found) {
            return true
        }
        return classifyPoint(polygon, point) !== 1
    },
}
