/**
 * Sign in: upate info
 * 1. Last-login time
 * @param {string} puser
 */
function setSigninInfo(puser) {

    var timestamp = getDateFormat(Date.now());
    var umodArray = SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Main').getRange('A2:K20000').getValues();
    var username = '';
    var userEntryPos = 0;
    var i = 0;
    var rowNumber = 2;

    //get user entry position
    for (i = 0; i < umodArray.length; i++) {   
        username = umodArray[i][1];
        if (username == puser) {
            userEntryPos = i;
            break;
        }
    }
    //update timestamp
    rowNumber = rowNumber + i;
    SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Main').getRange('K'+rowNumber).setValue(timestamp);

return;

}

/**
 * Process user signin. Redirect to the corresponding section
 * @param {string} username 
 */
function userSignin(username) {

    var output;

    if (username != null) {

        username = username.toString().toLowerCase();
        //check that username exists in the SS
        var vusername = getDataMain(username, 1);
        //get user's default "Strategy Model"
        var umod = getDataMain(username, 8);
        
        if (vusername != '' && vusername != null) { 
            vusername = vusername.toString().toLowerCase(); 
        }

        if (username == vusername) {
            output = HtmlService.createHtmlOutput(outputSignalHtmlPage(umod, username));
            setSigninInfo(username);
        }
        else {
            output = HtmlService.createHtmlOutputFromFile('signin-error');
        }
        
    }
    else {
        output = HtmlService.createHtmlOutputFromFile('index');
    }
    
    return output;

}
