// Adrew Miller @ Perfect Sense

$(document).ready(function () {
    var HTML = "";

    var numTeams = 50;

    var teams = new Array();
    for(var i = 0; i < numTeams; i++){
      teams[i] = i + 1;
    }

    totalRounds = Math.ceil(Math.log(numTeams/2) / Math.log(2) + 2) ;
    // HTML += "Total rounds " + totalRounds + "<BR/>";

    var byes = Math.pow(2,Math.ceil(Math.log(numTeams) / Math.log(2))) - numTeams;
    // HTML += "Byes = " + byes + "<BR/>";



    //Seed Modified from jsbin.com
    var seeds = new Array();
    for(var i = 0; i < (numTeams + byes); i++){
      seeds[i] = i;
    }

    var num_rounds = Math.log(seeds.length)/Math.log(2);

    //2-dimensional array, each subarray holds the seeds active in that round, in order of matches played
    //example: seeds in first match of 2nd round are: seed_round[1][0] & seed_round[1][1]
    var seed_rounds=[];

    //creates empty arrays inside seed_round
    for (var i=0;i<num_rounds;i++) {
        seed_rounds[i]=[];
    }
    //assuming no upsets in the bracket, 1st and 2nd seeds should be in the final match
    seed_rounds[num_rounds] = [1,2];

    //for each round in the bracket
    for (var r=num_rounds;r>0;r--) {
        var round=seed_rounds[r];
        var feed_round=seed_rounds[r-1];

        //for each seed in the round, work out the who they defeated in the previous round, storing the resil
        for (var m=0;m<round.length;m++) {

        var num_teams_in_round = round.length*2;
        //feeder match seed A = current match seed "m"
        feed_round[m*2]=round[m];

        //feeder match seed B = # teams in feeder round plus 1 minus current match seed "m"
        feed_round[(m*2)+1]=num_teams_in_round+1-round[m];
        }
    }

    var orderList = seed_rounds[1];
    var matchUp = "[[";
    for(var i = 0; i < orderList.length; i++)
    {
        if(i % 2 == 1){
            matchUp += ",\"";
        }else{
            matchUp += "[\"";
        }

        if(orderList[i] -1 < teams.length){
            matchUp += teams[orderList[i]-1];
        }else{
            matchUp += "bye";
        }

        matchUp += "\"";
        if(i % 2 == 1){
            matchUp += "]";
            if(i != orderList.length -1){
                matchUp += ",";
            }
        }
        //console.log(orderList[i] + " " + teams[i] + " " + teams[orderList[i]-1]);
    }
    matchUp += "]]";
    //console.log(matchUp);
    //console.log(orderList);



   ///Drawing


      //var bracket = jQuery.parseJSON(matchUp);
      
      var bracket = jQuery.parseJSON('[[["A","B"],["C","D"],["D","E"],["F","G"]]]');

      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"],["D","E"],["F","G"]],[["A","B"],["C","D"]],[["B","C"]],[["C"]]]');

      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"],["D","E"],["F","G"]],[["A","B"],["D","G"]]]');
      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"],["D","E"],["F","G"]]]');
      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"],["D","E"],["F","G"]],[["A","B"],["C","D"]],[["B","C"]],[["C"]]]');
      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"]],[["B","C"]],[["C"]]]');
      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"]],[["B","C"]]]');
      //var bracket = jQuery.parseJSON('[[["A","B"],["C","D"]]]');
      var firstRoundGames = -1;
      var currentRound = 0;
      var currentGamesCount = -1;
      var totalRounds = -1;

      

      $.each(bracket, function(i,rounds){
        currentRound++;
        HTML += "<div id='column" + currentRound + "' style='width: 100px;overflow: auto;float: left'>";


        var currentGame = 0;
        $.each(rounds,function(j,games){
            currentGame ++;
            currentGamesCount = rounds.length;
            var spacing = 0;
            if(currentRound == 1){
                firstRoundGames = currentGamesCount;
                totalRounds = Math.log(firstRoundGames) / Math.log(2) + 2 ;
            }else{//Calculate spacing
                spacing = (firstRoundGames / currentGamesCount * (50) / 2) - 12 + "px;";
            }
            HTML += "<div id='r" + currentRound + "g" + currentGame + "' style='width: 50px; height: 48px; margin-top: " + spacing + ";'>";
            
            var teamsInGame = games.length;
            $.each(games,function(k,team){
                if(team != "bye"){
                    if(k == 1){
                        HTML += " vs ";
                    }
                HTML += team;
                }
                
            });
            HTML += "</div>";
        });
        HTML += "</div>";
      });

      //Draw missing brackets
     
      for(var i = currentRound; i < totalRounds; i++){
          
          var spacing = 0;
          currentGamesCount = currentGamesCount /2;
          if(currentGamesCount == 0){
              currentGamesCount = 1; //championship
          }
          HTML += "<div id='column" + (i+1) + "' style='width: 100px;overflow: auto;float: left'>";
          parentIndex = 0;
          var bfirst = true;
          for(var j = currentGamesCount; j > 0; j--){
              //spacing = (firstRoundGames / currentGamesCount * (50) / 2) - 12 + "px;";
              spacing = (firstRoundGames / currentGamesCount * (50) / 2) + "px;";
              
              //50 25 12 6 3 1 ....
              spacing = 0;
              if(i > 0){
                  if(bfirst){
                    bfirst = false;
                    //spacing = (Math.pow((i-1), 2)) * 50 + "px";
                    //800 400 200 100 50 25 
                    //  1   2   4   8 16 32
                    //800     250 150 75 25
                    //spacing = ((firstRoundGames * 50) /2) / Math.pow(2,totalRounds-i-1) - 25 + "px";
                    if(i == totalRounds -1){//Champion
                        spacing = Math.pow(2,i-2) * 50 - 25 + "px";
                    }else{
                        spacing = Math.pow(2,i-1) * 50 - 25 + "px";
                    }
                  }else{
                    //spacing = Math.pow((i-1), 2) * 50 + 50 + "px";
                    //spacing = Math.pow(2,totalRounds-i) * 50 + "px";
                    spacing = (Math.pow(2,i)-1) * 50 + "px";
                  }
              }
              
              
              HTML += "<div id='r" + i + "g" + j + "' style='width: 50px; height: 48px; margin-top: " + spacing + "'>";
              if(i == currentRound){//Show drop down if parent isn't empty'                          
                  var team1 = bracket[i-1][parentIndex][0];
                  var team2 = bracket[i-1][parentIndex][1];
                  var team3 = bracket[i-1][parentIndex+1][0];
                  var team4 = bracket[i-1][parentIndex+1][1];

                  //HTML += "<select><option>" + team1 + "</option><option>" + team2 + "</select>";
                  //HTML += "<select><option>" + team3 + "</option><option>" + team4 + "</select>";
                  HTML += team1 + "<BR/> vs " + team4;
                  //console.log(team1 + " " + team2 + " " + team3 + " " + team4);
                  
              }else{
                  if(i == totalRounds -1){
                      HTML += "Champion";
                  }else{
                      HTML += " Empty ";
                  }
              }
              HTML += "</div>";
              
              
              parentIndex += 2 ;
          }
          HTML += "</div>";
      }

      $("#bracket").html(HTML);

});