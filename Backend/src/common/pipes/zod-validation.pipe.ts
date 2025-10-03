import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema<unknown>) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
        const result = this.schema.safeParse(value);

        if (result.success) {
            return result.data;
        }

        const messages = result.error.issues.map(issue => {
            const path = issue.path.join('.') || 'value';
            return `${path}: ${issue.message}`;
        });

        throw new BadRequestException(messages);
    }
}