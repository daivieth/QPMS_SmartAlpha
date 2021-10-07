/******************************************************************************
Project:          QPMS: Smartalpha
Author:           Daiviet HUYNH
Email:            daiviet.huynh@gmail.com
Website:          https://www.g8moon.com

For testing:
------------
global_qpms_master_id = '1GaluY25euzzojwkKw4-5cQmiJByWqMoPk0UDXryGuWw';
global_editor_sp_id = '1keMZ1P3XZ8bEKtVcOUWpU-84vOLoap1jeEi8bcKhbLE';
global_sentiment_sp_id = '1suzCdwjNMIYOpqsGiVD7mK7GiN8siR4A914drYC8J9U';
******************************************************************************/
var global_version = '2.2.9.2';

var global_data_main_id = '1AFTbOuVvPTWS1peJ-zK6CUcsj2sy_nYGVaw2T8-7qf8';
var global_main_base_url = 'https://script.google.com/macros/s/AKfycbzaEMiFQpBkD48QwB3t2VxlJpBRTBRCHQ5I7t-2lA4IUVv-OTBKRzzL42VsAGPAimSW/exec';
var global_qpms_master_id = '';
var global_editor_sp_id = '';
var global_sentiment_sp_id = '';


/**
 * Execute time-driven trigger
 * (1) Collect Sentiment score
 * (2) Collect and calculate performance
 * (3) Compute and get Signals
 * (4) Get trades from Signals
 * 
 * Note: Run script only on weekdays.
 * dev: force each scripts to run for testing purpose.
 */
function triggerDataUpdate(id){
  var dev = false;
  //id  = '1GaluY25euzzojwkKw4-5cQmiJByWqMoPk0UDXryGuWw'; //G8
  //id = '1AtYrhMyu4HraF_pyAiMswNFtJRnC2AXpNm2sfaP6wAE'; //ASX200
  //id = '1e2gp0t_xzyVS0kIcnXUWJPJbCp-hpTW5WscxNxhfuPc'; //FX Major Trend
  
  update_qpms_master_id(id);
  global_editor_sp_id = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings').getRange('C5').getValue();
  global_sentiment_sp_id = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings').getRange('C6').getValue();

  var dayOfWeek = getDayOfWeek();

  initSheet(dev); //H-2
  if ((dayOfWeek != 'SAT' && dayOfWeek != 'SUN') || dev) {
    getSentimentScore(dev); //H-1
    getSignal(dev); //H-0
    getTrades(dev); //H+1
    getTradesLatestData() //based on specific conditions
    getPortfolioPerformance(dev) //H+12
  }

}

/**
 * Load the web front end page
 * Collect querystring parameters
 * Sign in
 * Model selection
 */
function doGet(e) {
  var umod = e.parameter.umod;
  var username = e.parameter.username;

  if (umod == null) {

    //Manage sign in
    if (username != null) {
      username = username.toString().toLowerCase();
      var vusername = getDataMain(username, 1);
      var umod = getDataMain(username, 8);
      if (vusername != '' && vusername != null) { vusername = vusername.toString().toLowerCase(); }
      if (username == vusername) {
        return HtmlService.createHtmlOutput(outputSignalHtmlPage(umod));
      }
      else {
        return HtmlService.createHtmlOutputFromFile('signin-error');
      }
    }
    else {
        return HtmlService.createHtmlOutputFromFile('index');
    }
  }
  else {
    var vumod = getDataMain(umod,1);
    if (vumod != '' && vumod != null) { vumod = umod;}
    if (umod == vumod){
      //Manage main signal page
      return HtmlService.createHtmlOutput(outputSignalHtmlPage(umod));
    }
  }
}

/**
 * This is to test call to see if code can be executed through the library
 */
function testLibrary(){
  Logger.log('All good !');
}

/**
 * Get the master ID
 */
function update_qpms_master_id(id) {
  global_qpms_master_id = id;
}

/**
 * Get Data from Data:Main (User or Model)
 * return array that correspond to umod
 * 0 = Type (User/model)
 * 1 = username/email/model name
 * 2 = master-url
 * 3 = ss-master-id
 * 4 = ss-editor-id
 * 5 = ss-sentiment-id
 * 6 = ss-sentiment-dic-id
 * 7 = ss-global-data-id
 * 8 = default-model
 * 9 = performance-chart-embed
 * 
 * Return Null if not found.
 */
function getDataMain(umod, what) {

  var selectUmod = '';
  var returnedData = [];

  var numRecord = 20000;
  var dataTable = SpreadsheetApp.openById(global_data_main_id).getRange('A1:I'+numRecord).getValues();

  umod = umod.toString().toLowerCase();

  for (var i = 0; i < numRecord; i++) {
    selectUmod = dataTable[i][1].toString().toLowerCase();
    if (selectUmod == umod ){
      returnedData = dataTable[i];
      break;
    }
  }
  return returnedData[what];
}

/**
 * Initialise the sheet
 */
function initSheet(force){

  var dataHistoryTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History');
  var settingsTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings');
  var settingsTabEditor = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');

  var timeFrom = settingsTab.getRange('F5').getValue() -2;
  var timeTo = settingsTab.getRange('F6').getValue() -2;
  var umod = settingsTab.getRange('F9').getValue();


  if ((getTimeNow('hour') >= timeFrom && getTimeNow('hour')< timeTo) || force ){  
    //set the version
    settingsTab.getRange('C10').setValue(global_version);
    //Set User Data ID
    settingsTab.getRange('C11').setValue(global_data_main_id);
    //Set Editor ID
    settingsTab.getRange('C5').setValue(getDataMain(umod, 4));
    //Set Sentiment ID
    settingsTab.getRange('C6').setValue(getDataMain(umod, 5));
    //Set Master ID
    settingsTabEditor.getRange('C5').setValue(getDataMain(umod, 3));
    //Set Data Global ID
    settingsTabEditor.getRange('C8').setValue(getDataMain(umod, 7));
    //set pie access
    var pie = settingsTab.getRange('A1');
    pie.setFormula('=HYPERLINK("https://docs.google.com/spreadsheets/d/'+ global_qpms_master_id +'","π")');
    //Collect trades performance, set previous perf.d.%
    var dataPrevPortfolioPerformance = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('N11');
    dataPrevPortfolioPerformance.setValue(getTodayTradesPortfPerf());
    //set portfolio performance calc to "No" to trigger process
    var calcPortfTag = dataHistoryTab.getRange('N2');
    calcPortfTag.setValue('No');
    //set the benchmark to be used which is specified in tab settings
    getBenchmark();

    if (force) { Logger.log('initialise sheet...');}
  }


}

/**
* Recalc Signals: Force update even not in the time range
*/
function recalcSignal(){

 var ui = SpreadsheetApp.getUi();
 var response = ui.alert('Are you sure you want to synchronise and recalculate Signals?', ui.ButtonSet.YES_NO);

 if (response == ui.Button.YES) {
    getSignal(true);
    ui.alert('Signals have been successfully recalculated and synchronised. It might takes up to 5 minutes for Google to refresh the updated data.',ui.ButtonSet.OK);
 }
}

/**
* Get time from the New York Timezone
*/
function getTimeNow(what){

  var settingsTab = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');
  var d = new Date();
  var thisTimeZone = settingsTab.getRange('F7').getValue();
  var hourNow = Utilities.formatDate(d, thisTimeZone, 'HH');
  var minuteNow = Utilities.formatDate(d, thisTimeZone, 'mm');
  var returnedValue = '';

  if (what == 'hour') returnedValue = hourNow;
  if (what == 'minute') returnedValue = minuteNow;
  return returnedValue;

}

/**
 * Format date into dd-mmm-yyyy
 */
function getDateFormat(value) {

    let date = new Date(value);
    const day = date.toLocaleString('default', { day: '2-digit' });
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.toLocaleString('default', { year: 'numeric' });
    return day + '-' + month + '-' + year;

}

/**
 * Get day of the week in 3 characters based on the provided timezone
 * Return for instance: MON, TUE, WED, THU, FRI, SAT, SUN
 */
function getDayOfWeek() {
  var timeZone = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('F7').getValue();
  var currentDayOfWeek = Utilities.formatDate(new Date(), timeZone, "EEE");

  switch(currentDayOfWeek) {
    case 'Mon': currentDayOfWeek = 'MON'; break;
    case 'mon': currentDayOfWeek = 'MON'; break;
    case 'Tue': currentDayOfWeek = 'TUE'; break;
    case 'tue': currentDayOfWeek = 'TUE'; break;
    case 'Wed': currentDayOfWeek = 'WED'; break;
    case 'wed': currentDayOfWeek = 'WED'; break;
    case 'Thu': currentDayOfWeek = 'THU'; break;
    case 'thu': currentDayOfWeek = 'THU'; break;
    case 'Fri': currentDayOfWeek = 'FRI'; break;
    case 'fri': currentDayOfWeek = 'FRI'; break;
    case 'Sat': currentDayOfWeek = 'SAT'; break;
    case 'sat': currentDayOfWeek = 'SAT'; break;
    case 'Sun': currentDayOfWeek = 'SUN'; break;
    case 'sun': currentDayOfWeek = 'SUN'; break;
    default: break;
  }  
  
  return currentDayOfWeek;
}
