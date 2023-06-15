import { Validatable,validate } from "../utils/validation";
import { Component } from "./base-component";
import { globalState} from "../state/project-state";
import { autobind } from "../decorators/autobind";

export class ProjectInput extends Component<HTMLTemplateElement, HTMLDivElement> {
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
