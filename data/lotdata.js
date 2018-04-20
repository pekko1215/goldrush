/**
 * Created by pekko1215 on 2017/07/24.
 */
Array.prototype.select = function(key, value) {
    return this.find(function(o) {
        return key in o && o[key] == value
    })
}

var lotdata = Array(6).fill(0).map(function() {
    return {
        normal: [{
                name:"はずれ",
                value:1/2
            }, {
                name: "リプレイ",
                value:  8511/65536
            }, {
                name: "12枚ベル",
                value: 1 / 12
            },{
                name:'スイカ',
                value:1/64
            },{
                name:'チェリー',
                value:1/99
            },{
                name: "BIG",
                value: 1 / 66
            },{
                name:'チャンス目1',
                value:1/128
            },{
                name:'チャンス目2',
                value:1/333
            }
        ],
        "big": [{
            name: "JACIN",
            value: 1 / 4.7
        }],
        "jac": [{
            name: "JACGAME",
            value: 1
        }]
    }
})
var effectTable = {
    "はずれ": [{
        lot: 2,
        nabi: [0]
    }],
    "リプレイ": [{
        lot: 10,
        nabi: [100]
    }, {
        lot: 5,
        nabi: [80, 20]
    }, {
        lot: 1,
        nabi: [50, 50, 50]
    }],
    "ベル1": [{
        lot: 10,
        nabi: [100]
    }, {
        lot: 8,
        nabi: [80, 30]
    }, {
        lot: 2,
        nabi: [30, 80, 30]
    }],
    "ベル2": [],
    "スイカ": [{
        lot: 30,
        nabi: [100]
    }, {
        lot: 10,
        nabi: [80, 30]
    }, {
        lot: 50,
        nabi: [20, 80, 100]
    }],
    "チェリー": [{
        lot: 10,
        nabi: [100]
    }, {
        lot: 10,
        nabi: [80, 30]
    }, {
        lot: 20,
        nabi: [100, 80, 10]
    }]
}

var effectColorTable = {
    "はずれ": 0xaaaaaa,
    "リプレイ": 0x6666aa,
    "ベル1": 0xffc90e,
    "ベル2": 0xffc90e,
    "スイカ": 0x1b8e3d,
    "チェリー": 0xeb2832
}