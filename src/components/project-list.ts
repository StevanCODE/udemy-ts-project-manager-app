/// <reference path="base-component.ts" />
/// <reference path="project-item.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/drag-drop.ts" />
/// <reference path="../state/project-state.ts" />


namespace App {
 export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: any[];

    constructor(private type: 'active' | 'finished'){
      super('project-list', 'app', 'beforeend', `${type}-projects`)
      this.assignedProjects = []
      globalState.addListener((projects:Project[]) => {
        this.assignedProjects = projects
        this.renderProjects()
      })
      this.configure()
      this.renderContent()
    }

    private renderProjects(){
      const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
      listEl.innerHTML = ''

      for(const prjItem of this.assignedProjects){
        if((this.type === 'active' && prjItem.projectStatus === 0) || (this.type === 'finished' && prjItem.projectStatus  === 1)){
          new ProjectItem(`${this.type}-projects-list`, prjItem);
        }
        }
      }
      configure(){
        const section = document.getElementById(`${this.type}-projects`)! as HTMLElement 
        section.ondragover = this.dragOverHandler 
        section.ondrop = this.dropHandler
        section.ondragleave = this.dragLeaveHandler
      }

      @autobind
      dragOverHandler(event: DragEvent): void {
        event.preventDefault()
        const listEL = this.element!.querySelector("ul")!
        listEL.classList.add('droppable')
      }

      @autobind
      dropHandler(event: DragEvent): void {
        event.preventDefault()
        const eventData = JSON.parse(event.dataTransfer?.getData('application/json')!)
        if((eventData.projectStatus !== this.type)){
          globalState.toggleProject(eventData.projectId)
        }
      }

      @autobind
      dragLeaveHandler(event: DragEvent): void {
        event.preventDefault()
        const listEL = this.element!.querySelector("ul")!
        listEL.classList.remove('droppable')
      }

    renderContent(){
      const listId = `${this.type}-projects-list`
      if(this.element){
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
      }
    }
 }
}