import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parentName'
})
export class ParentPipe implements PipeTransform {

  transform(items: any[], fieldName: string) {

    return 'audio';
  }

}
