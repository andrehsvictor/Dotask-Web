import { FieldErrorDto } from "./field-error-dto";

export interface ErrorDto {
    errors: FieldErrorDto[] | string[];
}
