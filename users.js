/**
 * Sign in: upate info
 * 1. Last-login time
 * 
 * Parameter:
 * 1. user = username or email of the user
 */
function setSigninInfo(user) {
    var timestamp = getDateFormat(Date.now());
    var umodArray = SpreadsheetApp.openById(global_data_main_id).openSheetByName('Data:Main').getRange('A2:K20000').getValues();

    for (var i = 0; i < umodArray.length; i++) {
        
    }

}
