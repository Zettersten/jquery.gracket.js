var image_directory = "http://www.crowsdarts.com/brackets/";

function GeneratePlayoffs(TeamCountString) {
    var TeamSet = new Array();
    var GameSet = new Array();
    var MaxLevel = 1;
    var TeamCount = parseInt(document.forms[0].TeamCount.value)
    var OldTeam;
    var nextGame = 1;
    var Parent = new Array(4);
    var ParentNum;
    TeamSet[1] = 1;

    if (TeamCount < 2) {
        alert("You cannot have playoffs without at least two teams.");
        return false;
    }

    MaxLevel++;

    var HalfCount = 3;

    for (var ThisTeam = 2; ThisTeam <= TeamCount; ThisTeam++) {

        if (ThisTeam == HalfCount) {
            HalfCount = (2 * HalfCount) - 1;
            MaxLevel++;
        }

        OldTeam = HalfCount - ThisTeam;

        if (ThisTeam == 2) {
	
            TeamSet[2] = 1;
            GameSet[1] = newGame(0, 1, 2, true, true);

        } else {
	
            ParentNum = TeamSet[OldTeam];
            Parent = GameSet[ParentNum];

            if (Parent[1] == OldTeam) {
                GameSet[ParentNum] = newGame(Parent[0], nextGame, Parent[2], false, Parent[4]);
            } else {
                GameSet[ParentNum] = newGame(Parent[0], Parent[1], nextGame, Parent[3], false);
            }

            GameSet[nextGame] = newGame(ParentNum, OldTeam, ThisTeam, true, true);
        }

        TeamSet[ThisTeam] = nextGame;
        TeamSet[OldTeam] = nextGame;
        nextGame++;
    }

    var ThisLevel = MaxLevel + 1;
    var LevelStatus = new Array(ThisLevel);
    var doc = document;

    doc.clear();
    doc.writeln("<font size=6><b>Playoff Chart for " + TeamCount + " Teams</b><p>");
    doc.write('<table cellspacing=0 cellpadding=0><tr><td>#</td>');

    for (var x = 0; x <= MaxLevel; x++) {
        LevelStatus[x] = 0;
        if (x > 0) doc.write("<td align=center>Rnd " + x + " </td>");
    }

    doc.writeln("</tr>");
    var Bit = "";
    var GameCount = 0;
    GameCount = sendGame(GameSet, LevelStatus, MaxLevel - 1, 1, TeamCount, GameCount);
    doc.write("</table>");
    doc.close();
}

function sendGame(GameSet, LevelStatus, ThisLevel, OneGame, total, howfar) {

    var GameNum = OneGame;
    var Game = new Array(4);
    Game = GameSet[GameNum];

    if (Game[3]) {
        howfar = sendTeam(Game[1], LevelStatus, GameNum, ThisLevel - 1, total, howfar);
    } else {
        howfar = sendGame(GameSet, LevelStatus, ThisLevel - 1, Game[1], total, howfar);
    }

    howfar = sendTeam(0, LevelStatus, GameNum, ThisLevel, total, howfar);

    if (Game[4]) {
        howfar = sendTeam(Game[2], LevelStatus, GameNum, ThisLevel - 1, total, howfar);
    } else {
        howfar = sendGame(GameSet, LevelStatus, ThisLevel - 1, Game[2], total, howfar);
    }

    return howfar;
}

function newGame(Parent, First, Second, FirstIsTeam, SecondIsTeam) {
    var Game = new Array(4);
    Game[0] = Parent;
    Game[1] = First;
    Game[2] = Second;
    Game[3] = FirstIsTeam;
    Game[4] = SecondIsTeam;
    return Game;
}

function increment(GameStatus) {
    GameStatus++;
    if (GameStatus == 4) GameStatus = 0;
    return GameStatus;
}

function sendTeam(TeamNumber, LevelStatus, GameNum, ThisLevel, total, howfar) {

    var CellStart = "<td>";
    var CellEnd = "</td>";

    var Entries = new Array(4);
    Entries[0] = CellStart + " " + CellEnd;
    Entries[1] = CellStart + '<img src = "' + image_directory + 'top.gif">' + CellEnd;
    Entries[2] = CellStart + '<img src = "' + image_directory + 'mid.gif">' + CellEnd;
    Entries[3] = CellStart + '<img src = "' + image_directory + 'low.gif">' + CellEnd;
    Entries[4] = CellStart + '<img src = "' + image_directory + 'non.gif">' + CellEnd;

    LevelStatus[ThisLevel] = increment(LevelStatus[ThisLevel]);

    if (TeamNumber == 0) {
        var Outline = Entries[0];
    } else {
        howfar++;
        var Outline = CellStart + "<center>" + TeamNumber + "</center>" + CellEnd;
    }

    for (var x = 0; x < LevelStatus.length - 2; x++) {
        if (x == 0 && TeamNumber != 0 && LevelStatus[x] == 0) {
            Outline = Outline + Entries[4];
        } else {
            Outline = Outline + Entries[LevelStatus[x]];
        }
    }

    if (GameNum == 1 && TeamNumber == 0) Outline = Outline + Entries[4];
    document.writeln("<tr>" + Outline + "</tr>");
    LevelStatus[ThisLevel] = increment(LevelStatus[ThisLevel]);

    return howfar;
}