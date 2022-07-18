import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parent'
})
export class CategoriesPipe implements PipeTransform {

  transform(items: any[], fieldName: string): any[] {
    let filtered = [];
    for(let i = 0; i < items.length; i++) {
      if(items[i].parent == fieldName) {
        filtered.push(items[i]);
      }
    }
    return filtered;
  }
}
