public with sharing class PaymentController {
@AuraEnabled
public static Id savePayment(
    String cardNumber,
    String cvv,
    String expiryMonth,
    String expiryYear,
    Id guestId
){

    if(String.isBlank(cardNumber) ||
       String.isBlank(cvv) ||
       String.isBlank(expiryMonth) ||
       String.isBlank(expiryYear)){
        throw new AuraHandledException('All payment fields are required');
    }

    if(guestId == null){
        throw new AuraHandledException('GuestId missing');
    }

    if(cvv.length() < 3 || cvv.length() > 4){
        throw new AuraHandledException('CVV must be 3 or 4 digits');
    }

    Payment_Detail__c payment = new Payment_Detail__c(
        Card_Number__c = cardNumber.replace(' ',''),
        CVV__c = cvv,
        Expiry_Month__c = expiryMonth,
        Expiry_Year__c = expiryYear,
        Payer_Details__c = guestId
    );

    insert payment;

    payment = [SELECT Name, Expiry_Month__c, Expiry_Year__c FROM Payment_Detail__c WHERE Id = :payment.Id];

    try{

        Guest_Detail__c guest = [
            SELECT Guest_Email__c,
                   Guest_First_Name__c,
                   Guest_Last_Name__c,
                   Hotel__r.Hotel_Name__c,
                   Hotel__r.Per_Day_Cost__c,
                   Check_In_Date__c,
                   Check_Out_Date__c,
                   Adults__c,
                   Children__c
            FROM Guest_Detail__c
            WHERE Id = :guestId
            LIMIT 1
        ];

        if(String.isNotBlank(guest.Guest_Email__c)){

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            mail.setToAddresses(new String[]{ guest.Guest_Email__c });
            mail.setSaveAsActivity(false);
            mail.setSenderDisplayName('INT Hotel Booking');

            mail.setSubject('Hotel Booking & Payment Confirmation');

            String last4 = cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : cardNumber;
            Integer nights = (guest.Check_In_Date__c != null && guest.Check_Out_Date__c != null)
                ? guest.Check_In_Date__c.daysBetween(guest.Check_Out_Date__c) : 0;
            Integer adults   = guest.Adults__c   != null ? Integer.valueOf(guest.Adults__c)   : 1;
            Integer children = guest.Children__c != null ? Integer.valueOf(guest.Children__c) : 0;
            Decimal perDay   = guest.Hotel__r.Per_Day_Cost__c != null ? guest.Hotel__r.Per_Day_Cost__c : 0;
            Decimal total    = perDay * nights;
            String emailBody =
                'Hi ' + guest.Guest_First_Name__c + ' ' + guest.Guest_Last_Name__c +
                ',\n\nYour booking and payment have been successfully confirmed!' +
                '\n\n--- Booking Details ---' +
                '\nHotel: ' + guest.Hotel__r.Hotel_Name__c +
                '\nCheck-In Date:  ' + (guest.Check_In_Date__c  != null ? String.valueOf(guest.Check_In_Date__c)  : 'N/A') +
                '\nCheck-Out Date: ' + (guest.Check_Out_Date__c != null ? String.valueOf(guest.Check_Out_Date__c) : 'N/A') +
                '\nNumber of Nights: ' + nights +
                '\nAdults: ' + adults + '  |  Children: ' + children +
                '\n\n--- Payment Details ---' +
                '\nCard: **** **** **** ' + last4 +
                '\nExpiry: ' + payment.Expiry_Month__c + ' / ' + payment.Expiry_Year__c +
                '\nPer Night Rate: INR ' + perDay +
                '\nTotal Amount: INR ' + total +
                '\n\nThank you for booking with us!';

            mail.setPlainTextBody(emailBody);

            Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ mail });

            EmailMessage emailLog = new EmailMessage();
            emailLog.RelatedToId = guestId;
            emailLog.ToAddress = guest.Guest_Email__c;
            emailLog.Subject = 'Hotel Booking & Payment Confirmation';
            emailLog.TextBody = emailBody;
            emailLog.FromAddress = UserInfo.getUserEmail();
            emailLog.FromName = 'INT Hotel Booking';
            emailLog.Status = '3';
            emailLog.MessageDate = DateTime.now();
            insert emailLog;
        }

    }catch(Exception e){
        System.debug('Email failed: ' + e.getMessage());
    }

    return payment.Id;
}
}