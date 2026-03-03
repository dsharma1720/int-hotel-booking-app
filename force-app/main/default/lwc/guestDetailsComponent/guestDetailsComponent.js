import { LightningElement, wire} from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import saveGuest from '@salesforce/apex/GuestEntryController.saveGuest';

import {getObjectInfo, getPicklistValues} from 'lightning/uiObjectInfoApi';

import HOTEL_OBJECT from '@salesforce/schema/Hotel_Detail__c';
import CITY_FIELD from '@salesforce/schema/Hotel_Detail__c.Hotel_City__c';
import TYPE_FIELD from '@salesforce/schema/Hotel_Detail__c.Hotel_Type__c';


export default class GuestDetailsComponent extends NavigationMixin(LightningElement) {

    firstName='';
    lastName='';
    email='';
    phone='';

    city='';
    hotelType='';

    cityOptions = [];
    hotelOptions = [];

    adults=0;
    children=0;

    checkIn='';
    checkOut='';

    todayDate = new Date().toISOString().split('T')[0];

    dateError='';

  @wire(getObjectInfo, {objectApiName: HOTEL_OBJECT})
  objectInfo;

 @wire(getPicklistValues, {
    recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    fieldApiName: CITY_FIELD
})
cityPicklist({ data, error }) {
    if (data) {
        this.cityOptions = data.values;
    }else if (error) {
            console.error('City Picklist Error', error);
    }
}
@wire(getPicklistValues, {
    recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    fieldApiName: TYPE_FIELD
})
typePicklist({ data, error }) {
    if (data) {
        this.hotelOptions = data.values;
    }else if (error) {
            console.error('Type Picklist Error', error);
        }
}
   

    handleChange(event) {
       
    const field = event.target.dataset.field;
    let value = event.target.value;

  
    if(field === 'adults' || field === 'children'){
        value = value ? parseInt(value, 10) : 0;
    }

  
    if(field === 'checkIn' || field === 'checkOut'){
        value = value || '';
    }

  
    this[field] = value;

    console.log(field + " = " + value);
}

    handleNext(){
        this.dateError = '';

       if(!this.checkIn || !this.checkOut){
        this.dateError = 'Please select both Check-In and Check-Out dates';
        return;
    }

    
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);

    if(checkOutDate <= checkInDate){
        this.dateError = 'Check-Out date must be after Check-In date';
        return;
    }

    saveGuest({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,

    }).then(guestId => {
       
            console.log("Guest Created:", guestId);

            this[NavigationMixin.Navigate]({
                type:'standard__navItemPage',
                attributes:{ apiName:'Hotel_Lists_Details' },
                state:{
                    c__city:this.city,
                    c__type:this.hotelType,
                    c__guestId:guestId
                }
            });

        })
        .catch(error=>{
            console.error("Guest Save Error:", error);      
        });
    }
}