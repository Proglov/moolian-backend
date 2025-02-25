import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, isEmail } from "class-validator";

interface IsNotEmailOptions {
    message?: string;
}

@ValidatorConstraint({ name: "isNotEmail", async: false })
export class IsNotEmail implements ValidatorConstraintInterface {

    validate(text: string) {
        return !isEmail(text);
    }

    defaultMessage(args: ValidationArguments) {
        const { constraints, property } = args

        const options: IsNotEmailOptions = !!constraints ? constraints[0] : {}; // Get options passed to the validator
        return options?.message || `${property} نباید ایمیل باشد!`; // Use custom message if provided
    }
}
