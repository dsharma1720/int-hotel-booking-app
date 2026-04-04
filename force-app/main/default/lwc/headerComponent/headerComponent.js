import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeaderComponent extends NavigationMixin(LightningElement) {

userName;
showMenu = false;
showBookings = false;
showLogin = false;
showSignup = false;

connectedCallback(){
setTimeout(() => {
this.userName = localStorage.getItem('loggedUser');
if(localStorage.getItem('openBookings') === 'true'){
localStorage.removeItem('openBookings');
this.showBookings = true;
}
}, 200);

}



get isLoggedIn(){
return this.userName != null;
}
toggleMenu(){
this.showMenu = !this.showMenu;
}
closeMenu(){
this.showMenu = false;
}
handleLogin(){
    this.showLogin = true;
}

closeLogin(){
    this.showLogin = false;
}

handleLoginSuccess(event){
    this.userName = event.detail.userName;
    this.showLogin = false;
}

handleSignup(){
    this.showSignup = true;
}

closeSignup(){
    this.showSignup = false;
}

handleSignupSuccess(event){
    this.userName = event.detail.userName;
    this.showSignup = false;
}
handleBookings(){
    this.showMenu = false;
    this.showBookings = true;
}

closeBookings(){
    this.showBookings = false;
}

handleMyAccount(){

const userId = localStorage.getItem('loggedUserId');
if(!userId){
console.error('User Id not found');
return;
}


this[NavigationMixin.Navigate]({
type:'standard__recordPage',
attributes:{
recordId: userId,
objectApiName:'User_Account__c',
actionName:'view'
}
});

}

handleLogout(){

localStorage.removeItem('loggedUser');
localStorage.removeItem('loggedUserId');    

this.userName = null;
this.showMenu = false;
window.location.reload();

this[NavigationMixin.Navigate]({
type:'standard__navItemPage',
attributes:{
apiName:'Hotel_Lists_Details'
}
});

}

}

