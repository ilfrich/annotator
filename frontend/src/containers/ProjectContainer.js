import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { createProject, deleteProject, getProjects } from "../redux/projects"
import util from "../util"
import mixins from "../mixins"
import Popup from "../components/Popup"

const TILE_WIDTH = 200 - 32 // 2 for the border, 15 for padding on each side

const style = {
    projectList: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    projectTile: {
        ...mixins.clickable,
        ...mixins.relative,
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        margin: "15px",
        width: `${TILE_WIDTH}px`,
        height: `${TILE_WIDTH}px`,
        display: "flex",
        alignContent: "center",
        alignItems: "center",
    },
    label: {
        fontWeight: "600",
        fontSize: "20px",
        textAlign: "center",
        width: `${TILE_WIDTH}px`,
        height: "40px",
    },
    plusIcon: {
        fontSize: "40px",
        fontWeight: "100",
        color: "#999",
    },
    deleteLayer: {
        ...mixins.clickable,
        padding: "10px",
        position: "absolute",
        bottom: "0px",
        right: "0px",
    },
}

@connect(store => ({
    projects: store.projects.projectList,
}))
class ProjectContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showCreate: false,
            showDelete: false,
            deleteProjectId: null,
        }

        this.toggleCreate = this.toggleCreate.bind(this)
        this.toggleDelete = this.toggleDelete.bind(this)
        this.createProject = this.createProject.bind(this)
        this.deleteProject = this.deleteProject.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(getProjects())
    }

    toggleCreate() {
        this.setState(oldState => ({
            ...oldState,
            showCreate: !oldState.showCreate,
        }))
    }

    toggleDelete(id) {
        return event => {
            event.preventDefault()
            this.setState(oldState => ({
                ...oldState,
                showDelete: !oldState.showDelete,
                deleteProjectId: id,
            }))
        }
    }

    createProject() {
        if (this.nameInput == null) {
            return
        }
        const data = {
            name: this.nameInput.value,
        }
        this.props.dispatch(createProject(data))
        this.setState({
            showCreate: false,
        })
    }

    deleteProject(id) {
        return () => {
            this.props.dispatch(deleteProject(id))
            this.setState({
                showDelete: false,
                deleteProjectId: null,
            })
        }
    }

    render() {
        return (
            <div>
                <h4 style={mixins.heading}>Projects</h4>
                <div style={style.projectList}>
                    <div style={style.projectTile} onClick={this.toggleCreate}>
                        <span style={style.label}>
                            <FontAwesomeIcon icon="plus" style={style.plusIcon} />
                        </span>
                    </div>
                    {util.idMapToList(this.props.projects).map(project => (
                        <Link to={`/projects/${project._id}`} style={mixins.noLink} key={project._id}>
                            <div style={style.projectTile}>
                                <span style={style.label}>{project.name}</span>
                                <div style={style.deleteLayer} onClick={this.toggleDelete(project._id)}>
                                    <FontAwesomeIcon icon="trash-alt" style={mixins.deleteIcon} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {this.state.showCreate ? (
                    <Popup ok={this.createProject} cancel={this.toggleCreate} title="New Project">
                        <label style={mixins.label} htmlFor="project-label">
                            Name
                        </label>
                        <input
                            type="text"
                            id="project-label"
                            ref={el => {
                                this.nameInput = el
                            }}
                            style={mixins.textInput}
                        />
                    </Popup>
                ) : null}
                {this.state.showDelete && this.state.deleteProjectId != null ? (
                    <Popup
                        yes={this.deleteProject(this.state.deleteProjectId)}
                        no={this.toggleDelete(null)}
                        cancel={this.toggleDelete(null)}
                        title="Delete Project"
                    >
                        <p>Do you really want to delete this project?</p>
                        <p>
                            <i>This will delete all associated images, models and annotations.</i>
                        </p>
                    </Popup>
                ) : null}
            </div>
        )
    }
}

export default ProjectContainer
