import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Type } from 'src/app/interfaces/type';
import { InfoService } from '../info/info.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  private types: Type[] = [];

  constructor(private router: Router, private info: InfoService) { }

  /**
   *  
   * @todo Getter
   * @todo getTyeps()
   * @todo Checks if types is already set, if not, then types from localStorage
   * 
   */
  public getTypes() {
    this.info.setLoadingInfo('Getting types...', 'info');
    if (this.types.length < 1) {
      const obj: any = localStorage.getItem("types");
      return JSON.parse(obj);
    }
    return this.types;
  }

  /**
   * 
   * @param types 
   * @todo Setter
   * @todo setTyeps()
   * @todo Checks if types is already set, if not, then set type
   * 
   */
  public setTypes(types: Type[]) {
    this.info.setLoadingInfo('Setting types...', 'info');
    if (this.types.length < 1) {
      this.types = types;
      localStorage.setItem("types", JSON.stringify(this.types));
    } 
  }
}
