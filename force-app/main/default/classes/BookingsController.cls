public with sharing class BookingsController {

    @AuraEnabled
    public static List<Guest_Detail__c> getBookings(String email) {
        if (String.isBlank(email)) {
            throw new AuraHandledException('Email is required');
        }

        return [
            SELECT Id,
                   Guest_First_Name__c,
                   Guest_Last_Name__c,
                   Guest_Email__c,
                   Hotel__r.Hotel_Name__c,
                   Hotel__r.Per_Day_Cost__c,
                   Check_In_Date__c,
                   Check_Out_Date__c,
                   Adults__c,
                   Children__c,
                   (SELECT Name, Expiry_Month__c, Expiry_Year__c FROM Payment_Details__r ORDER BY CreatedDate DESC)
            FROM Guest_Detail__c
            WHERE Guest_Email__c = :email
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static List<EmailMessage> getConfirmationEmails(String email) {
        if (String.isBlank(email)) {
            return new List<EmailMessage>();
        }

        List<Guest_Detail__c> guests = [
            SELECT Id FROM Guest_Detail__c WHERE Guest_Email__c = :email
        ];

        if (guests.isEmpty()) {
            return new List<EmailMessage>();
        }

        Set<Id> guestIds = new Set<Id>();
        for (Guest_Detail__c g : guests) {
            guestIds.add(g.Id);
        }

        return [
            SELECT Id, Subject, TextBody, ToAddress, CreatedDate, RelatedToId
            FROM EmailMessage
            WHERE RelatedToId IN :guestIds
            ORDER BY CreatedDate DESC
        ];
    }
}
