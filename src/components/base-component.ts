type InsertedPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
// Component Base Class
export abstract class Component <T extends HTMLElement, U extends HTMLElement>{
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