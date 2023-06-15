// Drag and drop interface
interface Draggable {
  dragStartHandler(event: DragEvent):void
}
interface DragTarget {
  dragOverHandler(event: DragEvent):void
  dropHandler(event: DragEvent):void
  dragLeaveHandler(event: DragEvent):void
}

// ProjectStatus
enum ProjectStatus {
  Active,
  Finished
}

type Listener<T> = (items: T[]) => void

// autobind decorator
function autobind(_:any, _2:string, descriptor: PropertyDescriptor){
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable:true,
    get(){
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  }
  return adjDescriptor
}


class Project {
  constructor(public id: string, public title:string, public description: string, public numberOfPeople: number, public projectStatus: ProjectStatus){
  }
}

class State<T> {
  protected listeners: Listener<T>[] = [] 
  public addListener(listenerFn:Listener<T>){
    this.listeners.push(listenerFn)
  }
}

// Project State Management
class ProjectState extends State<Project> {
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

const globalState = ProjectState.getInstance()
// Validation 
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}


type InsertedPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

// Component Base Class
abstract class Component <T extends HTMLElement, U extends HTMLElement>{
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element?: U;

  constructor(templateId:string, hostElementId:string, insertPosition:InsertedPosition, elementId?:string){
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
    this.hostElement = document.getElementById(hostElementId)! as T


    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as U;
    if(elementId){
    this.element.id = elementId
    }
    this.attach(insertPosition, this.element)
  }

  private attach(insertPosition:InsertedPosition, element: U) {
    this.hostElement.insertAdjacentElement(insertPosition, element);
  }
  abstract configure():void
  abstract renderContent():void
}

// ProjectItem
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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


class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

function validate(validatableInput: Validatable){
  let isValid = true
  if(validatableInput.required){
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }

  const isNull = validatableInput.value == null

  if(validatableInput.minLength){
    if(typeof validatableInput.value === 'string' && !isNull){
      isValid = isValid && validatableInput.value.trim().length >= validatableInput.minLength
    }
  }

  if(validatableInput.maxLength){
    if(typeof validatableInput.value === 'string' && !isNull){
      isValid = isValid && validatableInput.value.trim().length <= validatableInput.maxLength
    }
  }

  if(validatableInput.min){
    if(typeof validatableInput.value === 'number' && !isNull){
      isValid = isValid && validatableInput.value >= validatableInput.min
    }
  }

  if(validatableInput.max){
    if(typeof validatableInput.value === 'number' && !isNull){
      isValid = isValid && validatableInput.value <= validatableInput.max
    }
  }
  return isValid
}


class ProjectInput extends Component<HTMLTemplateElement, HTMLDivElement> {
  titleInputElement: HTMLInputElement;
  descriptionTextArea: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input')
    this.configure()

    // Ovi elementi su unutar template taga (templateElement) i mozemo da ih dohvatimo
    // tek onda kada formu (content iz template tag-a) ubacimo u hostElement(#app)
    this.titleInputElement = document.getElementById('title') as HTMLInputElement
    this.descriptionTextArea = document.getElementById('description') as HTMLTextAreaElement
    this.peopleInputElement = document.getElementById("people") as HTMLInputElement
  }

  renderContent(): void {
  }

  configure(){
    if(this.element) this.element.onsubmit = this.submitHandler.bind(this)
   }

  private clearInputs() {
    this.titleInputElement.value = ''
    this.descriptionTextArea.value = ''
    this.peopleInputElement.value = ''
  }

  protected gatherUserInput(): [string,string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionTextArea.value;
    const peopleAmount =  parseInt(this.peopleInputElement.value)

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required:true,
      minLength:3,
      maxLength:25
    }

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      minLength:5,
      maxLength: 400,
      required:true
    }

    const peopleValidatable: Validatable = {
      value: peopleAmount,
      required:true,
      min:1
    }

    if(validate(titleValidatable) && validate(descriptionValidatable) && validate(peopleValidatable)){
      return [enteredTitle, enteredDescription,peopleAmount]
    }
    else{
      alert('Invalid Input')
      return
    }
  }

  @autobind
  protected submitHandler(event:Event){
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if(Array.isArray(userInput)){
      const [title, desc, people] = userInput
      globalState.addProject(title,desc,people)
      this.clearInputs()
    }
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');