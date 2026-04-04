import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import savePayment from '@salesforce/apex/PaymentController.savePayment';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import PAYMENT_OBJECT from '@salesforce/schema/Payment_Detail__c';
import MONTH_FIELD from '@salesforce/schema/Payment_Detail__c.Expiry_Month__c';
import YEAR_FIELD from '@salesforce/schema/Payment_Detail__c.Expiry_Year__c';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PaymentDetailComponent extends NavigationMixin(LightningElement){

cardNumber='';
cvv='';
expiryMonth='';
expiryYear='';
guestId;

cardError='';
cvvError='';
monthError='';
yearError='';

monthOptions=[];
yearOptions=[];
cardType='';

@wire(getObjectInfo, { objectApiName: PAYMENT_OBJECT })
objectInfo;

@wire(getPicklistValues,{
recordTypeId:'$objectInfo.data.defaultRecordTypeId',
fieldApiName:MONTH_FIELD
})
monthPicklist({data,error}){
if(data){
this.monthOptions=data.values;
}
else if(error){
console.error(error);
}
}

@wire(getPicklistValues,{
recordTypeId:'$objectInfo.data.defaultRecordTypeId',
fieldApiName:YEAR_FIELD
})
yearPicklist({data,error}){
if(data){
this.yearOptions=data.values;
}
else if(error){
console.error(error);
}
}

@wire(CurrentPageReference)
getState(pageRef){
if(pageRef?.state?.c__guestId){
this.guestId=pageRef.state.c__guestId;
console.log('GuestId:',this.guestId);
}
}

handleCardNumberChange(event){

let value = event.target.value;
value = value.replace(/\D/g,'');// allow digits only
value = value.slice(0,19);

// detect card type
if(value.startsWith('4')){
this.cardType='VISA';
}
else if(/^5[1-5]/.test(value)){
this.cardType='MasterCard';
}
else if(/^3[47]/.test(value)){
this.cardType='AMEX';
}
else{
this.cardType='';
}

// format card number
let formatted = value.replace(/(.{4})/g, '$1 ').trim();

this.cardNumber=formatted;
event.target.value=formatted;

this.cardError='';
}

handleCvvChange(event){

let value = event.target.value.replace(/\D/g,''); // digits only
value = value.slice(0,4);

this.cvv = value;
event.target.value = value;

this.cvvError='';
}

handleChange(event){
const field=event.target.dataset.field;
this[field]=event.target.value;
}

handleSubmit(){

this.cardError='';
this.cvvError='';
this.monthError='';
this.yearError='';

let isValid=true;

// clean card number
console.log('Card Number State:', this.cardNumber);
let cardNumberClean = (this.cardNumber || '').replace(/\D/g,'');

// card length validation
if(cardNumberClean.length < 16 || cardNumberClean.length > 19){
this.cardError = 'Card number must be 16–19 digits';
isValid = false;
}

// CVV validation
if(this.cvv.length < 3 || this.cvv.length > 4){
this.cvvError = 'CVV must be 3 or 4 digits';
isValid = false;
}
console.log('Clean card number:', cardNumberClean);
console.log('Length:', cardNumberClean.length);
// expiry validation
if(!this.expiryMonth){
this.monthError='Select expiry month';
isValid=false;
}

if(!this.expiryYear){
this.yearError='Select expiry year';
isValid=false;
}

if(!isValid){
return;
}

savePayment({
cardNumber:cardNumberClean,
cvv:this.cvv,
expiryMonth:this.expiryMonth,
expiryYear:this.expiryYear,
guestId:this.guestId
})
.then(()=>{

this.showToast(
'Success',
'Payment completed successfully!',
'success'
);

localStorage.setItem('openBookings','true');

this[NavigationMixin.Navigate]({
type:'standard__navItemPage',
attributes:{
apiName:'Hotel_Lists_Details'
}
});

})
.catch(error=>{
console.error(error);

this.showToast(
'Error',
error.body?.message || 'Payment failed',
'error'
);

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