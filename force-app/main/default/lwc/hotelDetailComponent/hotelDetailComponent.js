import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getHotel from '@salesforce/apex/HotelListController.getHotel';

export default class HotelDetailComponent extends NavigationMixin(LightningElement) {

@api hotelId;
hotel;
stars = [];

@wire(getHotel,{hotelId:'$hotelId'})
hotelData({data,error}){
if(data){
this.hotel = data;
this.stars = this.buildStars(data.Hotel_Rating__c);
}
if(error){
console.error(error);
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

handleBook(){

this[NavigationMixin.Navigate]({
type:'standard__navItemPage',
attributes:{
apiName:'Guest_Entry_Details'
},
state:{
c__hotelId: this.hotelId
}
});

}

}