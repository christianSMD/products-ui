import { Pipe, PipeTransform } from '@angular/core';
import { Type } from '../interfaces/type';

@Pipe({
  name: 'typeGroup'
})
export class TypesPipe implements PipeTransform {

  transform(items: any[], fieldName: string): any[] {
    let filtered = [];
    for(let i = 0; i < items.length; i++) {
      if(items[i].grouping == fieldName) {
        filtered.push(items[i]);
      }
    }
    return filtered;
  }

}
