import common from "./common"

class EraserTool extends common.CommonTool {
    constructor(toolId, canvas, zoom, redraw, add, remove) {
        super(toolId, canvas, zoom, redraw, add, remove)
        this.polygons = null
    }

    getCursor() {
        return "crosshair"
    }

    setPolygons(polygons) {
        this.polygons = polygons
    }

    handleClick(ev) {
        const mousePos = common.getMousePos(this.canvas, ev, this.zoom)
        let removePolygon = null
        this.polygons.forEach(polygon => {
            if (common.isWithinPolygon([mousePos.x, mousePos.y], polygon.shape)) {
                // remove this
                removePolygon = polygon
            }
        })
        if (removePolygon != null) {
            this.remove(removePolygon.shape)
        }
    }
}

export default EraserTool
