$(document).ready(function(){

/***************************************************end of getStarted click handler***********************************************************/
/**
-load data from open trivia db 
-first generate the token to ensure each subsequent request has a unique dataset
-fire a GET call with below parameters to load data in a local object
- parameters to narrow the search on open trivia db api
   - token - unique token to track user does not get repeated questions
   - amount - total number of records to return 
   - level - Easy,Medium,Advanced
   - type - multiple or boolean
*/
 
  var token="";
  var numOfQuestions=10;
  var level="medium";
  var type="multiple";
  var localJsonDataSet = [];

var generateToken = function(){

$.ajax({
    url:   "https://opentdb.com/api_token.php?command=request",
    method:'GET'
  }).done(function(data){
    if(data.response_code === 0){
      //console.log("token generated successfully");
      token = data.token;
      console.log(data.token + " token generated!");
    }else{
      token="";
    }    
  }).fail(function(err){
    console.log("error appeared...");
    //console.log(err.response_code);    
  });
};


/***********************************end of generate token function***************************************************************************************************************/
    //url to fetch the data

var loadData = function(){
  var url = "https://opentdb.com/api.php?category=18";
  url += "&token="+token+"&amount="+numOfQuestions+"&difficulty="+level+"&type="+type;
  //a get call to load the data  
  $.ajax({
    url:url,
    method:'GET'
    }).done(function(data){
    console.log(data.results + " data loaded"); 
    localJsonDataSet = data.results.slice();
    //console.log(localJsonDataSet);
    }).fail(function(err){
     //console.log(err.response_code) ;
     var resCode = err.response_code;

     switch(resCode){
      
      case '1' : console.log("Not enough questions to return.Error code is 1"); break;
      case '2' : console.log("Invalid parameters in the arguments.Error code is 2"); break;
      case '3' : console.log("Session token does not exist.Error code is 3"); break;
      case '4' : console.log("Session token is empty.Need to regenerate the token.Error code is 4"); break;
      default  : console.log("error response code is " + err.response_code); break;

     }

    });
}

   generateToken();
   loadData();

/************************************end of loadData function********************************************************************************************************************/
/********************************************************End of loading data**********************************************************************/

var questionObject = {
 
 question : "",
 options:[],
 answer:"",
 level:"",
 counter:-1,
 data: "",
 isNextClicked:false,
 timeout_var:"",
 interval_var:"",
 display_time:"00:00",
 display_time_interval:"",
 display_time_seconds:"",
 timeout:"",
 intervalFlag:false,
 intervalID:"",
 millisec:120000,
 s:00,
 m:00,
 init: function(){
   clearInterval(this.intervalID);
   this.intervalFlag = false;
   this.millisec = 120000;
   clearTimeout(this.timeout_var);
   clearTimeout(this.timeout);
   //console.log("timer is OFF");
   clearInterval(this.interval_var);
   //console.log("next click polling OFF");
   clearInterval(this.display_time_interval);
   this.display_time="00:00";
   this.display_time_seconds="";
   this.isNextClicked=false;
   this.counter = parseInt(this.counter) + 1;
   //console.log(this.counter);
   this.data = this.getNextDataSet(this.counter);
   //console.log(this.data);
   this.question = this.data.question;
   //clone the options array 
   this.options = this.data.incorrect_answers.slice();
   //console.log(this.options);
   this.options.push(this.data.correct_answer);
   //console.log(this.options);
   var optArrayNew = shuffleArray(this.options);
   //console.log(optArrayNew);
   this.options = optArrayNew.slice();
   //console.log(this.options);
   //initialize the correct answer
   this.answer = this.data.correct_answer;
  // console.log(this.answer);
   //initialize the correct difficulty level
   this.level = this.data.difficulty; 
   //console.log(this.level);  
   this.category = this.data.category;
   //console.log(this.category);  
   this.type = this.data.type;
   //console.log(this.type);     
   //start the clock
   this.display();
  },
 getNextDataSet: function(cnt){
  // alert("getNextDataSet : # : data" + cnt + " : " +localJsonDataSet[cnt]);
   return localJsonDataSet[cnt];

 },
 start2mintimer: function(){

  if(this.intervalFlag === false){
     this.intervalFlag = true;
     var self = this;
     this.intervalID = setInterval(function(){
     self.millisec = self.millisec -1000;
     //console.log(self.millisec);
     },1000);
  }
  if(this.millisec<=0){
    clearInterval(this.intervalID);
    this.intervalFlag = false;
    //this.millisec = 120000;
    //console.log(this.intervalFlag);
    //console.log("time up");
    //("Time up");
    var user_selection = $("input:radio:checked").next().text();
    //console.log("user_selection: "+ user_selection);
    var resultObject = resultObject+"_"+questionObject.counter;
    resultObject = {};
    resultObject['Number']=questionObject.counter + 1;
    resultObject['Question']=questionObject.question;
    resultObject['Your Answer']=user_selection;
    resultObject['Correct Answer']=questionObject.answer;
    if(resultObject['Your Answer'] === resultObject['Correct Answer'] ){
        resultObject['Points Earned'] =1;
    }else{
        resultObject['Points Earned'] =0;
    }
    resultArray.push(resultObject);
    //console.log(resultArray);
    this.init();
  }
    var mmss = timeConverter(this.millisec);
    //console.log(mmss);
    var mmssArray = mmss.split(":");
    this.s = mmssArray[1].trim();
    this.m = mmssArray[0].trim();
    //console.log("seconds:" +this.s + "minutes:"+this.m);
    $("#displayTimer > span").html("Timer : "+ this.m + ":" +this.s);
    if(this.s<10){
      this.s= "" + this.s;
    }
    var self = this;
    setTimeout(function(){
        self.start2mintimer();
    },500);
  },

 display:function(){
  
  $("#question").html("Q-" + (this.counter+1) + " : " + this.question);  
  $("#opt1").next().text(this.options[0]);
  $("#opt2").next().text(this.options[1]);
  $("#opt3").next().text(this.options[2]);
  $("#opt4").next().text(this.options[3]);
  $("input:radio").attr("checked", false);
  $("input:radio").removeAttr("checked");
  $("input:radio").prop("checked", false);
  $("input:radio").removeProp("checked");
  this.start2mintimer();

 }

};

/**********************************************Result Array*****************************************************************/
var resultArray = [];

/***********************************************End of Result Array********************************************************/

/***********************************************Button events*****************************************************************/

/***************************************************** START THE QUIZ *********************************************************************/
	
$("#getStarted").click(function(event) {
   //console.log("getStarted clicked");
   $(this).css("visibility", "hidden");
   $(".form-horizontal").css("visibility","visible");
   questionObject.init();
   setInterval(isCounterMaxOut,1000);
});

/******************************************************************************************************************************************/

/****************************************************more_trivia button event**********************************************************/
$('body').on('click','#more_trivia',function(){
   console.log("more_trivia clicked");
   resultArray = [];
   //$("#resultsHere").css("display", "none");
   $("#nextBtn").prop('disabled', false);
   $(".form-horizontal").css("visibility","visible");
   $("#questionForm").css('display','initial');
   console.log(token);
   
   if(token === ""){
     generateToken();
     loadData();
   }else{
    
     loadData();
   }
   questionObject.counter = -1;
   questionObject.init();
   setInterval(isCounterMaxOut,1000);
   $("#resultsHere").empty();
});

/****************************************************reset button event***************************************************************/
$('body').on('click','#reset',function(){
   //console.log("reset clicked");
   $("#resultsHere").css("display", "none");
   location.reload();
});

/********************************************************Shuffle the contents of options array****************************************************/
/**
 * Shuffle the array.
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
/*******************************************************End of shuffling the options array content*******************************************************/

/**
create an event to poll on user clicking the Next button to move on to next quiz question
*/
  
$("#nextBtn").click(function(){
    //console.log("next button clicked");
    var nextButtonClickedEvent = new Event("nextBtnClicked");
    document.body.dispatchEvent(nextButtonClickedEvent);
  });
  
  var isNextInvoked = function(){
   //// console.log("again next button clicked");
    var user_selection = $("input:radio:checked").next().text();
   // console.log("user_selection: "+ user_selection);
    var resultObject = resultObject+"_"+questionObject.counter;
    resultObject = {};
    resultObject['Number']=questionObject.counter + 1;
    resultObject['Question']=questionObject.question;
    resultObject['Your Answer']=user_selection;
    resultObject['Correct Answer']=questionObject.answer;
    if(resultObject['Your Answer'] === resultObject['Correct Answer'] ){
      resultObject['Points Earned'] =1;
    }else{
      resultObject['Points Earned'] =0;
    }
    resultArray.push(resultObject);
    //console.log(resultArray);
    questionObject.init();
    //questionObject.isNextClicked = true;
  };
  
  document.body.addEventListener("nextBtnClicked",isNextInvoked, false);
/********************event ends*****************************************************************************************************************************************/
/**
create an event to poll on question counter if it has reached it's maximum of 10 questions
*/
  
var isCounterMaxOut = function(){
    if(questionObject.counter>=10){
       var counterMaxEvent = new Event("counterMaxOut");
       document.body.dispatchEvent(counterMaxEvent);
       questionObject.counter =-1;
    }

  };
  
  var quizOver = function(){
   // console.log("quiz is over");
    $("#nextBtn").prop('disabled', true);
    $("#questionForm").css('display','none');
    var tbl = resultTable();
    //console.log(tbl);
    $("#resultsHere").append(tbl);
    //Add a button to go to next set of questions else reset to start again
    var rowDiv = $("<div class=\"row\"></div>");
    var colDiv1 = $("<div class=\"col-2-sm\"></div>");
    var colDiv2 = $("<div class=\"col-2-sm\"></div>");
    var more_trivia = $("<button id = \"more_trivia\">MORE TRIVIA</button>");
    more_trivia.addClass("btn").addClass("btn-primary");
    colDiv1.html(more_trivia);
    colDiv1.appendTo(rowDiv);
    var reset = $("<button id = \"reset\">RESET</button>");
    reset.addClass("btn").addClass("btn-primary");
    colDiv2.html(reset);
    colDiv2.appendTo(rowDiv);
    $("#resultsHere").append(rowDiv);
    $("#resultsHere").css("display", "");

   // $(".container").append(rowDiv);
    /*resultDiv.dialog({
      width: 600,
      minHeight: 280,
      modal:true,
      title:"Review Your Answers",
      close:function(){
         //console.log("getStarted clicked");
         //$(this).dialog('close');
         //$("#getStarted").css("visibility", "visible");
        // $(".form-horizontal").css("visibility","hidden");
         location.reload(); 

      }
    });*/
   
  };
  
  document.body.addEventListener("counterMaxOut",quizOver, false);
/********************event ends*****************************************************************************************************************************************/
/**
create a dynamic result table in jquery using html5
*/

var resultTable=  function(){
     
     /*

      //example result object

      var example_obj = {
        "Number" :0,
        "Question":"",
        "Your Answer":"",
        "Correct Answer":"",
        "Score":0
      };
      

      //Create a HTML Table element.
        var table = $("<table id = \"resultTbl\"></table>");
        //table[0].attr("id", "resultTbl"); 
        table[0].border = "1";
        
        //Get the count of columns.
        var columnCount = Object.keys(example_obj).length;
 
        //Add the header row.
        var row = $(table[0].insertRow(-1));
        for (var i = 0; i < columnCount; i++) {
            var headerCell = $("<th />");
            headerCell.html( Object.keys(example_obj));
            row.append(headerCell);
        }
 
        //Add the data rows.
        for (var i = 0; i < resultArray.length; i++) {
            row = $(table[0].insertRow(-1));
            var values = Object.values(resultArray[i]);
            console.log(values);
            for (var j = 0; j < columnCount; j++) {
                var cell = $("<td />");
                cell.html(values[j]);
                row.append(cell);
            }
        }

         return table;

  */
  var tblHeaderVal = ["#","Question","Your Answer","Correct Answer","Score"];
  var wrapper = $("<div></div>");
  var headerDiv = $("<div class = \"row\"></div>");
      headerDiv.attr("id" , "headerDiv");

      for(var k=0;k<5;k++){
       var colDiv = $("<div class = \"col-sm-2\"></div>");
       colDiv.attr("id" , "headercol-"+k); 
       colDiv.html(tblHeaderVal[k]);
       colDiv.appendTo(headerDiv);
      }

      headerDiv.appendTo(wrapper);


  for(var i=0;i<resultArray.length;i++){

    var rowDiv = $("<div class = \"row\"></div>");
    rowDiv.attr("id" , "row-"+i);

    var values = Object.values(resultArray[i]);
    console.log(values);

    for(var j=0;j<5;j++){
       var colDiv = $("<div class = \"col-sm-2\"></div>");
       colDiv.attr("id" , "col-"+i+j); 
       console.log(values[j]);
       colDiv.html(values[j]);
       colDiv.appendTo(rowDiv);
    }
   
    rowDiv.appendTo(wrapper);
    
  }


return wrapper;


   
  

};

/**************************************resultTable completed****************************************************************************************/
/***************************************************************************************************************************************************
Save the user choice radio button selection text saved to result object
***************************************************************************************************************************************************/
$("input:radio").click(function() {
  
  var user_selection = $(this).next().text();
  //console.log("user_selection: "+ user_selection);
 
});


/**********************************display timer function**************************************/

var stopwatch_count = function(){
       questionObject.display_time_seconds = questionObject.display_time_seconds -1;
       questionObject.display_time = timeConverter(questionObject.display_time_seconds);
       if(questionObject.display_time_seconds <=0){
        var user_selection = $("input:radio:checked").next().text();
        //console.log("user_selection: "+ user_selection);
        resultObject['Number']=questionObject.counter + 1;
        resultObject['Question']=questionObject.question;
        resultObject['Your Answer']=user_selection;
        resultObject['Correct Answer']=questionObject.answer;
        if(resultObject['Your Answer'] === resultObject['Correct Answer'] ){
            resultObject['Points Earned'] =1;
        }else{
            resultObject['Points Earned'] =0;
        }
        resultArray.push(resultObject);
        //console.log(resultArray);
        questionObject.init();
       }
};

/*************************end of saving user selection to result object**************************************************************************/
/*********************************************************************************************************************************************/
   
  var timeConverter = function(millis) {
  //console.log(millis);
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


});

