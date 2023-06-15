namespace App {
  // ProjectStatus
  export enum ProjectStatus {
    Active,
    Finished
  }

  export class Project {
    constructor(public id: string, public title:string, public description: string, public numberOfPeople: number, public projectStatus: ProjectStatus){
    }
  }
}