
// 변수
let worddb = [];
let wordarr = [];
let continueinfo = false;
let data = {};// 저장
let data_default = {
  level: 1,// 레벨
  position: 1,// 번호
  progress: 1,// 진행도
  premeaning: 0,// 뜻 미리출력
  random: 0,// 랜덤여부
  auto: 1,// 자동여부
  sound: 1,// 소리 출력 여부
  soundspeed: 50,// 소리 속도(*0.01로 적용)
  meaningdelay: 0.1,// 뜻 출력 대기시간
  nextdelay: 0.1// 다음 단어 대기시간(*1000으로 적용)
}
let data_config = {
  premeaning: ["X","O"],// [0, 1]
  random: ["X","O"],// [0, 1]
  auto: ["X","O"],// [0, 1]
  sound: ["X","O"],// [0, 1]
  soundspeed: [10,10,150],// [Min, Step, Max]
  meaningdelay: [0.1,0.1,10],// [Min, Step, Max]
  nextdelay: [0.1,0.1,10]// [Min, Step, Max]
}
let data_pre = {
  position: "#"
}
let data_unit = {
  soundspeed: "%",
  meaningdelay: "초",
  nextdelay: "초"
}
let state = "";
let playing = "";
let auto = {
  voice: '',
  word: '',
  meaning: ''
}

// 함수
/*
function voice(str, lang) {
  return new Promise(function (resolve) {
    // str === $stop :  출력 취소
    if (str === "$stop") {
      data_step = -1;
      console.log(data_step);
      console.log(data.progress);
      window.speechSynthesis.cancel();
    // 나머지:  해당 문장 출력
    } else {
      let markedstr = `<?xml version="1.0"?>
       <speak version="1.1"
       xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis11/synthesis.xsd"
       xml:lang="en-US">` + str + "<mark name='finished'/>. fine.</speak>";
       console.log(markedstr);
      let msg = new SpeechSynthesisUtterance(markedstr);
      msg.pitch = 2;
      msg.rate = data.soundspeed / 100;
      switch (lang) {
        case "english":
          msg.lang = "en-US";
          break;
        case "korean":
          msg.lang = "ko-KR";
          break;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
      window.speechSynthesis.resume();
      msg.onmark = ((event) => {
        resolve();
      })
    }
  })
}
*/
function voice (str, lang) {
  return new Promise(function (resolve) {
    // str === $stop :  출력 취소
    if (str === "$stop") {
      responsiveVoice.cancel();
    // 나머지:  해당 문장 출력
    } else {
      let actor = "";
      let speed = 0;
      let volumeNum = (data.sound === 1) ? 1 : 0;
      switch (lang) {
        case "english":
          actor = "US English Female";
          speed = data.soundspeed / 100;
          break;
        case "korean":
          actor = "Korean Female";
          speed = 1;
          break;
      }
      responsiveVoice.speak(str, actor, {
        pitch: 1,
        rate: speed,
        volume: volumeNum,
        onend: (() => {
          resolve();
        })
      });
    }
  })
}

// 화면 조작
function window_clear () {
  $$(".frame").forEach(function(frame) {
    frame.classList.remove("show");
  })
}
function window_shift(target, cmd) {
  // 화면 조작
  switch (target) {
    case "init":
      // 화면 띄우기
      window_clear();
      $("#frame_init").classList.add("show");
      // 시작 버튼
      $("#init_start").onclick = function() {
        // 전체화면
        toggleFullScreen();
        // 버튼 변경
        $("#init_start").innerHTML = "로딩 중";
        $("#init_start").classList.add("disabled");
        // 단어장 불러오기
        fetch("./js/wordlist.json")
        .then(function(response) {
          return response.json();
        })
        .then(function(words) {
          // DB에 입력
          words.forEach(function(x) {worddb.push(x);})
          // 메인 출력
          window_shift("main");
        })
      }

      break;
    case "main":
      // 화면 띄우기
      window_clear();
      $("#frame_main").classList.add("show");
      // 이어하기 정보
      localforage.getItem("gongword_data")
      .then(function(loaded) {
        if (loaded === null) {
          // 정보없음 출력
          $("#main_right_info").classList.remove("show");
          $("#main_right_noinfo").classList.add("show");
          $("#main_continue").classList.add("disabled");
        } else {
          // 이어하기 정보 출력
          $("#main_right_info").classList.add("show");
          $("#main_right_noinfo").classList.remove("show");
          $("#main_continue").classList.remove("disabled");
          // 세부 정보 출력
          Object.keys(loaded).forEach((key)  => {
            let value = loaded[key];
            if (data_config[key] && data_config[key].length === 2) {
              value = data_config[key][loaded[key]];
            }
            if (value === "all") value = "전체";
            if (data_pre[key]) value = data_pre[key] + value;
            if (data_unit[key]) value += data_unit[key];
            $("#main_right_" + key + "_data").innerHTML = value;
          })
        }
      })
      // 버튼 클릭
      $("#main_continue").onclick = function() {
        // data 초기치 설정
        localforage.getItem("gongword_data")
        .then(function(loaded) {
          if (loaded === null) {
            // 기존 설정 없음
            data = deepCopy(data_default);
          } else {
            // 기존 설정 있음
            data = deepCopy(loaded);
          }
          // 설정창 출력
          window_shift("loading", "continue");
        })
      }
      $("#main_new").onclick = function() {
        // data 초기치 설정
        localforage.getItem("gongword_data")
        .then(function(loaded) {
          if (loaded === null) {
            // 기존 설정 없음
            data = deepCopy(data_default);
          } else {
            // 기존 설정 있음
            data = deepCopy(loaded);
          }
          //진행도 초기화
          data.progress = 1;

          // 설정창 출력
          window_shift("config_1");
        })
      }

      break;
    case "config_1":
      // 화면 띄우기
      window_clear();
      $("#frame_config_1").classList.add("show");

      // 설정 출력
      $$(".config_1_level_button").forEach(function (x) {
        x.classList.remove("selected");
      })
      $("#config_1_level_" + data.level).classList.add("selected");

      // 설정 변경
      //   1. 레벨
      $$(".config_1_level_button").forEach(function (x) {
        x.onclick = function () {
          // 스타일 변경
          $$(".config_1_level_button").forEach(function (y) {
            y.classList.remove("selected");
          })
          x.classList.add("selected");
          // 데이터 변경
          data.level = parseInt(x.dataset.value) || x.dataset.value;
        }
      })
      //   2. 시작위치
      $("#config_1_position_input").onclick = (() => {
        $("#config_1_position_input").select();
      })
      $("#config_1_position_input").onkeyup = (() => {
        let elmt = $("#config_1_position_input");
        if (elmt.value.length > 1) {
          data.progress = parseInt(elmt.value) || elmt.value;
        } else {
          data.progress = 1;
        }
      })

      // 버튼 클릭
      $("#config_1_cancel").onclick = function() {
        window_shift("main");
      }
      $("#config_1_next").onclick = function() {
        // 설정 검사
        if (!isNumber(data.progress)) {
          alert("시작 위치에는 숫자를 입력해주세요.");
          $("#config_1_position_input").select();
          return false();
        }
        // 진행
        window_shift("config_2");
      }

      break;
    case "config_2":
      // 화면 띄우기
      window_clear();
      $("#frame_config_2").classList.add("show");

      // 설정 출력
      $$(".config_2_showvalue").forEach(function (x) {
        let type = x.dataset.type;
        x.innerHTML = data_config[type][data[type]];
      })
      // 설정 변경
      $$(".config_2_toggle").forEach(function (x) {
        x.onclick = (() => {
          let type = x.dataset.type;
          let toInput = (data[type] + 1) % 2;
          $("#config_2_showvalue_" + type).innerHTML = data_config[type][toInput];
          data[type] = toInput;
        })
      })

      // 버튼 클릭
      $("#config_2_cancel").onclick = function() {
        window_shift("main");
      }
      $("#config_2_back").onclick = function() {
        window_shift("config_1");
      }
      $("#config_2_next").onclick = function() {
        window_shift("config_3");
      }

      break;
    case "config_3":
      // 화면 띄우기
      window_clear();
      $("#frame_config_3").classList.add("show");

      // 설정 출력
      $$(".config_3_showvalue").forEach((x) => {
        let type = x.dataset.type;
        x.innerHTML = data[type] + data_unit[type];
      })

      // 설정 변경
      $$(".config_3_toggle").forEach((x) => {
        x.onclick = (() => {
          let type = x.dataset.type;
          let toInput = 0;
          switch (x.dataset.toggle) {
            case "up":
              toInput = parseFloat(Math.min(data[type] + data_config[type][1], data_config[type][2]).toFixed(1));
              break;
            case "down":
              toInput = parseFloat(Math.max(data[type] - data_config[type][1], data_config[type][0]).toFixed(1));
              break;
          }
          $("#config_3_showvalue_" + type).innerHTML = toInput.toString() + data_unit[type];
          data[type] = toInput;
        })
      })

      // 버튼 클릭
      $("#config_3_cancel").onclick = function() {
        window_shift("main");
      }
      $("#config_3_back").onclick = function() {
        window_shift("config_2");
      }
      $("#config_3_next").onclick = function() {
        // 저장
        localforage.setItem("gongword_data", data)
        .then(function () {
          // 로딩 실시
          window_shift("loading", "new");
        })
      }

      break;
    case "loading":
      // 화면 띄우기
      window_clear();
      $("#frame_loading").classList.add("show");
      // 단어집 정리
      //   이어하기 - 단어장 불러오기
      if (cmd === "continue") {
        localforage.getItem("gongword_word")
        .then((loaded) => {
          wordarr = deepCopy(loaded);
          // 잠시 후 이동
          setTimeout(function() {
            window_shift("word");
          }, 1500)
        })
      //   새로시작 - 단어장 생성, 저장
      } else if (cmd === "new") {
        //레벨 확인
        let temparr = [];
        worddb.forEach((word) => {
          if (data.level === "all" ||
              word.level === data.level) {
            temparr.push(word);
          }
        })
        //랜덤 적용여부
        if (data.random === 1) {
          wordarr = deepCopy(shuffle(temparr));
        } else {
          wordarr = deepCopy(temparr);
        }
        //단어 저장
        localforage.setItem("gongword_word", wordarr)
        .then(() => {
          // 잠시 후 이동
          setTimeout(function() {
            window_shift("word");
          }, 1000)
        })
      }

      break;
    case "word":
      // 화면 띄우기
      window_clear();
      $("#frame_word").classList.add("show");

      // 화면 구성
      wordStep("setup");

      break;
  }
}

// 단어장 구성
let wordStep = function (cmd, arg) {
  switch (cmd) {
    // 설치, 단어, 뜻
    case "setup":
      // "진행중" 표기
      state = "processing";
      playing = "playing";
      // 레벨
      let level = data.level.toString();
      if (level === "all") level = "전체";
      else level = "Lv." + level;
      $("#word_level").innerHTML = level;
      // 단어 번호
      let numberWord = (data.level === "all") ? wordarr[data.progress - 1].global : wordarr[data.progress - 1].local;
      $("#word_position").innerHTML = "#" + thousand(numberWord);
      // (현 단어 번호 기억)
      data.position = numberWord;
      // 진행도
      let progressWord = thousand(data.progress) + " / " + thousand(wordarr.length);
      $("#word_progress").innerHTML = progressWord;
      // (진행도에 따른) 이전/다음 버튼 변경
      if (data.progress === 1) {
        $("#word_back").classList.add("disabled");
        $("#word_next").classList.remove("disabled");
      } else if (data.progress === wordarr.length) {
        $("#word_back").classList.remove("disabled");
        $("#word_next").classList.add("disabled");
      } else {
        $("#word_back").classList.remove("disabled");
        $("#word_next").classList.remove("disabled");
      }
      // (자동여부에 따른) 자동/수동 버튼 변경
      if (data.auto === 1) {
        $("#word_auto").innerHTML = "자동";
      } else if (data.auto === 0) {
        $("#word_auto").innerHTML = "수동";
      }
      // (재생중 여부에 따른) 토글 버튼 변경
      if (playing === "playing") {
        $("#word_toggle").classList.add("pause");
        $("#word_toggle").classList.remove("play");
      } else {
        $("#word_toggle").classList.remove("pause");
        $("#word_toggle").classList.add("play");
      }
      // 현 상황 저장
      localforage.setItem("gongword_data", data)
      .then(() => {
        //단어 출력
        wordStep("word");
      })

      //버튼 클릭
      $("#word_exit").onclick = (() => {
        wordStep("exit");
      })
      $("#word_auto").onclick = (() => {
        wordStep("auto");
      })
      $("#word_back").onclick = (() => {
        wordStep("back");
      })
      $("#word_next").onclick = (() => {
        wordStep("next");
      })
      $("#word_toggle").onclick = (() => {
        wordStep("toggle");
      })
      break;

    case "word":
      // 단어, 뜻 표기
      let word = wordarr[data.progress - 1].word;
      $("#word_word").innerHTML = word;
      let meaning = wordarr[data.progress - 1].meaning;
      $("#word_meaning").innerHTML = meaning;
      // 단어, 뜻 스크롤
      $("#word_word").scrollTop = 0;
      $("#word_meaning").scrollTop = 0;
      // 단어 강조, 뜻 비강조
      $("#word_word").classList.add("focus");
      $("#word_meaning").classList.remove("focus", "pre");
      //   "뜻 미리 출력이면 보여는 주기"
      if (data.premeaning === 1)
        $("#word_meaning").classList.add("pre");
      // 오타 체크
      $("#word_word").removeAttribute('readonly');
      $("#word_word").select();
      $("#word_word").blur();
      $("#word_word").setAttribute('readonly', 'true');

      // 음성 출력
      voice(word, "english")
      .then(() => {
        //정해진 대기시간 뒤 뜻 출력
        wordStep("timeout", "word");
      })

      break;
    case "meaning":
      // 단어, 뜻 표기
      let word2 = wordarr[data.progress - 1].word;
      $("#word_word").innerHTML = word2;
      let meaning2 = wordarr[data.progress - 1].meaning;
      $("#word_meaning").innerHTML = meaning2;
      // 단어, 뜻 스크롤
      $("#word_word").scrollTop = 0;
      $("#word_meaning").scrollTop = 0;
      // 단어 강조, 뜻 비강조
      $("#word_word").classList.remove("focus");
      $("#word_meaning").classList.remove("pre");
      $("#word_meaning").classList.add("focus");
      // 오타 체크
      $("#word_word").removeAttribute('readonly');
      $("#word_word").select();
      $("#word_word").blur();
      $("#word_word").setAttribute('readonly', 'true');

      // 음성 출력
      voice(meaning2, "korean")
      .then(() => {
        // '종료' 상태 선언
        state = "end";
        // '자동이라면' 정해진 대기시간 뒤 뜻 출력
        if (data.auto === 1) {
          wordStep("timeout", "meaning");
        }
      })

      break;
    // 앞, 뒤 이동, 종료
    case "back":
      // 단계 낮추기
      data.progress -= 1;
      // 음성 중단
      voice("$stop");
      clearTimeout(auto.word);
      clearTimeout(auto.meaning);
      // 단어 이동
      wordStep("setup");

      break;
    case "next":
      // 단계 높이기
      data.progress += 1;
      // 음성 중단
      voice("$stop")
      clearTimeout(auto.word);
      clearTimeout(auto.meaning);
      // 단어 이동
      wordStep("setup");

      break;
    case "exit":
      // 음성, 자동진행 중단
      voice("$stop");
      clearTimeout(auto.word);
      clearTimeout(auto.meaning);
      // 처음으로 이동
      window_shift("main");

      break;

    // 자동/수동, 재생/정지
    case "auto":
      data.auto = (data.auto + 1) % 2;
      // 문구 변경
      if (data.auto === 1) {
        $("#word_auto").innerHTML = "자동";
      } else if (data.auto === 0) {
        $("#word_auto").innerHTML = "수동";
      }
      // 설정 저장
      localforage.setItem("gongword_data", data)
      .then(() => {
        // 정지 상태에서 '자동'이면 대기시간 이후 다음 단어 실행
        if (data.auto === 1 && state === "end") {
          wordStep("timeout", "meaning");
        }
      })

      break;
    case "toggle":
      if (playing === "playing") {
        // 정보 변경
        playing = "";
        // 출력 변경
        $("#word_toggle").classList.remove("pause");
        $("#word_toggle").classList.add("play");
        //정지
        voice("$stop");
        clearTimeout(auto.word);
        clearTimeout(auto.meaning);
      } else {
        // 정보 변경
        playing = "playing";
        // 출력 변경
        $("#word_toggle").classList.add("pause");
        $("#word_toggle").classList.remove("play");
        // 다시 실행
        wordStep("setup");
      }

      break;

    //이동 예약
    case "timeout":
      switch (arg) {
        case "word":
          auto.word = setTimeout(() => {
            wordStep("meaning");
          }, data.meaningdelay * 1000)

          break;
        case "meaning":
          auto.meaning = setTimeout(() => {
            wordStep("next");
          }, data.nextdelay * 1000)

          break;
      }

      break;
    // 단어 이동
    case "moveTo":
      break;
  }
}

// 시작
document.addEventListener("DOMContentLoaded", function(e) {
  //로컬저장소 드라이버 설정
  localforage.config({
      name:"gongword"
  })
  window_shift("init");
})
