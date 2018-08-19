
//변수
let worddb = [];
let continueinfo = false;
let data = {};
let data_init = {
    wordnow:[],
    level:"1",//레벨
    number:"1",//번호
    progress:"1",//진행도
    meaning:"start",//뜻출력 여부
    random:"off",//랜덤여부
    auto:"off",//자동여부
    sound:"off",//소리 출력 여부
    soundspeed:"1",//소리 속도
    nextdelay:"300"//대기시간
}

//함수
function voice(str, lang) {
    if (str === "$stop") {
        window.speechSynthesis.cancel();
    } else {
        let msg = new SpeechSynthesisUtterance(str);
            switch (lang) {
                case "english":
                    msg.lang = "en-US";
                    msg.rate = 0.5;//향후 조절
                    break;
                case "korean":
                    msg.lang = "ko-KR";
                    msg.rate = 1;//향후 조절
                    break;
            }
        window.speechSynthesis.cancel();
        voices = window.speechSynthesis.speak(msg);
        window.speechSynthesis.resume();
    }
}

//화면 조작
function window_clear() {
    $$(".frame").forEach(function(frame) {
        frame.classList.remove("show");
    })
}
function window_shift(target) {
    //화면 조작
    switch (target) {
        case "init":
            //화면 띄우기
            window_clear();
            $("#frame_init").classList.add("show");
            //시작 버튼
            $("#init_start").onclick = function() {
                //전체화면
                toggleFullScreen();
                //로딩 실시
                window_shift("loading");
            }

            break;
        case "loading":
            //버튼 변경
            $("#init_start").innerHTML = "로딩 중";
            $("#init_start").classList.add("disabled");
            //단어장 불러오기
            fetch("./js/wordlist.json")
            .then(function(response) {
                return response.json();
            })
            .then(function(words) {
                //DB에 입력
                words.forEach(function(x) {worddb.push(x);})
                //메인 출력
                window_shift("main");
            })
            break;
        case "main":
            //화면 띄우기
            window_clear();
            $("#frame_main").classList.add("show");
            //이어하기 정보
            //버튼 클릭
            $("#main_new").onclick = function() {
                //설정창 출력
                window_shift("config_1");
            }

            break;
        case "config_1":
            //화면 띄우기
            window_clear();
            $("#frame_config_1").classList.add("show");
            //초기치 설정

            //설정 변경

            //버튼 클릭
            $("#config_1_cancel").onclick = function() {
                window_shift("main");
            }
            $("#config_1_next").onclick = function() {
                window_shift("config_2");
            }

            break;
        case "config_2":
            //화면 띄우기
            window_clear();
            $("#frame_config_2").classList.add("show");
            //초기치 설정

            //설정 변경

            //버튼 클릭
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
            //화면 띄우기
            window_clear();
            $("#frame_config_3").classList.add("show");
            //초기치 설정

            //설정 변경

            //버튼 클릭
            $("#config_3_cancel").onclick = function() {
                window_shift("main");
            }
            $("#config_3_back").onclick = function() {
                window_shift("config_2");
            }
            $("#config_3_next").onclick = function() {
                window_shift("loading2");
            }

            break;
        case "loading2":
            //화면 띄우기
            window_clear();
            $("#frame_loading2").classList.add("show");
            //잠시 후 이동
            setTimeout(function() {
                window_shift("word");
            }, 1500)

            break;
        case "word":
            //화면 띄우기
            window_clear();
            $("#frame_word").classList.add("show");
            //초기치 설정

            //화면 클릭
            $("#word_word").onclick = function() {
                voice($("#word_word").innerHTML, "english");//향후 개선
            }
            $("#word_meaning").onclick = function() {
                voice($("#word_meaning").innerHTML, "korean");//향후 개선
            }
            //버튼 클릭
            $("#word_exit").onclick = function() {
                voice("$stop");
                window_shift("main");
            }

            break;
    }
}

//시작
document.addEventListener("DOMContentLoaded", function(e) {
    window_shift("init");
})
