/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/drag-drop.ts" />
/// <reference path="../state/project-state.ts" />



namespace App {
  // ProjectItem
  export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    public project: Project

    get persons(){
      if(this.project.numberOfPeople === 1){
        return '1 Person assigned'
      }
      return `${this.project.numberOfPeople} Persons assigned`
    }
    constructor(hostId:string, project: Project){
      super("single-project", hostId as string, 'afterbegin', project.id  );
      this.project = project;
      this.configure();
      this.renderContent();
    }
    
    configure() {
      if(this.element){
        this.element.ondragstart = this.dragStartHandler
      }
    }
    @autobind
    dragStartHandler(event: DragEvent): void {
      event.dataTransfer!.setData('application/json', JSON.stringify({
        projectId:this.project.id,
        projectStatus: this.project.projectStatus ? "finished" : 'active'
      }));
      event.dataTransfer!.effectAllowed = 'move'
    }
    renderContent(){
      if(this.element){
        // this.element.onclick = () => {
        //   globalState.toggleProject(this.project.id)
        // }
        this.element.querySelector("h2")!.textContent = this.project.title
        this.element.querySelector("h3")!.textContent = this.persons
        this.element.querySelector("p")!.textContent = this.project.description
      }
    }
  }
}