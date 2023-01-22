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


    <div class="modal-panel panel-viewer">
        <section class="modal-panel__content">
            <div class="viewer"></div>
        </section>
    </div>



    <div class="log"></div>
    <div class="controls">
        <button type="button" data-size="cover" data-scroll="0" data-rows="3">Cover 3</button>
        <button type="button" data-size="fw" data-scroll="0" data-rows="3">FW 3</button>
        <button type="button" data-size="fh" data-scroll="0" data-rows="3">FH 3</button>
        <button type="button" data-size="small" data-scroll="0" data-rows="3">Small 3</button>

        <button type="button" data-size="cover" data-scroll="1" data-rows="3">Cover sc 3</button>
        <button type="button" data-size="fw" data-scroll="1" data-rows="3">FW sc 3</button>
        <button type="button" data-size="fh" data-scroll="1" data-rows="3">FH sc 3</button>
        <button type="button" data-size="small" data-scroll="1" data-rows="3">Small sc 3</button>



        <button type="button" data-size="cover" data-scroll="0" data-rows="25">Cover 25</button>
        <button type="button" data-size="fw" data-scroll="0" data-rows="25">FW 25</button>
        <button type="button" data-size="fh" data-scroll="0" data-rows="25">FH 25</button>
        <button type="button" data-size="small" data-scroll="0" data-rows="25">Small 25</button>

        <button type="button" data-size="cover" data-scroll="1" data-rows="25">Cover sc 25</button>
        <button type="button" data-size="fw" data-scroll="1" data-rows="25">FW sc 25</button>
        <button type="button" data-size="fh" data-scroll="1" data-rows="25">FH sc 25</button>
        <button type="button" data-size="small" data-scroll="1" data-rows="25">Small sc 25</button>

        <button type="button" name="resize">Resize</button>
        <button type="button" name="window">Window</button>
    </div>
    <div class="controls controls2">
        <button type="button" name="scroll">Scroll</button>
    </div>

    <div class="app-w">
        <div class="app">
            <div class="r">1</div>
            <div class="r">2</div>
            <div class="r">3</div>
            <div class="r">4</div>
            <div class="r">5</div>
            <div class="r">6</div>
            <div class="r">7</div>
            <div class="r">8</div>
            <div class="r">9</div>
            <div class="r">10</div>
            <div class="r">11</div>
            <div class="r">12</div>
            <div class="r">13</div>
            <div class="r">14</div>
        </div>
    </div>

    <script>
        document.write(navigator.userAgent);
    </script>

    <script type="text/javascript" src="./build/basic.min.js?rand=<?php echo time() ?>"></script>
</body>
</html>