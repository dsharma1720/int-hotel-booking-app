import { LightningElement } from 'lwc';
import loginUser from '@salesforce/apex/UserController.loginUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
export default class LoginComponent extends NavigationMixin(LightningElement) {

email='';
password='';

handleChange(event){

const field = event.target.dataset.field;

this[field] = event.target.value;

}

handleLogin(){
if(!this.email || !this.password){

this.showToast('Error','Enter Email and Password','error');
return;

}
loginUser({
email:this.email,
password:this.password
})

.then(result => {
if(result){
localStorage.setItem('loggedUser', result.First_Name__c);

this.showToast('Success','Login Successful','success');
window.location.href='/lightning/n/Hotel_Lists_Details';

this[NavigationMixin.Navigate]({
type:'standard__navItemPage',
attributes:{
apiName:'Hotel_Lists_Details'
}
});
}else {

this.showToast('Error','Invalid Credentials','error');

}

})

.catch(error=>{
console.error(error);
});

}

showToast(title,message,variant){

this.dispatchEvent(
new ShowToastEvent({
title,
message,
variant
})
);

}

}