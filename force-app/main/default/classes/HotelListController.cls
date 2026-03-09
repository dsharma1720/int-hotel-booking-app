public with sharing class HotelListController {

    @AuraEnabled(cacheable=true)
    public static List<Hotel_Detail__c> getHotels(String city){
        System.debug('CITY: '+ city);
        

List<Hotel_Detail__c> hotels;

if(String.isBlank(city)){
    hotels = [SELECT Id, Name, Hotel_Name__c, Hotel_City__c, Hotel_Type__c, Hotel_Rating__c, Hotel_Image__c,
                     Per_Day_Cost__c, WiFi_Availability__c,
                     Cash_Pay_Availability__c, Cancellation_Availability__c
              FROM Hotel_Detail__c LIMIT 10];
} else {
    hotels = [SELECT Id, Name, Hotel_Name__c, Hotel_City__c, Hotel_Type__c, Hotel_Rating__c, Hotel_Image__c,
                     Per_Day_Cost__c, WiFi_Availability__c,
                     Cash_Pay_Availability__c, Cancellation_Availability__c
              FROM Hotel_Detail__c WHERE Hotel_City__c = :city LIMIT 10];
}
 

 System.debug('HOTELS FOUND = ' + hotels.size());
 return hotels;       

    }
    @AuraEnabled(cacheable=true)
    public static Hotel_Detail__c getHotel(Id hotelId){ 

        return [
            SELECT Id, Name, Hotel_Name__c, Hotel_City__c, Hotel_Type__c, Hotel_Rating__c, Hotel_Image__c,
                     Per_Day_Cost__c, WiFi_Availability__c,
                     Cash_Pay_Availability__c, Cancellation_Availability__c
            FROM Hotel_Detail__c
            WHERE Id = :hotelId
              LIMIT 1
        ];
    }
}



