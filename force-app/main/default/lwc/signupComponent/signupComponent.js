import { LightningElement } from 'lwc';
import createUser from '@salesforce/apex/UserController.createUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SignupComponent extends LightningElement {

firstName='';
lastName='';
email='';
phone='';
password='';


handleChange(event){

const field = event.target.dataset.field;

this[field] = event.target.value;

}

handleSignup(){

if(!this.firstName || !this.lastName || !this.email || !this.phone || !this.password){

this.showToast('Error','Please fill all fields','error');
return;

}




createUser({
firstName:this.firstName,
lastName:this.lastName,
email:this.email,
phone:this.phone,
password:this.password
})


.then(()=>{
localStorage.setItem('loggedUser', this.firstName + ' ' + this.lastName);
localStorage.setItem('loggedUserFirstName', this.firstName);
localStorage.setItem('loggedUserLastName', this.lastName);
localStorage.setItem('loggedUserEmail', this.email);
localStorage.setItem('loggedUserPhone', this.phone);
this.showToast('Success','Account Created Successfully','success');

const userName = this.firstName + ' ' + this.lastName;
this.dispatchEvent(new CustomEvent('signupsuccess', {
    detail: { userName },
    bubbles: true,
    composed: true
}));
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