import { ValidationErrors, ValidatorFn, AbstractControl, FormGroup } from '@angular/forms';

export class ValidacionContrasena {

    static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                return null;
            }

            const valid = regex.test(control.value);

            return valid ? null : error;
        };
    }

    static compararPassword(group: FormGroup) {
        var confirm = group.controls['confirmacionContrasenia'];
        if (group.controls['contrasenia'].value != confirm.value)
            confirm.setErrors({ compararPassword: true });
        return null;
    }

}