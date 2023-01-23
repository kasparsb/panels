<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">
    <title>Basic</title>

    <link rel="stylesheet" href="../build/panels.min.css?rand=<?php echo time() ?>" type="text/css">
    <style>
    html, body {
        padding: 0;
        margin: 0;
    }
    body {
        background: green;
    }
    .overlay {
        background: rgba(0, 0, 0, 0.2);
    }
    .modal-panel__bg {
        box-shadow: 0px 0px 8px 2px rgba(0,0,0,0.46);
    }
    .app-w__ {
        background: chartreuse;
    }
    .r {
        background: silver;
        height: 40px;
        padding-top: 12px;
        margin-bottom: 40px;
        font-size: 18px;
        text-align: center;
    }

    .modal-panel .r {
        background: green;
        padding: 10px;
        margin-top: 2px;
        margin-bottom: 0;
        text-align: center;
        color: #fff;
    }
    .modal-panel .r:first-child {
        margin-top: 0;
    }

    .viewer {
        position: absolute;
        box-sizing: border-box;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 4px solid blue;
        background: rgba(252, 19, 3, 0.5);
    }

    .log {
        position: fixed;
        top: 40px;
        left: 90px;
        z-index: 10
    }
    .controls {
        position: fixed;
        left: 10px;
        width: 70px;
        top: 40px;

        z-index: 10
    }
    .controls2 {
        position: fixed;
        left: 84px;
        width: 70px;
        top: 40px;

        z-index: 10
    }

    button {
        margin-top: 8px;
        width: 100%;
        box-sizing: border-box;
        display: block;
        background: none;
        border: none;
        background-color: #28c128;
        padding: 4px 0;
        color: #000;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px

        -webkit-tap-highlight-color: rgba(0,0,0,0);
    }
    button:first-child {
        margin-top: 0;
    }
    button.open {
        background: red
    }

    .modal-panel__header,
    .modal-panel__footer {
        height: 28px;
        background-color: rgba(0,0,0,0.5);
    }
    </style>

</head>
<body>


            <p>Ut pariatur dolor officia id anim nisi dolore sit minim ea et adipisicing mollit in voluptate incididunt laboris veniam ut proident. Aute sunt exercitation consectetur laboris duis ut est commodo elit enim magna dolor ea minim sint in occaecat duis culpa proident consequat labore non dolore ea officia ut veniam veniam voluptate aute deserunt nostrud amet in voluptate sint mollit in dolor do quis incididunt minim dolore consectetur id consectetur laborum duis pariatur commodo do deserunt sint in ad ullamco labore adipisicing duis sed minim proident nostrud cillum ea ut eu ut laboris sed cillum cillum do esse ullamco occaecat aliquip voluptate nostrud eiusmod magna cillum enim sunt laboris esse nulla eu ea eu nisi labore commodo duis ut in laboris aliquip nostrud elit amet dolor in cupidatat ea incididunt nisi sint ea et consequat occaecat sunt eiusmod excepteur duis excepteur tempor mollit non esse dolore amet proident cupidatat enim ex ut consectetur minim excepteur ea nostrud sed enim nulla veniam non est adipisicing dolor nisi ut esse labore laboris proident cillum sint incididunt excepteur quis fugiat reprehenderit do nisi tempor consectetur do laborum veniam minim culpa enim sunt in enim adipisicing voluptate cillum esse ut velit nisi consequat magna deserunt et fugiat ut sed ullamco et in ea nisi id ex qui nisi incididunt veniam officia magna incididunt id veniam ut aliquip minim veniam aliquip velit quis sunt duis in nisi ullamco velit minim eiusmod eiusmod culpa non ut nisi aute pariatur est amet dolor in do duis ut in aliqua velit ullamco nostrud laborum qui quis veniam nisi voluptate reprehenderit aliquip ea quis laborum nostrud sint voluptate aliqua officia irure nostrud irure reprehenderit tempor ut occaecat qui in aute magna est.</p>
            <button name="openminimal">Open minimal</button>
            <p>Ut pariatur dolor officia id anim nisi dolore sit minim ea et adipisicing mollit in voluptate incididunt laboris veniam ut proident. Aute sunt exercitation consectetur laboris duis ut est commodo elit enim magna dolor ea minim sint in occaecat duis culpa proident consequat labore non dolore ea officia ut veniam veniam voluptate aute deserunt nostrud amet in voluptate sint mollit in dolor do quis incididunt minim dolore consectetur id consectetur laborum duis pariatur commodo do deserunt sint in ad ullamco labore adipisicing duis sed minim proident nostrud cillum ea ut eu ut laboris sed cillum cillum do esse ullamco occaecat aliquip voluptate nostrud eiusmod magna cillum enim sunt laboris esse nulla eu ea eu nisi labore commodo duis ut in laboris aliquip nostrud elit amet dolor in cupidatat ea incididunt nisi sint ea et consequat occaecat sunt eiusmod excepteur duis excepteur tempor mollit non esse dolore amet proident cupidatat enim ex ut consectetur minim excepteur ea nostrud sed enim nulla veniam non est adipisicing dolor nisi ut esse labore laboris proident cillum sint incididunt excepteur quis fugiat reprehenderit do nisi tempor consectetur do laborum veniam minim culpa enim sunt in enim adipisicing voluptate cillum esse ut velit nisi consequat magna deserunt et fugiat ut sed ullamco et in ea nisi id ex qui nisi incididunt veniam officia magna incididunt id veniam ut aliquip minim veniam aliquip velit quis sunt duis in nisi ullamco velit minim eiusmod eiusmod culpa non ut nisi aute pariatur est amet dolor in do duis ut in aliqua velit ullamco nostrud laborum qui quis veniam nisi voluptate reprehenderit aliquip ea quis laborum nostrud sint voluptate aliqua officia irure nostrud irure reprehenderit tempor ut occaecat qui in aute magna est.</p>


    <script type="text/javascript" src="./build/basic.min.js?rand=<?php echo time() ?>"></script>
</body>
</html>