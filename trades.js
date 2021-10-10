/*
Get and update trades from the latest signals. 
Collect Trades data and import in array
Collect Signals data and import in array
  columns:
    0 = ticker
    3 = range vol.%
    16 = signal
    18 = last price
 */
function getTrades(force) {

  var flag = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('F8').getValue();

  if (force) { Logger.log('get trades...'); }

  if (flag != 'Yes' || force) {
    var avoidSignal = getSignalsOrdersTag('avoidSignal');
    var exitSignal = getSignalsOrdersTag('exitSignal');
    var longSignal = getSignalsOrdersTag('longSignal');
    var shortSignal = getSignalsOrdersTag('shortSignal');
    var longOrder = getSignalsOrdersTag('longOrder');
    var shortOrder = getSignalsOrdersTag('shortOrder');
    var tradesArray = [];
    var numberOfTrades = 0;

    var settingsTab = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');
    var timeFrom = settingsTab.getRange('F5').getValue() +1;
    var timeTo = settingsTab.getRange('F6').getValue() +1;

    if ((getTimeNow('hour') >= timeFrom && getTimeNow('hour')< timeTo) || force ){
            
      //take a snapshot of the active trade(s) list
      takeSnapshotOfActiveTrade();
      //Collect signals data
      var dataSignals = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Signals').getRange('B3:T102');
      var signalsRawArray = dataSignals.getValues();

      //Collect trades data
      var dataTrades = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:G200');
      var tradesRawArray = dataTrades.getValues();
      //Exit trades
      setClosedTradeTotalPnl(true, 0, 0);
      tradesArray = exitTrades(signalsRawArray,tradesRawArray, exitSignal, avoidSignal);
      tradesArray = exitReversedTrades(signalsRawArray, tradesArray, longSignal, shortSignal, exitSignal, avoidSignal, longOrder, shortOrder);
      //Entering new trades
      tradesArray = enterTrades(signalsRawArray, tradesArray, longSignal, shortSignal, exitSignal, avoidSignal, longOrder, shortOrder);

      numberOfTrades = tradesArray.length + 1;
      if (tradesArray.length > 0) {
        dataTrades = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:G'+ numberOfTrades);
        dataTrades.clearContent();
        dataTrades.setValues(tradesArray);
      }

      //set flag to yes to confirm trades have been processed
      SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('F8').setValue('Yes');
    }
  }
}

/**
 * Save closed trade total pnl of the day
 * Parameters:
 * 1. reset = if true then set the closed trade.pnl. to 0. if false collect pnl
 * 2. pnl = individual trade pnl
 * 3. allocSize = Trade max allocation size specified in the settings tab.
 */
function setClosedTradeTotalPnl(reset, pnl, allocSize){

  var totalPnl = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('N17');
  var calcTotalPnl = 0;

  if (reset) {
    //Reset to 0%
    totalPnl.setValue(0);
  }
  else {
    //Add up each trade Pnl
    calcTotalPnl = totalPnl.getValue() + (pnl * allocSize);
    totalPnl.setValue(calcTotalPnl);
  }

}

/**
 * Take a snapshot of the current active trade(s) list
 */
function takeSnapshotOfActiveTrade(){
  var activeTradesList = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A1:G300');
  var snapshotTradesList = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('R1:X300');
  //clear the previous snapshot
  snapshotTradesList.clearContent();
  //take a snapshot of the active trade(s) and save to the snapshot column
  snapshotTradesList.setValues(activeTradesList.getValues());
}

/**
 * Get the last price and compute p/l for each instrument
 * update the timestamp
 */
function getTradesLatestData() {
  var signalTickerCol = 0;
  var signalLastPriceCol = 18;
  var tradeTickerCol = 0;
  var tradeOrderCol = 1;
  var tradeEntryPriceCol = 2;
  var tradeLastPriceCol = 3;
  var tradePnLCol = 4;
  var tradeTimeStampCol = 6;
  var currentTimestamp = getDateFormat(Date.now());
  var tradeTicker = '';
  var tradeOrder = '';
  var tradePnl = 0;
  var numberOfTrades = 0;

  var tradesArray = [];
  //Collect trades data
  var dataTrades = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:G200');
  tradesArray = dataTrades.getValues();
  //Collect signals data
  var dataSignals = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Signals').getRange('B3:T102');
  var signalsRawArray = dataSignals.getValues();

  for (var i = 0; i < tradesArray.length; i++){      
    tradeTicker = tradesArray[i][tradeTickerCol];
    if (tradeTicker != ''){
      for (var j = 0; j < signalsRawArray.length; j++){
        if (signalsRawArray[j][signalTickerCol] == tradeTicker) {

          if (tradesArray[i][tradeTimeStampCol] == '') {tradesArray[i][tradeTimeStampCol] = currentTimestamp;}

          if ((tradesArray[i][tradeLastPriceCol] != signalsRawArray[j][signalLastPriceCol]) || (tradesArray[i][tradeEntryPriceCol] == '')) {
            if (tradesArray[i][tradeEntryPriceCol] == '') {tradesArray[i][tradeEntryPriceCol] = signalsRawArray[j][signalLastPriceCol];}
            if (signalsRawArray[j][signalLastPriceCol] != ''){tradesArray[i][tradeLastPriceCol] = signalsRawArray[j][signalLastPriceCol];}
            tradeOrder = tradesArray[i][tradeOrderCol];

            if (tradesArray[i][tradeEntryPriceCol] != '' &&  tradesArray[i][tradeLastPriceCol] != ''){
              if (tradeOrder == 'long') {
                tradePnl = parseFloat(tradesArray[i][tradeLastPriceCol]) - parseFloat(tradesArray[i][tradeEntryPriceCol]);
                tradePnl = tradePnl/parseFloat(tradesArray[i][tradeEntryPriceCol]);
              }
              if (tradeOrder == 'short') {
                tradePnl = parseFloat(tradesArray[i][tradeEntryPriceCol]) - parseFloat(tradesArray[i][tradeLastPriceCol]);
                tradePnl = tradePnl/parseFloat(tradesArray[i][tradeLastPriceCol]);
              }
            }
            
            tradesArray[i][tradePnLCol] = parseFloat(tradePnl);
          }
        }
      }
    }
  }
  

  numberOfTrades = tradesArray.length + 1;
  if (tradesArray.length > 0) {
    dataTrades = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:G'+ numberOfTrades);
    dataTrades.clearContent();
    dataTrades.setValues(tradesArray);
  }
}

/** 
 * Get current total allocation
 */
function getCurrentAllocation(tradesRawArray){
  var totalAlloc = 0;
  var allocColIndex = 5;
  var allocColStartRow = 2;
  var allocColEndRow = 300;
  var maxAllocPerTrade = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('C6').getValue();
  var numOfSignals = getNumberOfSignals();
  var signalAlloc = numOfSignals * maxAllocPerTrade;

  for (var i = allocColStartRow; i < allocColEndRow; i++){
    if ( tradesRawArray[i] != null) {
      if (tradesRawArray[i][allocColIndex] != ''){
        totalAlloc = totalAlloc + tradesRawArray[i][allocColIndex];
      }
    }
  }

  totalAlloc = totalAlloc + signalAlloc;
  return totalAlloc;
}

/**
 * Add trade based on various criteria such as:
 * (1) max number of positions
 * (2) max drawdown gap for grid
 */
function enterTrades(signalsRawArray, tradesRawArray, longSignal, shortSignal, exitSignal, avoidSignal, longOrder, shortOrder){
  var tradesArray = tradesRawArray;
  var maxAllocPerTrade = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings').getRange('C6').getValue();
  var ticker = '';
  var signalType = '';
  var orderType = '';
  var marketPrice = 0;
  var lastPrice = 0;
  var pnl = '0%';
  var alloc = maxAllocPerTrade;
  var row = [];

  if (getCurrentAllocation(tradesRawArray) < 1){

    if (alloc == '' || alloc == 0 ) { alloc = '1%';}

    for (var i = 0; i < signalsRawArray.length; i++){
      ticker = signalsRawArray[i][0];
      signalType = signalsRawArray[i][16];
      marketPrice = signalsRawArray[i][18];
      lastPrice = marketPrice;

      if (signalType != '' && signalType != exitSignal && signalType != avoidSignal) {
        row = [];
        row.push(ticker);
        if (signalType == longSignal)
          row.push(longOrder);
        if (signalType == shortSignal)
          row.push(shortOrder);
        row.push(marketPrice);
        row.push(lastPrice);
        row.push(pnl);
        row.push(alloc);
        row.push('');
        tradesArray.push(row);
      }
    }
  }
  else {
    //Remove signals added long and short signals if threshold reached
  }
  return tradesArray;

}

/**
 * Remove reversed trades from the list of trades
 */
function exitReversedTrades(signalsRawArray, tradesRawArray, longSignal, shortSignal, exitSignal, avoidSignal, longOrder, shortOrder){
  var tradesArray = [];
  var ticker = '';
  var orderType = ''
  var signalType = ''
  
  for (var i = 0; i < tradesRawArray.length; i++){
    ticker = tradesRawArray[i][0];
    orderType = tradesRawArray[i][1];

    for (var j = 0; j < signalsRawArray.length; j++){
      //check everything that is different than the exit signal
      if (signalsRawArray[j][0] == ticker){
        if (signalsRawArray[j][16] != exitSignal && signalsRawArray[j][16] != avoidSignal ){
          signalType = signalsRawArray[j][16];
          //long signal and long trade position exist
          if (signalType == longSignal && orderType == longOrder){
            tradesArray.push(tradesRawArray[i]);
          }
          //short signal and short trade position exist
          if (signalType == shortSignal && orderType == shortOrder){
            tradesArray.push(tradesRawArray[i]);
          }
          //If no signal is published then keep the trade position
          if (signalType == '') {
            tradesArray.push(tradesRawArray[i]);
          }
          //Add to history tab trade that are reversed
          if (signalType == longSignal && orderType == shortOrder){
            addToHistoryTab(tradesRawArray[i], avoidSignal, signalType);
          }
          if (signalType == shortSignal && orderType == longOrder){
            addToHistoryTab(tradesRawArray[i], avoidSignal, signalType);
          }
          //Add to total closed trade pnl of the day to compute performance
          setClosedTradeTotalPnl(false, tradesRawArray[i][4], tradesRawArray[i][5]);            
        }
      }
    }
  }
  return tradesArray;
}

/**
 * From the list of Signals remove trade that are tagged with an exit signal
 */
function exitTrades(signalsRawArray, tradesRawArray, exitSignal, avoidSignal){

  var tradesArray = [];
  var ticker = '';

  for (var i = 0; i < tradesRawArray.length; i++){
    ticker = tradesRawArray[i][0];
    for (var j = 0; j < signalsRawArray.length; j++){
      if (signalsRawArray[j][0] == ticker && ticker != ''){
        
        if (signalsRawArray[j][16] != exitSignal && signalsRawArray[j][16] != avoidSignal ){
          tradesArray.push(tradesRawArray[i]);
        }
        else {
          //Add to history tab trades that receive exit signal
          addToHistoryTab(tradesRawArray[i], avoidSignal, signalsRawArray[j][16]);
          //Add to total closed trade pnl of the day to compute performance
          setClosedTradeTotalPnl(false, tradesRawArray[i][4], tradesRawArray[i][5]);
        }

      }
    }    
  }
  return tradesArray;
}

/**
 * Check if a trade exists from provided ticker.
 * Return true if yes
 */
function existsTrade(ticker, tradesRawArray){
  
  var tradeFound = false;

  for (var i = 0; i < tradesRawArray.length; i++){
    if (tradesRawArray[i].toString().toLowerCase() == ticker.toLowerCase()) {
      tradeFound = true;
      break;
    }
  }
  
  return tradeFound;
}

/**
 * Get data related to a trade TP and SL
 * Return an array containing:
 * 0. TP or SL is reached = true or false
 * 1. percentage profit or loss of the trade
 * 
 * Provide two parameters:
 * 1. ticker
 * 2. range.%
 */
function getTradeTpSl(ticker, rangePct){

  var tradeStatus = [];
  var thresholdReached = false;
  var sl = -1;
  var tp = 1;
  //get the risk reward ratio
  var riskRewardRatio = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings').getRange('C12').getValue();
  //Get trade data: ticker, Pnl
  /**
   * 0 = ticker
   * 4 = pnl
   */
  var tradeData = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades').getRange('A2:E1000').getValues();
  //trade pnl
  var tradePnl = 0;

  for (var i = 0; i < tradeData.length; i++) {
    if (tradeData[i][0] != '' || tradeData[i][0] != null) {
      if (tradeData[i][0] == ticker) {
        if (Math.abs(tradeData[i][4]) > Math.abs(tradePnl))
          tradePnl = tradeData[i][4];
      }
    }
  }
  //check that the tradePnl is reaching or not attaining the TP and SL level
  if (rangePct == '' || rangePct == null) {rangePct = 1;}
  sl = (Math.abs(rangePct)/riskRewardRatio)*-1;
  tp = Math.abs(rangePct);

  if (tradePnl < 0){
    if (tradePnl <= sl) thresholdReached = true;
  }
  else {
    if (tradePnl >= tp) thresholdReached = true;
  }
  tradeStatus.push(thresholdReached, tradePnl);

  return tradeStatus;
}

