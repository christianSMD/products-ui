import { Injectable, isDevMode } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from '../api/api.service';
import { BehaviorSubject } from 'rxjs';
import { SpeedTestService } from 'ng-speed-test';

interface Role {
  id: string;
  user_id: string;
  type_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  public title = "SMD";
  public userValue: User;
  public isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public api: ApiService, private speedTestService:SpeedTestService) {
   
    if (isDevMode()) {
      console.log("Development Mode");
    } else {
      console.log("Production Mode");
    }
  }

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
    this.setLoadingInfo("⏳", "info");
    console.log("Checking user roles...");
    try {
      this.api.GET(`roles/search/${this.getUserId()}`).subscribe({
        next:(res)=>{
           localStorage.setItem('roles', JSON.stringify(res));
           this.setLoadingInfo("", "info");
        }, error:(res)=>{
          this.setLoadingInfo(res, "danger");
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

  public activity (activity: string, product_id: number): void {
    this.setLoadingInfo("Updating audits...", "info");
    this.api.POST('activity', {
      activity: activity,
      user_id: this.getUserId(),
      product_id: product_id
    }).subscribe({
      next:(res)=>{
         console.log(res);
         this.setLoadingInfo("Audits updated", "info");
      }, error:(res)=>{
        console.log(res);
        this.setLoadingInfo("Audits not updated", "warn");
      }
    });
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

  public isRefreshed(): void {
    if (localStorage.getItem('refreshed') == 'no') {
      localStorage.setItem('refreshed', 'yes');
      setTimeout(function () { 
        localStorage.setItem('blockui', 'no');
        location.reload();
      }, 3000)
    }
  }

  /**
   * This is to get the current time
   */
  public greeting() {
    const time = new Date().getHours();
    if (time < 10) {
      return "Good morning";
    } else if (time < 17) {
      return "Good day";
    } else {
      return "Good evening";
    }
  }

  network(): void {
    this.speedTestService.getMbps().subscribe(
      (speed) => {
        const s = Math.round(speed);
        // console.log(`Internet connection speed: ${s}Mbps`);
        let poorConnection = document.getElementById("slow-connection");
        let noConnection = document.getElementById("no-connection");
        if (s == 0) {
          noConnection!.style.display = "block";
          poorConnection!.style.display = "none";
          this.setLoadingInfo("No internet connection", "danger");
        } else {
          if (s < 12) {
            noConnection!.style.display = "none";
            poorConnection!.style.display = "block";
            this.setLoadingInfo("Poor internet connection", "warn");
          } else {
            noConnection!.style.display = "none";
            poorConnection!.style.display = "none";
            this.setLoadingInfo("", "info");
          }
        }
      }
    );
  }

  setLoadingInfo(text: string, type: string) {
    try {
      let e = <HTMLElement> document.querySelector(".loadingInfo");
      e.innerHTML = text;
      switch (type) {
        case "info":
          e.style.color = "#c2d6d6";
          break;
        case "success":
          e.style.color = "#a0c4a0";
          break;
        case "warn":
          e.style.color = "#e6d9b1";
          break;
        case "danger":
          e.style.color = "#ef4252";
          break;
        default:
          e.style.color = "#c2d6d6";
          break;
      }
    } catch (error) {
    }
    
  }
  
  public errorHandler(error: any) {
    console.log("Error handled: ", error);
  }

}
