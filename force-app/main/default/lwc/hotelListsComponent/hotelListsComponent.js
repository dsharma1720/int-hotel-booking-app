import { LightningElement, wire } from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';    
import getHotels from '@salesforce/apex/HotelListController.getHotels';
import {getObjectInfo, getPicklistValues} from 'lightning/uiObjectInfoApi';

import HOTEL_OBJECT from '@salesforce/schema/Hotel_Detail__c';
import CITY_FIELD from '@salesforce/schema/Hotel_Detail__c.Hotel_City__c';


export default class HotelListsComponent extends NavigationMixin(LightningElement) {

    city = '';
    minRating = null;

    hotels = [];
    selectedHotel;
    selectedHotelId;
    showHotelDetail = false;
    isLoading = false;
    error;

    cityOptions = [];

    ratingOptions = [
        { label: 'All Ratings', value: '' },
        { label: '3+ Stars', value: '3' },
        { label: '3.5+ Stars', value: '3.5' },
        { label: '4+ Stars', value: '4' },
        { label: '4.5+ Stars', value: '4.5' },
        { label: '5 Stars', value: '5' }
    ];
   
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

    @wire(getHotels, { city: '$city', minRating: '$minRating' })
    wiredHotels({data,error}){
        if(data){
            this.hotels = data.map(h => ({
                ...h,
                stars: this.buildStars(h.Hotel_Rating__c)
            }));
            this.error = undefined;
            this.isLoading = false;
        } else if(error){
            this.error = error.body?.message;
            this.hotels = [];
            this.isLoading = false;
        } else {
            this.isLoading = true;
        }
    }

    buildStars(rating) {
        const r = rating || 0;
        const full = Math.floor(r);
        const half = (r - full) >= 0.5;
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < full) stars.push({ key: i, cls: 'star-full' });
            else if (i === full && half) stars.push({ key: i, cls: 'star-half' });
            else stars.push({ key: i, cls: 'star-empty' });
        }
        return stars;
    }
   

    handleCityChange(event){
        this.city = event.target.value;
        this.selectedHotel = null;
    }

    handleRatingChange(event){
        const val = event.target.value;
        this.minRating = val ? parseFloat(val) : null;
    }

  

   handleSelect(event){
const hotelId = event.currentTarget.dataset.id;
this.selectedHotelId = hotelId;
this.showHotelDetail = true;
}

closeHotelDetail(){
this.showHotelDetail = false;
this.selectedHotelId = null;
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
