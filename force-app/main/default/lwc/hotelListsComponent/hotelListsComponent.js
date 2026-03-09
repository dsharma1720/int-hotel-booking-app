import { LightningElement, wire } from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';    
import getHotels from '@salesforce/apex/HotelListController.getHotels';
import {getObjectInfo, getPicklistValues} from 'lightning/uiObjectInfoApi';

import HOTEL_OBJECT from '@salesforce/schema/Hotel_Detail__c';
import CITY_FIELD from '@salesforce/schema/Hotel_Detail__c.Hotel_City__c';


export default class HotelListsComponent extends NavigationMixin(LightningElement) {

    city = '';
  
    hotels = [];
    selectedHotel;
    isLoading = false;
    error;
    
    cityOptions = [];
   
@wire(getObjectInfo, {objectApiName: HOTEL_OBJECT})
  objectInfo;

 @wire(getPicklistValues, {
    recordTypeId: '$objectInfo.data.defaultRecordTypeId',
    fieldApiName: CITY_FIELD
})
cityPicklist({ data, error }) {
    if (data) {
      
        this.cityOptions = [
            { label: 'All Cities', value: '' },
            ...data.values
        ];

    }else if (error) {
            console.error('City Picklist Error', error);
    }
}

    @wire(getHotels, { city: '$city' })
    wiredHotels({data,error}){
        
        if(data){
            this.hotels = data;
            this.error = undefined;
            this.isLoading = false;
            
        }
    else if(error){
            this.error = error.body?.message;
            this.hotels = [];
            this.isLoading = false;
    } else {
        this.isLoading = true;
        }
    }
   

    handleCityChange(event){
        this.city = event.target.value;
        this.selectedHotel = null;
    }

  

   handleSelect(event){

const hotelId = event.currentTarget.dataset.id;

this[NavigationMixin.Navigate]({
type:'standard__navItemPage',
attributes:{
apiName:'Hotel_Details'
},
state:{
c__hotelId: hotelId
}
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
