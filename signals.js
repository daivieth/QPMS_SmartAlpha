/**
 * Return signal and trade order tag and caption
 * (1) exitSignal
 * (2) longSignal
 * (3) shortSignal
 * (4) avoidSignal
 * (5) longOrder
 * (6) shortOrder
 * @param {String} p - provide the signal tag displayed in the SS
 */
function getSignalsOrdersTag(p){

  var exitSignal = '❌';
  var longSignal = '✅';
  var shortSignal = '⏬';
  var avoidSignal = '🚩';
  var longOrder = 'long';
  var shortOrder = 'short';
  var tag = '';

  if (p == 'exitSignal') tag = exitSignal;
  if (p == 'longSignal') tag = longSignal;
  if (p == 'shortSignal') tag = shortSignal;
  if (p == 'avoidSignal') tag = avoidSignal;
  if (p == 'longOrder') tag = longOrder;
  if (p == 'shortOrder') tag = shortOrder;
  
  return tag;
}

/**
 * Return signal string for app interface
 * what:
 * 1 = caption
 * 2 = button color
 * 3 = text signal
 * @param {String} p - signal tag provided in the SS
 * @param {Integer} what - 1 = return text, 2 = return class, 3 = return tag
 */
function getSignalsOrdersTagApp(p, what){
  var exitSignal = getSignalsOrdersTag('exitSignal');
  var longSignal = getSignalsOrdersTag('longSignal');
  var shortSignal = getSignalsOrdersTag('shortSignal');
  var avoidSignal = getSignalsOrdersTag('avoidSignal');
  var tag = '';

  if (what == 1) {
    if (p == exitSignal) tag = exitSignal + ' Exit';
    if (p == longSignal) tag = longSignal + ' Buy';
    if (p == shortSignal) tag = shortSignal + ' Sell';
    if (p == avoidSignal) tag = avoidSignal + ' Avoid';
  }

  if (what == 2) {
    if (p == exitSignal) tag = 'btn-outline-danger';
    if (p == longSignal) tag = 'btn-success';
    if (p == shortSignal) tag = 'btn-danger';
    if (p == avoidSignal) tag = 'btn-outline-info';  
  }

  if (what == 3) {
    if (p == exitSignal) tag = 'exitSignal';
    if (p == longSignal) tag = 'longSignal';
    if (p == shortSignal) tag = 'shortSignal';
    if (p == avoidSignal) tag = 'avoidSignal'; 
  }

  return tag;  
}

/**
 * Get number of long and short signals
 */
function getNumberOfSignals(){
  var numSignal = 0;
  var longSignal = getSignalsOrdersTag('longSignal');
  var shortSignal = getSignalsOrdersTag('shortSignal');
  var signalColData = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Signals').getRange('R3:R102');
  var signalsArray = signalColData.getValues();
  

  for (i = 0; i < signalsArray.length; i++){
    if (signalsArray[i] == longSignal) { numSignal++;}
    if (signalsArray[i] == shortSignal) { numSignal++;}
  }

  return numSignal; 
}

/**
* Get Signal from tab Snap:Signals and copy to tab Signals. Format the content
@param {Boolean} force - If true then ignore time constraint and proceed
*/
function getSignal(force) {
  var settingsTab = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');
  var timeFrom = settingsTab.getRange('F5').getValue();
  var timeTo = settingsTab.getRange('F6').getValue();
  var timestamp = getDateFormat(Date.now());

  if (force) { Logger.log('get signals...'); }

  if ((getTimeNow('hour') >= timeFrom && getTimeNow('hour')< timeTo) || force ){
    var first_row = 3;
    var last_row = 102;
    var ticker = '';
    var value_to_check = '';
    var data_updated = true;

    //Update timestamp
    SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings').getRange('F10').setValue(timestamp);

    //set flag 
    SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('F8').setValue('No');
    
    //Define data source, sheet id and get sheet by name
    var sp_source = SpreadsheetApp.openById(global_qpms_master_id);
    var data_source = sp_source.getSheetByName('Snap:Signals');
    
    for (i = first_row; i <= 5; i++){
      value_to_check = data_source.getRange('G'+i).getValue();
      if (value_to_check == ''){
        data_updated = false;
        break;
      }
    }
      
    if (data_updated){
      //Get data content from Snap:Signals
      var data_range = data_source.getRange('B'+ first_row +':'+'R'+ last_row);
      var signal_data = data_range.getValues();    
      var sp_target = sp_source.getSheetByName('Signals');
      sp_target.getRange('B'+ first_row +':'+'R'+ last_row).setValues(signal_data);
      //Get sparkline formula from column P
      var sparkline_data_range = data_source.getRange('P'+ first_row +':'+'P'+last_row);
      var sparkline_data = sparkline_data_range.getFormulas();
      sp_target.getRange('P'+ first_row +':'+'P'+last_row).setFormulas(sparkline_data);
      data_source = sp_source.getSheetByName('Snap:Signals');
      sp_target = sp_source.getSheetByName('Signals');    
      //Get and format the pos.avg and neg.avg column
      data_source.getRange('H3:I102').copyTo(sp_target.getRange('H3:I102'));
      data_source.getRange('H3:I102').setBackground('black');
      data_source.getRange('H3:I102').setFontColor('orange');
      //Get sentiment
      sp_target.getRange('S3:S102').setFormulas(data_source.getRange('S3:S102').getFormulas());

      for (i = first_row; i <= last_row; i++){
        ticker = sp_target.getRange('B'+i).getValue();
        if (ticker == ''){
          sp_target.getRange('H'+i+':'+'R'+i).setValue('');
        }
      }
    }
    //Update signals: remove signals outside of the risk envelope
    updateSignals();    
  }
}

/**
 * Update and Remove signals that are outside of the risk envelope
 * SignalsRawArray:
 * 0. Ticker
 * 1. Max.cumul.%
 * 2. Min.cumul.%
 * 3. Range.%
 * 4. Lower band
 * 5. Upper band
 * 6. Pos.avg
 * 7. Neg.avg
 * 8. Trend
 * 9. Strength
 * 10. Velocity
 * 11. Momentum
 * 12. Score
 * 13. 10d vol.chg
 * 14. Sparkline
 * 15. projection
 * 16. signal
 * 17. Sentiment
 * 18. last price
 */
function updateSignals(){

  var signalsTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Signals');
  var tradesRawArray = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:A200').getValues();
  var signalsRange = 'B3:T102';
  var signalsRangeStart = 3;
  var signalsRangeEnd = 102;
  var signalTagCol = 'R';
  var tickerCol = 'B';
  var signalVolRangeCol = 'E';
  var signalsRawArray = [];
  var drawdownThreshold = 0;
  var maxAllowedTradesPerPosition = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('C7').getValue();
  var numberOfActiveTradeAndDrawdown = [];
  var ticker = '';
  var selectedNumberOfActiveTrades = 0;
  var selectedPositionMaxDrawdown = 0;
  var selectedSignalTag = '';
  var tradeInfo = [];

  signalsRawArray = signalsTab.getRange(signalsRange).getValues();
  for (var i = 0; i < signalsRawArray.length; i++){
    selectedSignalTag = signalsRawArray[i][16];
    ticker = signalsRawArray[i][0];
    //Filter out exit and blank signals
    if (selectedSignalTag != getSignalsOrdersTag('exitSignal') && selectedSignalTag != ''){
      drawdownThreshold = (signalsRawArray[i][3] / maxAllowedTradesPerPosition )* -1;
      numberOfActiveTradeAndDrawdown = getNumberOfActiveTradesAndDrawdown(ticker, tradesRawArray);
      selectedNumberOfActiveTrades = numberOfActiveTradeAndDrawdown[0];
      selectedPositionMaxDrawdown = numberOfActiveTradeAndDrawdown[1];
      //update only if has at least one active trade
      if (selectedNumberOfActiveTrades > 0){
        //if number of active trades are above the threshold then remove the signal
        if (selectedNumberOfActiveTrades >= maxAllowedTradesPerPosition) {
          signalsRawArray[i][16] = '';
        }
        else {
          //if number of active trades under the max allowed trades per position
          //Remove signals that may be outside of the risk envelope
          if (selectedPositionMaxDrawdown > drawdownThreshold)
            signalsRawArray[i][16] = '';
        }
      }
      //Check if trade reached tp or sl
      tradeInfo = getTradeTpSl(signalsRawArray[i][0], signalsRawArray[i][3]);
      if (tradeInfo[0]) signalsRawArray[i][16] = getSignalsOrdersTag('exitSignal');
    }
    else {
      //flag position(s) that are not listed but to avoid
      if (selectedSignalTag == getSignalsOrdersTag('exitSignal')){
        if (!existsTrade(ticker, tradesRawArray)) {
          signalsRawArray[i][16] = getSignalsOrdersTag('avoidSignal');
        }
      }
    }
  }

  //Get only the Signal column
  var updatedSignalsColumn = [];
  for (var i = 0; i < signalsRawArray.length; i++){
    updatedSignalsColumn.push([signalsRawArray[i][16]]);
  }

  //import the results to signal column
  signalsTab.getRange(signalTagCol+signalsRangeStart+':'+signalTagCol+signalsRangeEnd).setValues(updatedSignalsColumn);
}


/**
 * Get the number of positions for a particular ticker
 * and get the maximum drawdown on that position for this particular ticker
 * ActiveTrades[0] = number of active position(s)
 * ActiveTrades[1] = largest drawdown
 * @param {String} ticker - ticker
 * @param {Array} tradesRawArray - Table of all active trades
 */
function getNumberOfActiveTradesAndDrawdown(ticker, tradesRawArray){
  var numTradesAndMaxDrawdown = [];
  var tickerToCheck = '';
  var tradeCount = 0;
  var drawdown = 0;

  for (var i = 0; i < tradesRawArray.length; i++){
    tickerToCheck = tradesRawArray[i][0];
    if (tickerToCheck == ticker){
      if (tradesRawArray[i][4] < drawdown)
        drawdown = tradesRawArray[i][4]
      tradeCount++;
    }
  }
  numTradesAndMaxDrawdown.push(tradeCount);
  numTradesAndMaxDrawdown.push(drawdown);
  return numTradesAndMaxDrawdown;
}
