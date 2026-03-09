import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import savePayment from '@salesforce/apex/PaymentController.savePayment';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import PAYMENT_OBJECT from '@salesforce/schema/Payment_Detail__c';
import MONTH_FIELD from '@salesforce/schema/Payment_Detail__c.Expiry_Month__c';
import YEAR_FIELD from '@salesforce/schema/Payment_Detail__c.Expiry_Year__c';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PaymentDetailComponent extends NavigationMixin(LightningElement){

    cardNumber;
    cvv;
    expiryMonth;
    expiryYear;
    guestId;
    cardError = '';
    cvvError = '';
    monthError = '';
    yearError = '';

    monthOptions = [];
    yearOptions = [];
       
    @wire(getObjectInfo, { objectApiName: PAYMENT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: MONTH_FIELD
    })
    monthPicklist({ data, error }) {
        if (data) {
            this.monthOptions = data.values;
        } else if (error) {
            console.error('Month Picklist Error', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: YEAR_FIELD
    })
    yearPicklist({ data, error }) {
        if (data) {
            this.yearOptions = data.values;
        } else if (error) {
            console.error('Year Picklist Error', error);
        }
    }

  
    @wire(CurrentPageReference)
    getState(pageRef){
        if(pageRef?.state?.c__guestId){
            this.guestId = pageRef.state.c__guestId;
             console.log("GuestId received:", this.guestId);
        }
    }

    handleChange(event){
        const field = event.target.dataset.field;
        this[field] = event.target.value;
         console.log(field, event.target.value);
    }

    handleSubmit(){
         console.log("GuestId:", this.guestId);
         this.cardError = '';
    this.cvvError = '';
    this.monthError = '';
    this.yearError = '';

    let isValid = true;

   
    if(!this.cardNumber){
        this.cardError = 'Card number is required';
        isValid = false;
    }
    else if(!/^[0-9]+$/.test(this.cardNumber)){
        this.cardError = 'Card number must contain only digits';
        isValid = false;
    }
    

  
    if(!this.cvv){
        this.cvvError = 'CVV is required';
        isValid = false;
    }
    else if(!/^[0-9]+$/.test(this.cvv)){
        this.cvvError = 'CVV must contain only digits';
        isValid = false;
    }
   


    if(!this.expiryMonth){
        this.monthError = 'Select expiry month';
        isValid = false;
    }

   
    if(!this.expiryYear){
        this.yearError = 'Select expiry year';
        isValid = false;
    }

    
    if(!isValid){
        return;
    }

        savePayment({
            cardNumber:this.cardNumber,
            cvv:this.cvv,
            expiryMonth:this.expiryMonth,
            expiryYear:this.expiryYear,
            guestId:this.guestId
        })
        .then(paymentId => {
            console.log('Payment Success:', paymentId);

            this.showToast(
                'Success',
                'Payment completed successfully and email sent!',
                'success'
            );
            this[NavigationMixin.Navigate]({
                type:'standard__recordPage',
                attributes:{
                    recordId:paymentId,
                    objectApiName:'Payment_Detail__c',
                    actionName:'view'
                }
            });
        })
        .catch(error=>{
            console.error('Payment Error:', error);
             this.showToast(
                'Error',
                error.body?.message || 'Payment failed',
                'error'
            );
        });
    }

    showToast(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}
        