import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getHotel from '@salesforce/apex/HotelListController.getHotel';

export default class HotelDetailComponent extends NavigationMixin(LightningElement) {

hotelId;
hotel;

@wire(CurrentPageReference)
getStateParameters(pageRef){
if(pageRef){
this.hotelId = pageRef.state.c__hotelId;
}
}

@wire(getHotel,{hotelId:'$hotelId'})
hotelData({data,error}){
if(data){
this.hotel = data;
}
if(error){
console.error(error);
}   
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