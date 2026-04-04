public with sharing class HotelListController {

    @AuraEnabled(cacheable=true)
    public static List<Hotel_Detail__c> getHotels(String city, Decimal minRating){
        System.debug('CITY: '+ city + ' MIN RATING: ' + minRating);

        String baseSelect = 'SELECT Id, Name, Hotel_Name__c, Hotel_City__c, Hotel_Type__c, Hotel_Rating__c, Hotel_Image__c, Per_Day_Cost__c, WiFi_Availability__c, Cash_Pay_Availability__c, Cancellation_Availability__c FROM Hotel_Detail__c';
        String whereClause = '';

        if(!String.isBlank(city)){
            whereClause += ' WHERE Hotel_City__c = :city';
        }
        if(minRating != null && minRating > 0){
            whereClause += (String.isBlank(whereClause) ? ' WHERE' : ' AND') + ' Hotel_Rating__c >= :minRating';
        }

        String query = baseSelect + whereClause + ' ORDER BY Hotel_Rating__c DESC LIMIT 10';
        List<Hotel_Detail__c> hotels = Database.query(query);

        System.debug('HOTELS FOUND = ' + hotels.size());
        return hotels;
    }
    @AuraEnabled(cacheable=true)
    public static Hotel_Detail__c getHotel(Id hotelId){ 

        return [
            SELECT Id, Hotel_Name__c, Hotel_City__c, Hotel_Type__c, Hotel_Rating__c, Hotel_Image__c,
                     Per_Day_Cost__c, WiFi_Availability__c,
                     Cash_Pay_Availability__c, Cancellation_Availability__c
            FROM Hotel_Detail__c
            WHERE Id = :hotelId
              LIMIT 1
        ];
    }
}



