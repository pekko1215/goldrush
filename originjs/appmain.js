controlRerquest("data/test.smr", main)

function main() {
    window.scrollTo(0, 0);
    var notplaypaysound = false;
    var rtmode = 0;
    slotmodule.on("resourceLoaded", function(e) {
        console.log(e)
    })
    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            var targetYaku = e.hityaku[0]
            e.hityaku.forEach((y) => {
                var idx = YakuData.findIndex((d) => {
                    return d.name === y.name;
                })
                var tidx = YakuData.findIndex((d) => {
                    return d.name === targetYaku.name;
                })
                if (tidx < idx) {
                    targetYaku = y;
                }
            })
            var matrix = targetYaku.matrix;
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
                segments.payseg.reset();
            })
            if (e.hityaku[0].name.indexOf("JACIN") != -1 || e.hityaku[0].name.indexOf("1枚役") != -1) {
                notplaypaysound = true;
            } else {
                notplaypaysound = false;
                slotmodule.setFlash(null, 0, function(e) {
                    slotmodule.setFlash(flashdata.default, 20)
                    slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                })
            }
        }
        replayflag = false;
        var nexter = true;
        e.hityaku.forEach(function(d) {
            switch (gamemode) {
                case 'normal':
                    switch (d.name) {
                        case 'BIG':
                            setGamemode('reg');
                            nexter = true;
                            bonusdata = {
                                jacincount: 0,
                                jacgamecount: 7,
                                jacgetcount: 7
                            }
                            bonusflag = "none";
                            break;
                        case "JACIN":
                            setGamemode('reg');
                            nexter = true;
                            bonusdata = {
                                jacincount: 0,
                                jacgamecount: 7,
                                jacgetcount: 7
                            }
                            bonusflag = "none";
                            break;
                        case "リプレイ":
                            replayflag = true;
                            break;
                        case 'ベル':
                        case 'ベル揃い':
                            switch (e.pay) {
                                case 2:
                                    rtmode = 0;
                                    break;
                                case 12:
                                    rtmode = 1;
                                    break;
                            }
                            break;
                    }
                    break;
                case 'big':
                    if (d.name == "リプレイ") {
                        setGamemode('jac');
                        sounder.stopSound("bgm");
                        sounder.playSound("jac" + (4 - bonusdata.jacincount), true);
                        bonusdata.jacincount--;
                        bonusdata.jacgamecount = 8;
                        bonusdata.jacgetcount = 8;
                    }
                    changeBonusSeg()
                    break;
                case 'reg':
                case 'jac':
                    bonusdata.jacgetcount--;
            }
        })
        if (nexter) {
            e.stopend()
        }
    })
    slotmodule.on("leveron", function() {
        if (gamemode == "big") {
            bonusdata.bonusgamecount--;
        }
        if (gamemode == "reg" || gamemode == "jac") {
            bonusdata.jacgamecount--;
        }
    })
    slotmodule.on("payend", function() {
        if (gamemode == "big" && bonusdata.bonusgetcount < 0) {
            setGamemode('normal');
            sounder.stopSound("bgm")
            segments.effectseg.reset();
        }
        if (gamemode == "reg" || gamemode == "jac") {
            if (bonusdata.jacgamecount == 0 || bonusdata.jacgetcount == 0) {
                if (bonusdata.jacincount == 0) {
                    setGamemode('normal');
                    sounder.stopSound("bgm")
                    slotmodule.setLotMode(0)
                    segments.effectseg.reset();
                } else {
                    sounder.stopSound("bgm")
                    setGamemode('big');
                    sounder.playSound("big1", true);
                    slotmodule.setLotMode(1)
                    segments.effectseg.reset();
                }
            }
        }
    })
    slotmodule.on("leveron", function() {})
    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 30)
                } else {
                    e.betend();
                }
            })(e)
        }
    })
    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (gamemode == "big") {
            changeBonusSeg();
        }
        if (!("paycount" in e)) {
            e.paycount = 0
            replayflag || notplaypaysound || (pays > 1 && !isAT && sounder.playSound("pay", true));
        }
        if (pays == 0) {
            if (replayflag) {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                e.payend()
                sounder.stopSound("pay")
                if (e.isPay && !isAT && !notplaypaysound) {
                    sounder.playSound("pay")
                }
            }
        } else {
            e.isPay = true
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if (gamemode != "normal") {
                bonusdata.geted++;
                bonusdata.bonusgetcount--;
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount);
            !isAT && sounder.stopSound('pay')
            replayflag || notplaypaysound || (!isAT && sounder.playSound("pay", true))
            setTimeout(function() {
                arg.callee(e)
            }, 70)
        }
    })
    slotmodule.on("lot", function(e) {
        var ret = -1;
        switch (gamemode) {
            case "normal":
                var lot = normalLotter.lot().name
                lot = window.power || lot;
                window.power = undefined
                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "12枚ベル":
                        ret = "押し順ベル" + (rand(4) + 1);
                        break;
                    case "スイカ":
                        ret = lot
                        break
                    case "チェリー":
                        ret = lot;
                        break;
                    case "BIG":
                        bonusflag = "BIG";
                        ret = "ボーナス";
                        switch (rand(8)) {
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                ret = "チャンス目1"
                                break;
                            case 5:
                                ret = "チェリー";
                                break;
                            case 6:
                                ret = "スイカ";
                                break;
                            case 7:
                                ret = "チャンス目2"
                        }
                        break;
                    case 'はずれ':
                        ret = "はずれ"
                        if (bonusflag == "BIG") {
                            ret = "ボーナス"
                        } else {
                            if (rtmode == 1) {
                                ret = "リプレイ";
                            }
                        }
                        break;
                    default:
                        ret = "4枚ベル" + (rand(2) + 1);
                        if (!rand(16)) {
                            ret = "共通中断ベル"
                        }
                }
                break;
            case "big":
                ret = "BIG子役"
                break
            case "reg":
            case "jac":
                ret = "ボーナス中制御"
                break;
        }
        ret = effect(ret) || ret;
        console.log(ret)
        return ret;
    })
    slotmodule.on("reelstop", function() {
        isAT ? sounder.playSound("stop2") : sounder.playSound("stop")
    })
    $("#saveimg").click(function() {
        SaveDataToImage();
    })
    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })
    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })
    $("#dummyfiler").change(function(e) {
        var file = this.files[0];
        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })
    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 100)
        } else {
            sounder.playSound("start")
        }
        okure = false;
    })
    var okure = false;
    var sounder = new Sounder();
    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/stop2.wav", "stop2").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se");
    sounder.addFile("sound/bet.wav", "3bet").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/pay2.wav", "pay2").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/at1.wav", "at1").addTag("bgm").setVolume(0.2);
    sounder.addFile("sound/big1.wav", "big1").addTag("bgm").setVolume(0.5);
    sounder.addFile("sound/big3.mp3", "big3").addTag("bgm").setVolume(0.5);
    sounder.addFile("sound/handtohand.mp3", "hand").addTag("voice").addTag("se");
    sounder.addFile("sound/gotit.wav", "gotit").addTag("voice").addTag("se");
    sounder.addFile("sound/big1hit.wav", "big1hit").addTag("se");
    sounder.addFile("sound/CT1.mp3", "ct1").addTag("bgm");
    sounder.addFile("sound/ctstart.wav", "ctstart").addTag("se");
    sounder.addFile("sound/yattyare.wav", "yattyare").addTag("voice").addTag("se");
    sounder.addFile("sound/delive.wav", "delive").addTag("voice").addTag("se");
    sounder.addFile("sound/reg1.mp3", "reg1").addTag("bgm");
    sounder.addFile("sound/big2.mp3", "big2").addTag("bgm");
    sounder.addFile("sound/reglot.mp3", "reglot").addTag("se");
    sounder.addFile("sound/bigselect.mp3", "bigselect").addTag("se")
    sounder.addFile("sound/syoto.mp3", "syoto").addTag("se")
    sounder.addFile("sound/kokutise.mp3", "kokutise").addTag("se");
    sounder.addFile("sound/widgetkokuti.mp3", "widgetkokuti").addTag("voice").addTag("se");
    sounder.addFile("sound/jac1.mp3", "jac1").addTag("jac").addTag("bgm");
    sounder.addFile("sound/jac2.mp3", "jac2").addTag("jac").addTag("bgm");
    sounder.addFile("sound/jac3.mp3", "jac3").addTag("jac").addTag("bgm");
    sounder.addFile("sound/yokoku.wav", "yokoku").addTag("se");
    sounder.addFile("sound/fall.wav", "fall").addTag("se")
    sounder.addFile("sound/paka-n.mp3", "paka-n").addTag("se")
    sounder.addFile("sound/seg1.wav", "seg1").addTag("se")
    sounder.addFile("sound/seg2.wav", "seg2").addTag("se")
    sounder.addFile("sound/seg3.wav", "seg3").addTag("se")
    sounder.addFile("sound/athit.wav", "athit").addTag("se")
    sounder.addFile("sound/atstart.wav", "atstart").addTag("se")
    sounder.addFile("sound/bell1.wav", "bell1").addTag("se")
    sounder.addFile("sound/bell2.wav", "bell2").addTag("se")
    sounder.addFile("sound/countup1.wav", "countup1").addTag("se")
    sounder.addFile("sound/countup2.wav", "countup2").addTag("se")
    sounder.addFile("sound/fan1.wav", "fan1").addTag("se")
    sounder.addFile("sound/atend.wav", "atend").addTag("se")
    sounder.addFile("sound/chance.wav", "chance").addTag("se")
    sounder.setVolume("jac", 0.5)
    sounder.loadFile(function() {
        window.sounder = sounder
        sounder.setVolume('se', (50 / 100.) * 0.05);
        sounder.setVolume('bgm', (50 / 100.) * 0.5)
        console.log(sounder)
    })
    var settei = 0;
    var gamemode = "normal";
    var bonusflag = "none"
    var coin = 0;
    var bonusdata;
    var replayflag;
    var isCT = false;
    var isSBIG;
    var ctdata = {};
    var playcount = 0;
    var allplaycount = 0;
    var incoin = 0;
    var outcoin = 0;
    var isAT = false
    var atGame = 0;
    var bonus1game = false;
    var rt = 0;
    var bonuscounter = {
        count: {},
        history: []
    };
    slotmodule.on("leveron", function() {
        if (gamemode != "big") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                registBonus({
                    bonus: gamemode,
                    game: playcount
                })
            }
        }
        changeCredit(0)
    })

    function registBonus(type) {
        bonuscounter.history.push(type)
        if (gamemode in bonuscounter.count) {
            bonuscounter.count[gamemode]++;
        } else {
            bonuscounter.count[gamemode] = 1;
        }
        playcount = 0;
    }

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "セグラッシュ3",
            id: "segrush3"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }
    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }
    window.SaveData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }
    window.LoadData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }
    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;
        SaveData();
        changeCredit(0)
    }
    var setGamemode = function(mode) {
        switch (mode) {
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.once("bet", function() {
                    slotmodule.setLotMode(1)
                    changeBonusSeg()
                });
                slotmodule.setMaxbet(3);
                break;
            case 'reg':
                gamemode = 'reg';
                slotmodule.once("bet", function() {
                    slotmodule.setLotMode(0)
                });
                slotmodule.setMaxbet(3);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.once("bet", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
        }
    }
    var segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 3)
    }
    window.r = segments.effectseg.randomSeg()
    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.creditseg.reset();
    segments.payseg.reset();
    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        switch (gamemode) {
            case "big":
                var tmp = bonusdata.bonusgetcount;
                if (tmp < 0) {
                    tmp = 0
                }
                segments.effectseg.setSegments(tmp);
                break;
            case "reg":
                if (bonusdata.jacgetcount == 0) {
                    return
                }
                segments.effectseg.setSegments("1-" + (bonusdata.jacgetcount + 1));
                break;
            case "jac":
                if (bonusdata.jacgetcount == 0) {
                    return
                }
                segments.effectseg.setSegments("" + (bonusdata.jacincount + 1) + "-" + bonusdata.jacgetcount);
                break;
        }
    }
    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function clearLamp() {
        clearInterval(LampInterval.right);
        clearInterval(LampInterval.left);
        ["left", "right"].forEach(function(i) {
            $("#" + i + "neko").css({
                filter: "brightness(100%)"
            })
        })
    }
    var seghit = false;

    function effect(lot) {}
    slotmodule.on('atend', () => {
        slotmodule.once('payend', () => {
            slotmodule.freeze()
            sounder.stopSound('bgm')
            isAT = false;
            sounder.playSound("atend", false, () => {
                segments.effectseg.setSegments("")
                slotmodule.resume()
            })
            segments.effectseg.setSegments("End")
        })
    })
    $("img").on("touchstart", () => {
        slotmodule.almighty()
    })
    $("#auto").on("click", () => {
        (function(e) {
            $("img").one("touchstart click", function() {
                clearInterval(e)
            })
        })(setInterval(slotmodule.almighty, 100))
    })
    $(window).bind("unload", function() {
        SaveData();
    });
    var query = getUrlVars();
    if ("online" in query && query.online) {
        var data = LoadOnline();
        settei = data.settei - 1;
        data && ("id" in data) && parseSaveData(data);
    } else {
        LoadData();
    }
    window.normalLotter = new Lotter(lotdata[settei].normal);
    window.bigLotter = new Lotter(lotdata[settei].big);
    window.jacLotter = new Lotter(lotdata[settei].jac);
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 79, 46);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}
/**
 * URL解析して、クエリ文字列を返す
 * @returns {Array} クエリ文字列
 */
function getUrlVars() {
    var vars = [],
        max = 0,
        hash = "",
        array = "";
    var url = window.location.search;
    //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
    hash = url.slice(1).split('&');
    max = hash.length;
    for (var i = 0; i < max; i++) {
        array = hash[i].split('='); //keyと値に分割。
        vars.push(array[0]); //末尾にクエリ文字列のkeyを挿入。
        vars[array[0]] = array[1]; //先ほど確保したkeyに、値を代入。
    }
    return vars;
}
/*

 54
 ウ

 66
 イ

 78
 ウ
 */