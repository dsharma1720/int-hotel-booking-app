import { LightningElement } from 'lwc';
import loginUser from '@salesforce/apex/UserController.loginUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class LoginComponent extends LightningElement {

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
   console.log('Login Result:', result);
if(result){
console.log('Saving user to localStorage...');
localStorage.setItem('loggedUserFirstName', result.First_Name__c);
localStorage.setItem('loggedUserLastName', result.Last_Name__c);
let fullName = result.First_Name__c + ' ' + result.Last_Name__c;

localStorage.setItem('loggedUser', fullName);
localStorage.setItem('loggedUserEmail', result.Email__c || '');
localStorage.setItem('loggedUserPhone', result.Phone__c);
localStorage.setItem('loggedUserId', result.Id);

console.log('Stored First Name:', localStorage.getItem('loggedUserFirstName'));
console.log('Stored Last Name:', localStorage.getItem('loggedUserLastName'));
console.log('Stored Email:', localStorage.getItem('loggedUserEmail'));
console.log('Stored Phone:', localStorage.getItem('loggedUserPhone'));
console.log('Saved Name:', localStorage.getItem('loggedUser'));

this.showToast('Success','Login Successful','success');

this.dispatchEvent(new CustomEvent('loginsuccess', {
    detail: { userName: fullName },
    bubbles: true,
    composed: true
}));
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