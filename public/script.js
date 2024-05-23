var backNumber = [];
var countNumber = [];
var allNumbers = [];
var clueUsed = false;
var interval;
var timeRemaining;
var timeLimit = 60;

if (!localStorage.getItem("stateOfBegin")) {
  localStorage.setItem("stateOfBegin", "false");
}

var stateOfBegin = localStorage.getItem("stateOfBegin");

function ready() {
  localStorage.setItem("stateOfBegin", "true");
}

$(window).on("load", function () {
  var timeBar = $("#time-bar");
  var timeRemainingText = $("#time-remaining");
  timeRemaining = timeLimit;

  function startTimer() {
    interval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    timeRemaining--;
    var percentage = (timeRemaining / timeLimit) * 100;
    timeBar.css("width", percentage + "%");
    timeRemainingText.text(timeRemaining + "s");

    if (percentage > 50) {
      timeBar.css("background-color", "#4caf50");
    } else if (percentage > 25) {
      timeBar.css("background-color", "#ffeb3b");
    } else {
      timeBar.css("background-color", "#f44336");
    }

    if (timeRemaining <= 0) {
      clearInterval(interval);
      endGame();
    }
  }

  function pauseTimer() {
    clearInterval(interval);
  }

  function resumeTimer() {
    interval = setInterval(updateTimer, 1000);
  }

  function endGame() {
    $(".game").css("display", "none");
    $(".end").css("display", "flex");
    checkAndUpdateScore();
  }

  function newQuestion() {
    backNumber = [];
    countNumber = [];
    allNumbers = [];
    clueUsed = false;
    $("#resulting").text("");
    $(".numbers").each(function () {
      setNumberStyles($(this));
      $(this).css("opacity", "1");
      $(this).off("click");
      $(this).on("click", numberClickHandler);
    });
  }

  function resetGame() {
    resetScore();
    newQuestion();
    $(".game").css("display", "block");
    $(".explaination").css("display", "none");
    timeRemaining = timeLimit;
    startTimer();
  }

  if (stateOfBegin === "false") {
    $(".buttonBegin").on("click", function () {
      resetGame();
      ready();
    });
  } else {
    resetGame();
  }

  function getRandomNumber() {
    return Math.ceil(Math.random() * 13);
  }

  function getRandomColor() {
    return Math.floor(Math.random() * 256);
  }

  function setNumberStyles(element) {
    var numberToShow = getRandomNumber();
    var colorToShow1 = getRandomColor();
    var colorToShow2 = getRandomColor();
    var colorToShow3 = getRandomColor();

    element.html("<div>" + numberToShow + "</div>");
    element.css(
      "box-shadow",
      "5px 5px 10px rgb(" +
        colorToShow1 +
        "," +
        colorToShow2 +
        "," +
        colorToShow3 +
        ")"
    );
    element.css(
      "color",
      "rgb(" + colorToShow1 + "," + colorToShow2 + "," + colorToShow3 + ")"
    );
    allNumbers.push(numberToShow);
  }

  function isLastCharacterNotNumber() {
    var lastCharacter = $("#resulting").text().split("");
    return (
      isNaN(parseInt(lastCharacter[lastCharacter.length - 1])) &&
      lastCharacter[lastCharacter.length - 1] != ")"
    );
  }

  function numberClickHandler() {
    if (isLastCharacterNotNumber()) {
      var textToAppend = $(this).text();
      $("#resulting").append(" " + textToAppend);
      $(this).css("opacity", "0.3");
      countNumber.push($(this).text());
    }
  }

  $(".numbers").each(function () {
    setNumberStyles($(this));
    $(this).on("click", numberClickHandler);
  });

  $(".operator").each(function () {
    $(this).on("click", function () {
      var lastCharacter = $("#resulting").text().split("");

      if (
        (!isNaN(parseInt(lastCharacter[lastCharacter.length - 1])) &&
          lastCharacter.length <= 40) ||
        lastCharacter[lastCharacter.length - 1] == ")"
      ) {
        var textToAppend = $(this).text();
        $("#resulting").append(" " + textToAppend);
      }
    });
  });

  $(".operatorLeft").each(function () {
    $(this).on("click", function () {
      var lastCharacter = $("#resulting").text().split("");

      if (
        lastCharacter.length <= 40 &&
        isNaN(parseInt(lastCharacter[lastCharacter.length - 1]))
      ) {
        var textToAppend = $(this).text();
        $("#resulting").append(" " + textToAppend);
      }
    });
  });

  $(".operatorRight").each(function () {
    $(this).on("click", function () {
      var lastCharacter = $("#resulting").text().split("");

      if (
        lastCharacter.length <= lastCharacter[lastCharacter.length - 1] !=
        ")"
      ) {
        var textToAppend = $(this).text();
        $("#resulting").append(" " + textToAppend);
      }
    });
  });

  $(".back").on("click", function () {
    var info = $("#resulting").text().split(" ");
    if (info.length > 0) {
      var lastElement = info.pop();
      if (!isNaN(parseInt(lastElement))) {
        backNumber.push(lastElement);
        countNumber.pop();

        $(".numbers").each(function () {
          for (var i = 0; i < backNumber.length; i++) {
            if ($(this).text() === backNumber[i]) {
              $(this).css("opacity", "1");
            }
          }
        });
      }
    }
    $("#resulting").text(info.join(" "));
  });

  $(".numbers").each(function () {
    $(this).on("click", function () {
      var lastCharacter = $("#resulting").text().split("").pop();
      for (var i = 0; i < backNumber.length; i++) {
        if ($(this).text() === backNumber[i] && isLastCharacterNotNumber()) {
          $(this).css("opacity", "0.1");
          backNumber.splice(i, 1);
          var textToAppend = $(this).text();
          $("#resulting").append(" " + textToAppend);
          countNumber.push($(this).text());
        }
      }
    });
  });

  function updateScore(newScore) {
    $.ajax({
      url: "/users/updateScore",
      method: "POST",
      data: { score: newScore },
      success: function () {
        $(".player-score").text("Score: " + newScore);
      },
      error: function (err) {
        console.error("Failed to update score:", err);
      },
    });
  }

  function resetScore() {
    $.ajax({
      url: "/users/resetScore",
      method: "POST",
      success: function () {
        $(".player-score").text("Score: 0");
      },
      error: function (err) {
        console.error("Failed to reset score:", err);
      },
    });
  }

  function checkAndUpdateScore() {
    const currentScore = parseInt($(".player-score").text().split(" ")[1]);
    updateScore(currentScore);
  }

  $(".go").on("click", function () {
    const originalText = $("#resulting").text();

    if (countNumber.length !== 4) {
      $("#resulting").text("All provided number should be used once");
      $("#resulting").css("fontSize", "20px");
      $("#resulting").css("color", "red");
      setTimeout(() => {
        $("#resulting").text(originalText);
        $("#resulting").css("fontSize", "40px");
        $("#resulting").css("color", "black");
      }, 1500);
    } else {
      if (eval($("#resulting").text()) === 24) {
        $("#resulting").text("Correct! Loading next question...");
        $("#resulting").css("fontSize", "20px");
        $("#resulting").css("color", "green");

        if (!clueUsed) {
          const newScore =
            parseInt($(".player-score").text().split(" ")[1]) + 1;
          $(".player-score").text("Score: " + newScore);
        }

        setTimeout(() => {
          newQuestion();
          $("#resulting").css("fontSize", "40px");
          $("#resulting").css("color", "black");
        }, 1500);
      } else {
        $("#resulting").text("Sorry, It's not correct");
        $("#resulting").css("fontSize", "20px");
        $("#resulting").css("color", "red");
        $(".go").css({
          animation: "shiver 0.5s ease-in-out",
        });
        setTimeout(() => {
          $("#resulting").text(originalText);
          $("#resulting").css("fontSize", "40px");
          $("#resulting").css("color", "black");
        }, 1500);
      }
    }
  });

  $(".refresh").on("click", function () {
    newQuestion();
  });

  $(".try").on("click", function () {
    location.reload();
    // localStorage.removeItem("stateOfBegin");
  });

  $(".rule").on("click", function () {
    $(".explaination").css("display", "block");
    $(".game").css("display", "none");
    pauseTimer();
  });

  $(".close-rule").on("click", function () {
    $(".explaination").css("display", "none");
    $(".game").css("display", "block");
    resumeTimer();
  });
});

$(".sendToAPI").on("click", function () {
  var apiUrl = "https://helloacm.com/api/24/";
  const originalText = $("#resulting").text();

  var queryParams = allNumbers
    .map((number, index) => `${String.fromCharCode(97 + index)}=${number}`)
    .join("&");

  var fullApiUrl = `${apiUrl}?${queryParams}`;

  fetch(fullApiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.result.length > 1) {
        clueUsed = true;
        $("#clue").fadeIn(4000);
        $("#clue").text("The Answer is: " + data.result[0]);
        $("#clue").fadeOut(4000);
      } else {
        $("#clue").fadeIn(4000);
        $("#clue").text(
          "It is impossible with these 4 numbers, please refresh"
        );
        $("#clue").fadeOut(4000);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});