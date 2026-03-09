import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeaderComponent extends NavigationMixin(LightningElement) {

userName;

connectedCallback(){

this.userName = localStorage.getItem('loggedUser');

}

handleLogin(){

    this[NavigationMixin.Navigate]({
        type:'standard__navItemPage',
        attributes:{
            apiName:'Login_Page'
        }
    });

}

handleSignup(){

    this[NavigationMixin.Navigate]({
        type:'standard__navItemPage',
        attributes:{
            apiName:'SignUp_Page'
        }
    });

}

}