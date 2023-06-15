import { Project,ProjectStatus } from "../models/project"
type Listener<T> = (items: T[]) => void
class State<T> {
  protected listeners: Listener<T>[] = [] 
  public addListener(listenerFn:Listener<T>){
    this.listeners.push(listenerFn)
  }
}

// Project State Management
export class ProjectState extends State<Project> {
  private projects: any[] = []
  private static instance: ProjectState;
  private constructor(){
    super()
  }

  private updateListeners() {
    for(const listenerFunction of this.listeners){
      listenerFunction([...this.projects])
    }
  }

  public toggleProject(id:string){
    const projectToUpdate = this.projects.find(project => project.id === id)
    if(projectToUpdate){
      let status = projectToUpdate.projectStatus
      status ? projectToUpdate.projectStatus = 0 : projectToUpdate.projectStatus = 1
    }
    // this.projects = this.projects.map(project => {
    //   if(project.id === id){
    //     project.projectStatus = project.projectStatus === 0 ? ProjectStatus.Finished : ProjectStatus.Active
    //     return project
    //   }
    //   else return project
    // })
    this.updateListeners()
  }


  static getInstance(){
    if(this.instance){
      return this.instance
    }else {
      this.instance = new ProjectState()
      return this.instance
    }
  }

  public addProject(title:string, description:string, numOfPeople: number){
    const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)
    this.projects.push(newProject);
    this.updateListeners()
  }
}

export const globalState = ProjectState.getInstance()
