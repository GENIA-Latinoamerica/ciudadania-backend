import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    // "value" is an object containing the file's attributes and metadata

    return Array.isArray(value)
      ? value.filter((x: File) => this.isFileValid(x))
      : this.isFileValid(value);
  }

  isFileValid(file: File) {
    const isValid = this.isMimeTypeValid(file) && this.isSizeValid(file);
    return isValid ? file : null;
  }

  isMimeTypeValid(file: any) {
    return (
      file.mimetype.includes('png') ||
      file.mimetype.includes('text') ||
      file.mimetype.includes('jpg') ||
      file.mimetype.includes('jpeg') ||
      file.mimetype.includes('sheet') ||
      file.mimetype.includes('application/pdf') ||
      file.mimetype.includes('application/octet-stream')
    );
  }

  isSizeValid(file: File) {
    const oneKb = 1000;
    return file.size < oneKb * 1000;
  }
}
