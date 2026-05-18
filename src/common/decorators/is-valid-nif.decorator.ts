import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidNif } from "../utils/nif.validator"

@ValidatorConstraint({ name: 'isValidNif', async: false })
export class IsValidNifConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return isValidNif(value);
  }

  defaultMessage(): string {
    return 'NIF deve ter exatamente 10 dígitos, conter apenas números e começar com 5';
  }
}

export function IsValidNifFormat(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidNifConstraint,
    });
  };
}
