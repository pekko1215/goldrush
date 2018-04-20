
function rand(m) {
    return Math.floor(Math.random() * m);
}

var control = {
	reel:{
		speed:37,
		slipspeed:37,
		margin:0
	},
	minbet:1,
	wait:0,
	code:[
		"はずれ",
		"リプレイ",
		"共通中断ベル",
		"共通6枚ベル",
		"押し順ベル1",
		"押し順ベル2",
        "押し順ベル3",
        "押し順ベル4",
		"スイカ",
		"チェリー",
		"ボーナス",
		"GOLD",
		"チャンス目1",
		"チャンス目2",
		"4枚ベル1",
		"4枚ベル2",
		"ボーナス中制御"
		],
	maxpay:[15,15,15]
}
