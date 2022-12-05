import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypesPipe } from '../pipes/types.pipe';


@NgModule({
  declarations: [
    TypesPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TypesPipe
  ]
})
export class CommonModuleModule { }
