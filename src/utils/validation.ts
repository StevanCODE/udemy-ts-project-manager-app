// Validation 
export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
export function validate(validatableInput: Validatable){
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
