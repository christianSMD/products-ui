import { Injectable } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from '../api/api.service';

interface Role {
  id: string;
  user_id: string;
  type_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  public title = "SMD Technologies (development)";
  public userValue: User;

  constructor(public api: ApiService) { }

  /**
   * 
   * @returns project title
   */
  public getTitle () {
    return this.title;
  }

  /**
   * 
   * @returns email
   */
  public getUserEmail () {
    return localStorage.getItem('logged_in_user_email');
  }

  /**
   * 
   * @returns username
   */
  public getUserName () {
    return localStorage.getItem('logged_in_user_name');
  }

  /**
   * 
   * @returns userId
   */
  public getUserId () {
    return localStorage.getItem('logged_in_user_id');
  }

  /**
   * 
   * @returns token
   */
  public getUserToken () {
    return localStorage.getItem('user_token');
  }

  /**
   * @returns User roles object
   */
  public role (id: number) {
    try {
      this.api.GET(`roles/search/${this.getUserId()}`).subscribe({
        next:(res)=>{
           localStorage.setItem('roles', JSON.stringify(res));
        }, error:(res)=>{
          console.log(res);
          return false;
        }
      })
      const roles = JSON.parse(localStorage.getItem('roles')!);
      for (let index = 0; index < roles.length; index++) {
        if (roles[index].type_id == id) {
          return true;
        }
      }
    } catch (error) {
      console.log(error);
    }
    
    return false;
  }

  /**
   * @returns true or false
   * @todo Checks if user's email is set
   */
  public loggedIn () {
    return (this.getUserEmail()) ? true : false;
  }

  /**
   * @description Call this function to secure other functions or components
   * @todo If False, redirect to login page
   */
  public auth() {
    if(!this.loggedIn()){
      location.replace(this.api.domainUrl);
    }
  }
  
  /**
   * 
   * @returns domain with the login route
   */
  public loginUrl() {
    return this.api.domainUrl;
  }

}
