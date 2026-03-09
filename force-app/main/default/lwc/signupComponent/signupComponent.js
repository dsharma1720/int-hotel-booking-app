import { LightningElement } from 'lwc';
import createUser from '@salesforce/apex/UserController.createUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class SignupComponent extends NavigationMixin(LightningElement) {

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
localStorage.setItem('loggedUser', this.firstName);
this.showToast('Success','Account Created Successfully','success');
this[NavigationMixin.Navigate]({
    type: 'standard__navItemPage',
    attributes:{
        apiName:'Hotel_Lists_Details'
    }
});
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